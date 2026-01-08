# Project Rules & Technical Constitution for Roxai

## 🧠 Mindset: "Best-in-Class" & "Evergreen"

Roxai is an Enterprise-Grade SaaS Platform. We prioritize durability, scalability, and modern standards.
**Core Rule:** We always use the **Latest Stable Version** of our core technologies unless a specific version is pinned below for architectural reasons.

---

## 🛠 Tech Stack (Immutable)

### Frontend

- **Framework:** Next.js 15.5.9 (App Router, Src Directory)
- **Language:** TypeScript (Strict Mode)
- **Data Fetching:** TanStack Query (React Query) - _Managed via Orval_
- **State Management:** Zustand (Client Global), React Query (Server State)
- **UI Library:** Tailwind CSS (v4.1) + Shadcn/ui
- **Icons:** Lucide React
- **Integration:** Orval (Auto-generates Hooks & Types from OpenAPI Schema)

### Backend

- **Framework:** Python 3.13.11 with FastAPI
- **Database:** PostgreSQL 17 (Async Drivers).
- **ORM:** SQLAlchemy 2.0+ (Async).
- **Validation:** Pydantic V2.

### Infrastructure & Async Processing

- **Orchestration:** Temporal.io (Strictly no Celery/Redis queues for business logic).
- **Storage:** MinIO (S3 Compatible).
- **Observability:** OpenTelemetry (OTel) + Structured Logging (JSON).
- **Environment:** Docker-First (Dev environment must mirror Production).

---

## 📜 Coding Standards & Patterns

### 1. API First Strategy

- **Backend defines the schema.** We do NOT write manual TypeScript interfaces for API responses.
- **Workflow:**
  1. Define Pydantic Model in Backend.
  2. Auto-generate **API Schema (openapi.json)**.
  3. Run Frontend Generator (Orval) to create typed Hooks.
  4. Use generated hooks in UI.

### 2. Backend Architecture (DDD Lite)

- **Domain Layer:** Pure Python entities/dataclasses. Zero dependencies on DB or Web frameworks.
- **Repository Pattern:** Abstract interfaces separate logic from database implementation.
- **Service/Workflow Layer:** Business logic lives here or in Temporal Workflows.
- **Interface Layer:** Routers/Controllers only handle HTTP request/response validation.

### 3. Frontend Architecture (Feature-Based)

- **Structure:** Code is organized by **Business Feature** (e.g., `features/<feature_name>`), NOT by technical type.
- **Logic Separation:** UI Components must be "Dumb". Complex logic must be extracted to Custom Hooks within the feature folder.
- **RTL Native:** All components must support `dir="rtl"` prop and logical CSS properties (`ms-`, `pe-`).

### 4. Logging & Observability

- **No `print()` statements.**
- Use structured logging libraries to output JSON logs.
- Every request and background task MUST carry a `trace_id` for end-to-end tracing.

### 5. Error Handling Strategy

- **Backend:** Raise specific Domain Exceptions. Global Exception Handler converts them to standardized JSON Error Responses (RFC 7807 problem details).
- **Frontend:** Handle API errors in the Query/Mutation layer (Global Error Boundary or Toast notifications), not in every component.

### 6. Change Management Protocol (The "Console Log")

- **The Source of History:** We maintain a strictly updated `console-log.log` file in the root.
- **Trigger:** Every time a significant decision is made (e.g., changing a tech stack, modifying a Use Case, changing DB schema strategy), it MUST be recorded.
- **Format:**
  - `[Date] - [Category]`
  - `Action:` What changed?
  - `Reason:` Why did we change it? (Crucial for preventing regressions).

---

## 🚫 Forbidden Practices

- ❌ **No Magic Strings:** Always use Enums or Constant variables.
- ❌ **No Direct Fetch Calls:** Direct usage of `fetch()` or `axios` is prohibited. Always use the generated API client.
- ❌ **No Inline Styles:** Tailwind utility classes are mandatory.
- ❌ **No Logic in JSX:** Keep render functions clean. Extract logic to hooks or helper functions.
- ❌ **No Hardcoded Versions:** Do not pin dependencies to old versions in `package.json` without a documented security/bug reason.
