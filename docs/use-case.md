# Use Cases & Functional Requirements for Roxai

### UC-01: Auth System

- FeatureName: Smart Hybrid Auth System (Mobile/Email/Google)
- ProductContext: Enterprise-Grade AI PowerPoint Generator (SaaS) - Iran Market Focused
- Description: A smart, multi-step authentication flow optimized for Iranian users. The entry point is a single input field that accepts either Email or Mobile. The system automatically detects the input type and user status. It enforces a "Verification First" approach for new users and handles session management securely.
- TargetUsers: Guest, Pending User, Free User, Pro User, Admin, Support.
- MainUseCases:
  1. **Step 1 (Discovery):** User enters identifier. Backend validates format (Regex) and checks DB for existence/status.
  2. **Scenario A (Existing User):** System prompts for credentials based on set methods (Password or OTP).
  3. **Scenario B (New User):** System initiates the Registration Flow. Generates a secure OTP, and dispatches via SMS/Email provider. User must verify OTP _before_ setting a password.
  4. **Scenario C (OAuth):** User authenticates via Google. System handles account linking (merging by email if applicable) automatically.
  5. **Logout:** Server-side session invalidation and client-side secure cookie clearance.
- TechStack:
  - Backend: Python 3.12 (FastAPI), (OTP TTL & Rate Limiting), PostgreSQL.
  - Frontend: Next.js 15, Auth.js v5 (Stateless Session), React Hook Form, Zod.
- Constraints:
  - **Best Practice:** Use HTTP-Only, SameSite=Strict cookies for JWT storage (No LocalStorage).
  - **Security:** Implement strict Rate Limiting on OTP endpoints (e.g., Leaky Bucket algorithm) to prevent SMS pumping.
  - **RTL Native:** All UI components must handle Right-to-Left directionality natively.
- EdgeCases:
  - **Input Switching:** User changes input type mid-process (State must allow graceful reset).
  - **Provider Failure:** SMS provider timeout -> System must allow fallback to Email if available.
- NonFunctionalNeeds:
  - **Performance:** Auth API latency < 200ms.
  - **Reliability:** survive restarts without losing active OTPs.
- Dependencies: SMS Provider API, Google OAuth Credentials.

---

### UC-02: Project Dashboard & Workspace

- FeatureName: Project Dashboard & Workspace
- ProductContext: Enterprise-Grade AI PowerPoint Generator (SaaS)
- Description: The central hub for presentation management. It acts as a high-performance "Launchpad" for creating new projects via various input methods and managing existing ones.
- TargetUsers: Free User, Pro User.
- MainUseCases:
  1. **Dashboard Load:** Efficient fetching of user projects with server-side pagination and thumbnail lazy-loading.
  2. **Creation Entry Points:** User selects from available input modes (Topic, File, Text, URL) to trigger the Wizard (UC-03).
  3. **Project Management:** User performs CRUD operations (Rename, Duplicate, Soft Delete).
  4. **Real-time Status:** Dashboard subscribes to project status updates (Polling/SSE) to show "Generating" progress bars without manual refresh.
  5. **Search & Filter:** Client-side filtering for immediate feedback on project lists.
- TechStack:
  - Backend: FastAPI, SQLAlchemy (Async), PostgreSQL (JSONB for flexible metadata).
  - Frontend: Next.js 15, TanStack Query v5 (Caching & Optimistic Updates), Shadcn/ui.
- Constraints:
  - **Optimistic UI:** Actions (Delete/Rename) must update the UI immediately, then sync with the server.
  - **Scalability:** The list API must support cursor-based pagination for performance on large datasets.
- EdgeCases:
  - **Concurrent State:** User deletes a project while it is in the "Processing" state (Backend must cancel the associated Workflow).
  - **Asset Failure:** Graceful fallback UI if a thumbnail fails to load from Storage.
- NonFunctionalNeeds:
  - **Performance:** Largest Contentful Paint (LCP) < 1.0s.
  - **Accessibility:** Full keyboard navigation support (Tab/Arrow keys) for the grid layout.
- Dependencies: Auth System, MinIO Service.

---

### UC-03: Smart AI Creation Wizard (Multi-Model Engine)

- FeatureName: Smart AI Creation Wizard (Core Inputs)
- ProductContext: Enterprise-Grade AI PowerPoint Generator (SaaS)
- Description: The core creation engine. A multi-step form that orchestrates the AI generation process. It abstracts complexity by collecting high-level user intents (Topic, Tone, Audience) and mapping them to detailed AI prompts.
- TargetUsers: Free User, Pro User.
- MainUseCases:
  1. **Input Selection:** User chooses the source material type (Text, File, or URL).
  2. **Smart Configuration:** User configures generation parameters via dynamic selectors:
     - **Language:** Selection of supported output languages (Strict RTL/LTR handling).
     - **Scene/Context:** Selection from a backend-driven list of presentation types.
     - **Audience:** Specification of target demographic/expertise level.
     - **Tone:** Selection of the narrative style.
     - **Length:** Selection of desired depth/slide count range.
  3. **Source Processing:**
     - **File:** Asynchronous upload and text extraction (OCR/Parsing).
     - **URL:** Web scraping and content cleaning.
  4. **Outline Generation:** System proposes a hierarchical structure (JSON). User reviews and modifies the structure before final commitment.
  5. **Execution:** Submission triggers a Temporal Workflow.
- TechStack:
  - Frontend: Next.js 15, React Hook Form (Complex State Management).
  - Backend: Temporal.io (Orchestration), Unstructured.io (ETL), (LLMs).
- Constraints:
  - **Code Quality:** Use the "Strategy Pattern" in backend to handle different input types (FileStrategy, UrlStrategy) extensibly.
  - **Data Handling:** Strict validation of input length and file types (Magic Byte check) before processing.
- EdgeCases:
  - **Token Overflow:** Input content exceeds LLM context window -> System must implement a "Summarization/Chunking" step.
  - **Content Policy:** AI refusal due to safety filters -> UI must display a clear, non-technical error.
- NonFunctionalNeeds:
  - **UX:** "Invisible Waiting" pattern (Progress steps) to manage user perception during long generation times (60s+).
  - **Resiliency:** Workflow must automatically retry on transient AI API failures (503 errors).
- Dependencies: Auth System, AI Provider APIs.

---

### UC-04: Interactive Slide Editor & Export Engine

- FeatureName: Interactive Slide Editor & Export Engine
- ProductContext: Enterprise-Grade AI PowerPoint Generator (SaaS)
- Description: A specialized "Structured Editor" allowing users to refine AI-generated content. It separates the "View/Edit" logic from the "Export" logic to enforce monetization strategies securely.
- TargetUsers: Free User, Pro User.
- MainUseCases:
  1. **Editor Layout:** Split-pane view (Thumbnails + Active Slide) with RTL support.
  2. **Content Manipulation:** Block-based editing of text and replacement of media assets.
  3. **Regeneration:** Context-aware "Regenerate" actions for specific images or text blocks.
  4. **Global Styling:** Applying system-wide design tokens (Themes/Fonts) instantly.
  5. **Export & Sharing (The Paywall):**
     - **Free Tier:** Access restricted to a read-only, public web viewer URL. Download endpoints are protected.
     - **Pro Tier:** Access to high-fidelity export generation (Native PPTX with embedded assets).
- TechStack:
  - Frontend: Next.js 15, TipTap (Headless Rich Text), Fabric.js (Canvas rendering if needed).
  - Backend: python-pptx (XML Manipulation), MinIO.
- Constraints:
  - **Security:** Export endpoints must verify subscription status via Middleware (RBAC).
  - **Fidelity:** The Web Viewer CSS must strictly match the output PPTX styles (1:1 visual parity).
- EdgeCases:
  - **Subscription Expiry:** Logic to determine if previously generated links remain accessible after a Pro user downgrades.
- NonFunctionalNeeds:
  - **Performance:** Text inputs must be "Lag-free" (Optimistic State).
  - **SEO:** Publicly shared presentation links (Free tier) must be indexable (Server-Side Rendered metadata).

---

### UC-05: Admin Dashboard & Marketing Platform

- FeatureName: Admin Dashboard & Marketing Platform
- ProductContext: Enterprise-Grade AI PowerPoint Generator (SaaS)
- Description: The comprehensive management suite. It includes the high-performance Landing Page (Marketing) and the secure Admin Panel for user/subscription management.
- TargetUsers: Guest, Admin, Support.
- MainUseCases:
  1. **Landing Page:** SEO-optimized marketing pages with high conversion elements (Hero, Demo, Pricing).
  2. **Admin Authentication:** Strict, separate login flow or Role-Based protection for the `/admin` route.
  3. **User Management:** Grid view of users with status filters and "Impersonate" or "Manual Upgrade" capabilities for support.
  4. **Analytics:** Dashboard visualization of key business metrics (Registration Rate, Churn, Revenue).
- TechStack:
  - Frontend: Next.js 15 (ISR/SSG for Marketing), Shadcn/ui (Data Tables for Admin).
  - Backend: FastAPI (Admin Router), dependency injection for superuser validation.
- Constraints:
  - **SEO Best Practices:** Semantic HTML5, proper Meta Tags, JSON-LD Schema Markup, and Core Web Vitals optimization on Landing Pages.
  - **Security:** Admin actions must be immutable and logged (Audit Trail).
- EdgeCases:
  - **Self-Lockout:** Prevention logic to ensure the last Super Admin cannot be deleted/demoted.
- NonFunctionalNeeds:
  - **Page Speed:** Landing Page Performance score > 95 on Lighthouse.
  - **Responsiveness:** Admin panel must remain functional on mobile devices for emergency access.
