# Master Functional Requirements & Use Cases for Roxai (Enterprise Edition)

> **NOTE:** This document contains abstract functional definitions. It serves as the INPUT source for generating detailed PRDs. No specific data examples are included to maintain strictly logical definitions.

---

### UC-01: Unified Authentication & Identity Management

- **FeatureName:** Hybrid Identity Provider & Session Management
- **ProductContext:** Roxai Platform (SaaS & Enterprise)
- **Description:** A centralized authentication gateway handling identity verification, session lifecycle, and security enforcement. It abstracts the complexity of supporting multiple identity sources (Local Credentials, Mobile OTP, Enterprise SSO) behind a unified interface. It enforces security policies such as rate limiting, session revocation, and role-based access control (RBAC) initialization upon login.
- **TargetUsers:** Guest, Registered User, Organization Admin, Super Admin.
- **MainUseCases:**
  1.  **Identity Discovery:** The system analyzes the user identifier input to determine the authentication flow (Local Password, OTP, or SSO redirection) without exposing existence errors.
  2.  **Credential Verification:** The system validates provided credentials (Password or OTP) against stored hashes or verifies external IdP tokens.
  3.  **Registration Flow:** The system creates new entity records after successful verification of ownership (Mobile/Email) and enforces mandatory profile completion steps.
  4.  **Session Initialization:** Upon success, the system issues secure, HTTP-only, strictly scoped tokens/cookies and records the session metadata (IP, User Agent) for audit.
  5.  **Session Termination:** The system invalidates active tokens on the server side and instructs the client to purge local storage upon explicit logout or security triggers.
- **TechStack:**
  - **Backend:** Python (FastAPI), Redis (Session Store & Rate Limiting), SQLAlchemy.
  - **Frontend:** Next.js 15, Auth.js v5 (Custom Providers for Iranian SMS & SSO).
- **Constraints:**
  - The system must enforce strict Rate Limiting on all public verification endpoints to prevent resource exhaustion attacks.
  - All sensitive operations must utilize atomic database transactions.
  - Passwords must never be stored in plain text; strong hashing algorithms (Argon2) are mandatory.
- **EdgeCases:**
  - Upstream SMS provider timeout or failure.
  - Concurrent login attempts from disparate geographical locations (Velocity checks).
  - Race conditions during account creation for the same identifier.
- **NonFunctionalNeeds:**
  - **Security:** Compliance with OWASP Top 10 authentication guidelines.
  - **Performance:** Authentication handshake latency must remain below strict thresholds (e.g., 200ms).
  - **Availability:** Critical path dependency; high availability is required.
- **Dependencies:** Notification Service (SMS/Email), Redis Service, Database Service.
- **Risks:** Third-party provider outages (SMS gateways) impacting user acquisition.

---

### UC-02: Advanced Block-Based Editor Core

- **FeatureName:** Fluid Block Editor Engine (Canvas)
- **ProductContext:** Roxai Workspace (Core Feature)
- **Description:** A comprehensive, document-like editing interface that treats content as modular blocks rather than static slides. This engine handles the creation, manipulation, hierarchy, and rendering of content blocks. It manages the real-time state of the document, enforcing structural integrity and enabling granular formatting operations independent of the final visual layout.
- **TargetUsers:** Content Creators, Editors, Reviewers.
- **MainUseCases:**
  1.  **Block Insertion & Manipulation:** Users insert various block types (Text, Heading, Image, Code, Embed) and modify their properties (attributes, content).
  2.  **Structural Reordering:** Users modify the sequence and hierarchy of blocks via drag-and-drop or keyboard commands, triggering state updates without page reloads.
  3.  **Smart Pagination Logic:** The system automatically calculates content overflow and distributes blocks across logical containers (cards/slides) based on visual density rules.
  4.  **AI Contextual Operations:** Users trigger localized AI operations on specific blocks (Refine, Translate, Expand) utilizing the block's current content as context.
  5.  **State Synchronization:** The editor emits state changes to the local store and synchronizes with the remote persistence layer using optimistic UI updates.
- **TechStack:**
  - **Frontend:** Next.js 15, Tiptap (Headless Editor), Zustand (State), Dnd-kit.
  - **Backend:** FastAPI, Pydantic (Schema Validation).
- **Constraints:**
  - The editor must strictly support Right-to-Left (RTL) text direction and bidirectional mixing at the block level.
  - Content must be stored as structured JSON, not HTML strings, to ensure export fidelity.
- **EdgeCases:**
  - Handling of unsupported content pasted from external clipboards.
  - Network disconnection during active editing (Offline support requirements).
  - Extremely deeply nested block structures impacting rendering performance.
- **NonFunctionalNeeds:**
  - **Responsiveness:** Typing latency must be imperceptible (under 50ms).
  - **Accessibility:** Full keyboard navigability for all editing operations.
- **Dependencies:** Media Storage Service (for asset blocks), AI Service (for copilot features).
- **Risks:** Complexity of rich-text parsing and sanitization leading to XSS vulnerabilities.

---

### UC-03: AI Orchestration & Generation Workflow

- **FeatureName:** Configurable AI Generation Engine (Gamma-Like API)
- **ProductContext:** Roxai Generation Engine
- **Description:** An asynchronous, event-driven orchestration system responsible for converting structured user intents into presentation content. Unlike simple chatbots, this engine accepts a complex JSON configuration (Tone, Audience, Language, Source Material) to tailor the output. It manages long-running workflows via Temporal, ensuring fault tolerance and scalability.
- **TargetUsers:** Content Creators (Pro/Free).
- **MainUseCases:**
  1.  **Structured Ingestion:** The system validates a `generation_config` JSON payload containing the prompt, source type (text/file/url), tone (e.g., Professional, Witty), and target audience.
  2.  **Credit Validation:** Before execution, the system calculates the estimated cost (e.g., 40 credits) and locks the user's balance.
  3.  **Workflow Execution:** The system initiates a durable workflow (Outline -> Expansion -> Image Generation) using the specific configuration parameters.
  4.  **Real-time Streaming:** The system broadcasts partial progress (e.g., "Generating Slide 3...") to the client.
  5.  **Failure Recovery:** If an AI provider fails, the system retries with exponential backoff without losing the user's credits or request state.
- **TechStack:**
  - **Orchestration:** Temporal.io.
  - **Data Structure:** JSONB (for `generation_config` storage).
  - **AI Providers:** OpenAI/Anthropic.
- **Constraints:**
  - Input prompts must be sanitized to prevent prompt injection attacks.
  - The "Tone" and "Audience" settings must strongly influence the system prompt sent to the LLM.
- **EdgeCases:**
  - User requests generation in an unsupported language.
  - Source text is too long for the LLM context window (requires chunking strategy).
- **NonFunctionalNeeds:**
  - **Reproducibility:** The same config should produce similar structural results.
- **Dependencies:** Credit Ledger, AI Service.

---

### UC-04: Subscription & Credit System (SaaS Model)

- **FeatureName:** Hybrid Subscription & Wallet Manager
- **ProductContext:** Roxai Business Platform
- **Description:** The financial backbone of the platform, modeled after modern SaaS standards (e.g., Gamma). Instead of direct monetary charges per action, users subscribe to tiers (Free, Plus, Pro) which grant a monthly allowance of "AI Credits". The system handles recurring billing, monthly credit resets, and top-up purchases.
- **TargetUsers:** Workspace Owners, Finance Admins.
- **MainUseCases:**
  1.  **Tiered Subscription:** Users purchase monthly/annual plans (Plus, Pro) to unlock features (Remove Watermark) and increase credit caps.
  2.  **Monthly Reset Logic:** A scheduled job runs monthly to reset the user's credit balance to their plan's cap (e.g., 400 for Free, 4000 for Pro).
  3.  **Consumption:** Credits are deducted per action (e.g., 10 credits per slide, 5 per image edit).
  4.  **Top-Ups:** Users running out of credits mid-month can purchase one-time credit packs without changing their plan.
  5.  **Plan Downgrade/Expiry:** Upon subscription expiry, the user reverts to the "Free" tier limits and features.
- **TechStack:**
  - **Backend:** FastAPI, PostgreSQL.
  - **Scheduling:** Temporal Cron (for monthly resets).
  - **Payment:** ZarinPal / Zibal.
- **Constraints:**
  - Credit deduction must be atomic to prevent race conditions (Double Spending).
  - Users must clearly see the "Cost in Credits" before confirming an action.
- **EdgeCases:**
  - Payment callback arrives after the subscription has technically expired.
  - A scheduled credit reset happens exactly while a user is generating content.
- **NonFunctionalNeeds:**
  - **Auditability:** Every credit deduction must be logged in a `ledger` table.
- **Dependencies:** Identity Provider.

---

### UC-05: Export & Rendering Engine

- **FeatureName:** High-Fidelity Multi-Format Exporter
- **ProductContext:** Roxai Output Service
- **Description:** A dedicated rendering engine responsible for translating the internal JSON block structure into standard portable formats (PDF, PPTX). This engine handles complex layout calculations, font embedding (specifically for RTL languages), media embedding, and vector graphics generation to ensure the output matches the web-based visualization.
- **TargetUsers:** Pro Users, Enterprise Users.
- **MainUseCases:**
  1.  **Format Conversion:** The system maps internal block definitions to format-specific schemas (e.g., OpenXML for PowerPoint).
  2.  **Layout Mapping:** The system translates flexible web layouts (Grid/Flex) into absolute positioning coordinates required by slide formats.
  3.  **Asset Embedding:** The system downloads, optimizes, and embeds remote media assets directly into the binary file.
  4.  **Font Injection:** The system embeds required font subsets to ensure correct rendering of RTL text on client machines.
  5.  **Delivery:** The system generates the binary file, uploads it to temporary storage, and generates a secure download link.
- **TechStack:**
  - **Backend:** Python, python-pptx, ReportLab/WeasyPrint (for PDF).
  - **Storage:** MinIO.
- **Constraints:**
  - Export generation must not block the main web server threads (CPU bound task).
  - Strict adherence to file size limits for the generated output.
- **EdgeCases:**
  - Corrupted media assets preventing file assembly.
  - Unsupported characters or emojis in the source text.
  - Layout overflow where content exceeds the fixed slide boundaries (Auto-scaling logic).
- **NonFunctionalNeeds:**
  - **Fidelity:** The visual output must closely resemble the web preview.
  - **Performance:** Export time must be reasonable relative to the complexity of the document.
- **Dependencies:** Object Storage, Block Editor Schema.
- **Risks:** Inconsistencies between web rendering engines (CSS) and document rendering engines.

---

### UC-06: Internal Operations & Support Console (Admin Panel)

- **FeatureName:** Super Admin & Tenant Support Dashboard
- **ProductContext:** Roxai Internal Tools
- **Description:** A restricted, high-privilege interface designed for system administrators and support staff. It provides visibility into user activity, subscription states, and system health. It includes critical operational tools such as "User Masquerading" (Impersonation) for debugging and "Manual Credit Adjustment" for resolving billing disputes without database access.
- **TargetUsers:** Super Admin, Customer Support Agent.
- **MainUseCases:**
  1.  **User Management:** Administrators search, filter, and view detailed user profiles, including activity logs and current subscription status.
  2.  **Manual Ledger Intervention:** Administrators manually credit or debit user wallets to resolve support tickets (e.g., refunding failed generations), with mandatory audit note enforcement.
  3.  **Secure Impersonation:** Administrators generate a temporary, short-lived session to log in _as_ a specific user to reproduce reported bugs (triggered via a secure handshake protocol).
  4.  **System Telemetry:** A dashboard view displaying real-time queue depth (Temporal), active generation count, and error rates to monitor platform health.
  5.  **Feature Flagging:** Administrators toggle beta features for specific users or global segments without redeploying code.
- **TechStack:**
  - **Frontend:** Next.js 15 (Admin Layout), Shadcn/ui (Data Tables), Tremor (Charts).
  - **Backend:** FastAPI (Dependency-Injected Admin Routes).
- **Constraints:**
  - **Security:** The admin panel must be accessible ONLY via a dedicated sub-route or subdomain protected by strict Role-Based Access Control (RBAC) and IP whitelisting if possible.
  - **Audit Trail:** Every single action taken by an admin (especially write operations) must be immutably logged.
- **EdgeCases:**
  - Admin accidentally modifying their own permissions (Self-Lockout prevention).
  - Impersonation session persisting longer than intended (Auto-expiry enforcement).
- **NonFunctionalNeeds:**
  - **Data Density:** The UI should be optimized for information density (tables over cards) to facilitate rapid scanning.
  - **Safety:** Destructive actions (Ban User, Delete Team) must require double-confirmation or explicit text input.
- **Dependencies:** User Service, Billing Service, Temporal Client.
- **Risks:** Abuse of admin privileges leading to data leaks.

---

### UC-07: User Personal Workspace & Project Library

- **FeatureName:** Project Dashboard & Asset Management
- **ProductContext:** Roxai User Platform
- **Description:** The central hub for authenticated users. It serves as the entry point after login, providing a unified view of the user's digital assets (presentations), resource consumption (credits), and account settings. It manages the lifecycle of a project _outside_ of the editing canvas (Create, Rename, Archive, Delete) and acts as the launchpad for the AI generation workflow.
- **TargetUsers:** All Authenticated Users.
- **MainUseCases:**
  1.  **Project Grid Visualization:** Display user projects with a Title, Status Badge (Draft/Generating/Done), Last Edited Date, and a visual Thumbnail.
  2.  **New Project Trigger:** A prominent entry point to start the `generation_config` flow (UC-03).
  3.  **Organization:** Users can Rename, Duplicate, or Archive (Soft Delete) projects.
  4.  **Credit Visibility:** The current credit balance and plan badge (e.g., "Pro") are persistently visible in the layout.
  5.  **State Reflection:** If a project is currently being generated by AI, the card shows a progress bar instead of a thumbnail.
- **TechStack:**
  - **Frontend:** Next.js 15, Shadcn/ui (Cards, Dropdowns).
  - **Backend:** FastAPI, PostgreSQL (New `projects` table).
- **Constraints:**
  - **Performance:** Thumbnails should be lazy-loaded.
  - **Access Control:** Users can strictly only see/edit projects where `user_id` matches their own (Tenant Isolation).
- **EdgeCases:**
  - User tries to open a project that is still in "Generating" state (Show loading screen).
  - Thumbnail generation fails (Fallback to a generated placeholder icon).
- **NonFunctionalNeeds:**
  - **Zero-Data State:** A compelling "Empty State" UI that encourages the first creation.
- **Dependencies:** Auth Service, Project Repository.

---

### UC-08: Public Marketing & Conversion Portal (Landing Page)

- **FeatureName:** High-Performance Marketing Front
- **ProductContext:** Roxai Public Website
- **Description:** The public-facing entry point of the platform. Its primary goal is conversion. It utilizes advanced rendering techniques (SSG/ISR) to ensure instant loading and SEO dominance. It showcases the product's capabilities via interactive demos, pricing tables, and localized content (Persian) to build trust.
- **TargetUsers:** Anonymous Visitors, Potential Leads.
- **MainUseCases:**
  1.  **Value Proposition Display:** clearly communicating the "pain killer" features (AI Presentation Generator) with high-quality localized copy and assets.
  2.  **Interactive Playground (Lead Magnet):** A simplified, no-auth "Try it now" input field that generates a limited preview to hook the user, then prompts for registration to see the full result.
  3.  **Pricing & Comparison:** Dynamic display of subscription tiers and feature comparison matrices to drive upgrade intent.
  4.  **SEO & Schema Integration:** Automatic generation of JSON-LD structured data and meta tags to ensure high ranking for relevant Persian keywords.
  5.  **Onboarding Handoff:** Seamless redirection to the main application (Authentication flow) preserving the user's initial input (e.g., the topic they typed in the hero section).
- **TechStack:**
  - **Frontend:** Next.js 15.
  - **Rendering:** Incremental Static Regeneration (ISR) for blog/content pages.
- **Constraints:**
  - **Performance:** Largest Contentful Paint (LCP) must be under 1.2s.
  - **Mobile First:** The design must be fully responsive, as most Iranian traffic will originate from mobile devices.
- **EdgeCases:**
  - Marketing content desyncing from the actual application pricing logic.
  - Heavy traffic load on the landing page affecting the application performance (Isolation strategy required).
- **NonFunctionalNeeds:**
  - **SEO:** Must score 100/100 on Lighthouse SEO audit.
  - **Accessibility:** Must support screen readers and keyboard navigation.
- **Dependencies:** CMS (optional) or Hardcoded MDX content.
- **Risks:** High bounce rate due to slow loading assets (Images/Videos).
