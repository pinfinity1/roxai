# System Architecture & Design for Roxai

## 1. High-Level Architecture

This system is designed as an **Event-Driven, Asynchronous SaaS Platform**.
We decouple the "Request" (User clicking button) from the "Execution" (AI generating slides) using **Temporal Workflows**.

### 🔄 Data Flow (The "Async" Loop)

1. **Client (Next.js):** Sends `POST /api/projects` with topic & settings.
2. **API (FastAPI):** Validates input -> Starts a **Temporal Workflow** -> Returns `workflow_id` immediately.
3. **Orchestrator (Temporal Server):** Queues the workflow steps.
4. **Worker (Python):** Picks up tasks (Activities):

- _Activity 1:_ Generate Outline (LLM).
- _Activity 2:_ Generate Images (DALL-E/Stable Diffusion).
- _Activity 3:_ Build PPTX (python-pptx).
- _Activity 4:_ Upload to MinIO.

5. **Client:** Polls (via React Query) or receives SSE/Webhook when status changes.

---

## 2. Backend Structure (Python/FastAPI)

We follow **Domain-Driven Design (DDD)** principles to keep business logic independent of the framework.

backend/
├── src/
│ ├── domain/ # 🧠 THE CORE (Pure Python Logic)
│ │ │ # ❌ NO Database imports, NO Web imports
│ │ ├── entities/ # Data Structures (Data Classes)
│ │ │ └── <entity>.py # e.g., project.py, user.py
│ │ ├── exceptions.py # Custom Domain Errors
│ │ └── interfaces.py # Abstract Base Classes (Protocols) for Repositories
│ │
│ ├── application/ # ⚙️ THE USE CASES (Orchestration)
│ │ ├── workflows/ # ★ Temporal Workflows
│ │ │ └── <process>\_wf.py # Defines the long-running process flow
│ │ ├── activities/ # ★ Temporal Activities
│ │ │ └── <domain>\_act.py # Atomic tasks (call AI, save file)
│ │ └── services/ # Synchronous Business Logic
│ │ └── <domain>\_srv.py # e.g., auth_service.py
│ │
│ ├── infrastructure/ # 🔌 THE ADAPTERS (External World)
│ │ ├── db/
│ │ │ ├── models/ # SQLAlchemy Tables
│ │ │ └── repositories/ # Implementation of Domain Interfaces
│ │ ├── external/ # 3rd Party APIs (OpenAI, Stripe)
│ │ └── storage/ # File Systems (MinIO/S3)
│ │
│ └── presentation/ # 🌐 THE INTERFACE (Entry Points)
│ ├── api/
│ │ └── v1/
│ │ └── <resource>.py # FastAPI Routes (Controllers)
│ └── schemas/ # Pydantic DTOs (Data Transfer Objects)
│
└── ...

### 🧱 Scalability Rules for Backend:

1. **New Entity?** Create `domain/entities/new_thing.py`.
2. **New Business Logic?** If it takes > 2 seconds, create a `Workflow`. If instant, create a `Service`.
3. **New Database Table?** Define SQLAlchemy model in `infrastructure` but interact ONLY via `Repository Interface` defined in `domain`.

---

## 3. Frontend Structure (Next.js 15)

We follow **Feature-Based Architecture**. Everything related to a specific feature stays together.

frontend/
├── src/
│ ├── app/ # 🌍 ROUTING LAYER (Next.js)
│ │ ├── (public)/ # Marketing pages
│ │ ├── (auth)/ # Login/Register pages
│ │ └── (dashboard)/ # Protected App pages
│ │ └── <feature-route>/# Maps URL to Feature Views
│ │
│ ├── components/
│ │ ├── ui/ # 🧱 ATOMIC DESIGN (The Design System)
│ │ │ # Generic, Reusable, "Dumb" (Shadcn/ui)
│ │ │ ├── button.tsx, input.tsx, ...
│ │ └── layout/ # Global Shell (Sidebar, Navbar)
│ │
│ ├── features/ # ★ THE DOMAIN MODULES (Scalable Part)
│ │ └── <feature-name>/ # e.g., 'ppt-builder', 'billing', 'team'
│ │ ├── components/ # UI components specific ONLY to this feature
│ │ ├── hooks/ # Business Logic & State specific to this feature
│ │ ├── types/ # TS Interfaces specific to this feature
│ │ └── utils/ # Helper functions specific to this feature
│ │
│ ├── lib/
│ │ ├── api/ # 🤖 GENERATED LAYER (Orval)
│ │ │ ├── <tag>.ts # Auto-generated React Query Hooks
│ │ │ └── model/ # Auto-generated Zod/TS schemas
│ │ └── utils.ts # Global Helpers (cn, date formatting)
│ │
│ └── store/ # 📦 GLOBAL STATE (Zustand)
│ └── use-<context>-store.ts # Only for truly global UI state

### 🧱 Scalability Rules for Frontend:

1. **Shared vs. Specific:** If a component (e.g., `UserCard`) is used in **two** features, move it to `components/shared`. If only used in `billing`, keep it in `features/billing/components`.
2. **API Data:** Never manually fetch data. Use the hooks generated in `lib/api`.
3. **Logic:** Do not write complex logic inside `app/page.tsx`. Import a view or container from `features/<name>`.

---

## 4. Data Architecture & Persistence Pattern

We use **PostgreSQL 17** with a **Strict Schema + Flexible Content** strategy.
The database design must follow these architectural rules to ensure consistency and scalability.

### 4.1. Core Design Standards

All database models must adhere to these strict rules:

- **Primary Keys:** **UUIDv4 (or UUIDv7)** is mandatory for ALL tables. **No Integer IDs**.
- _Why:_ Security (prevents enumeration), Merging (easy data migration), Client-side generation.

- **Timestamp Precision:** All time columns (`created_at`, `updated_at`) must be stored in **UTC** with timezone awareness.
- **Soft Deletes:** Key business entities must implement "Soft Delete" using a `deleted_at` timestamp. Do not `DELETE` rows physically.
- **Naming Convention:**
- **Tables:** `snake_case` and **plural** .
- **Columns:** `snake_case`.
- **Foreign Keys:** `target_singular_id`.

### 4.2. Schema Patterns (The "How-To")

#### Pattern A: The Stateful Entity (State Machine)

For any entity that goes through a lifecycle .

- **Requirement:** Must use PostgreSQL **ENUM** types for the `status` column.
- **Indexing:** Must index the `status` column for fast filtering.
- **Audit:** Must allow linking to an external orchestration ID.

#### Pattern B: The Hybrid Document (JSONB)

For entities with variable structure or rapidly changing fields.

- **Requirement:** Use **JSONB** column types.
- **Rule:** Do not create separate tables for Key-Value pairs. Store them in a `meta` or `content` JSONB column.
- **Indexing:** Use **GIN Indexes** on the JSONB column if searching within keys is required.

#### Pattern C: The Asset Reference

For binary files (Images, PPTX, PDFs , ...).

- **Requirement:** **NEVER** store binary data (BLOB) in PostgreSQL.
- **Storage:** Store the `storage_key` (MinIO path) and `content_type` in the DB. The actual file lives in Object Storage.

### 4.3. Migration Rules (Alembic)

- **Version Control:** Every schema change must have a corresponding Alembic migration file.
- **Down-migrations:** Every migration must have a working `down()` method to rollback changes.
- **No Auto-Generate Blindly:** Always review auto-generated migrations for naming constraints and index types.

---

## 5. Infrastructure & DevOps

All services run via Docker Compose for local development to mirror production.

- **App Service:** FastAPI (Port 8000)
- **Worker Service:** Python Worker (Consumes Temporal Tasks)
- **Frontend:** Next.js (Port 3000)
- **DB:** PostgreSQL 17
- **Orchestrator:** Temporal Server + Web UI (Port 8080)
- **Storage:** MinIO (Port 9000)
- **Observability:** Jaeger/Tempo (Tracing)
