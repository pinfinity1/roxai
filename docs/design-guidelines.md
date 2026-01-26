# UI/UX Design Guidelines & System for Roxai

## 🎨 Design Philosophy

**"Invisible Intelligence"**
The interface should be clean, distraction-free, and content-first. The AI complexity must be abstracted behind simple, elegant interactions without overwhelming the user.

- **Style:** Modern, Minimalist, SaaS-Oriented.
- **Vibe:** Trustworthy, High-Performance.
- **Mode:** Light Mode

---

## 🎨 Smart Theming System (The "Remix" Engine)

Unlike traditional tools, users do not manually pick colors for every element. They select a **"Theme Preset"**.

### The "One-Click Remix" Philosophy

Every Theme Preset is a JSON object containing:

- **Base Fonts:** (Header & Body pair)
- **Color Palette:** (Background, Text, Accent, Surface)
- **Card Style:** (Border radius, Shadow depth, Glassmorphism)

## **Rule:** When a user clicks a new Theme, the entire UI (Editor & Viewer) must update instantly via CSS Variables, without a page reload.

---

## 🔤 Typography (Strict)

We use a dual-font stack to ensure perfect rendering for both Persian (Farsi) and English.

### Font Family

- **Persian (Primary):** `Vazirmatn` (Used for all UI elements and Body text).
- **English (Secondary):** `Inter` or `Geist Sans` (Used for English numbers or technical terms).
- **Code:** `Geist Mono` or `Fira Code`.

### Font Weights

- **Regular (400):** Body text, Inputs, standard reading content.
- **Medium (500):** Buttons, Navigation items, Subtitles, Interactive elements.
- **Bold (700):** High-level Headings, Emphasized statistics, Call-to-Actions.

### Class Utility Strategy (Tailwind)

Usage: The `font-sans` utility class must be applied globally to the root, ensuring the variable stack is used by default throughout the application.

---

## 🎨 Color Palette (Semantic Implementation)

We use the standard **Shadcn "Blue"** base layer. This conveys trust, stability, and intelligence suitable for an enterprise SaaS.

### Semantic Definitions

- **Primary:** The dominant brand color. Used for: High-priority actions, Submit buttons, Active states.
- **Secondary:** Supportive neutral tones. Used for: Card backgrounds, Secondary actions, Borders.
- **Destructive:** Critical alert colors. Used for: Irreversible actions, Deletions, Errors.
- **Muted:** Low-contrast neutrals. Used for: Metadata, Hints, Placeholder text.
- **Accent:** Highlight colors. Used for: Warnings, Premium features, Special badges.

### Rules

- ✅ **Enforcement:** Always use semantic utility classes (e.g., `bg-primary`, `text-destructive`).
- ❌ **Forbidden:** Hardcoded hex values or arbitrary color names (e.g., `bg-blue-500`) are strictly prohibited to maintain theme consistency.

---

## 📐 Layout & Spacing (RTL Native)

**CRITICAL:** This is a Right-to-Left (RTL) application. All layout logic must use logical properties, never physical directions.

### The "Logical Properties" Rule

- ❌ **Forbidden:** Physical properties (margin-left, padding-right, left, right).
- ✅ **Required:** Logical properties (margin-start, margin-end, padding-start, padding-end, start, end).

### Utility Mapping

- Use `ms-*` / `me-*` for margins.
- Use `ps-*` / `pe-*` for paddings.
- Use `start-*` / `end-*` for positioning.

---

## 🧩 Components & Behaviors

### 1. Buttons

- **Primary Variant:** Solid high-contrast background. Used for the main action on a screen.
- **Ghost/Outline Variant:** Transparent or bordered. Used for secondary or negative actions.
- **Loading State:** Must replace content with a standardized Spinner component and enforce a disabled state to prevent double-submission.

### 2. Cards

- **Structure:** Defined border radius, subtle border color, and consistent padding.
- **Interaction:** Hover states should provide subtle elevation or border-color shifts to indicate interactivity.

### 3. Status Badges

- **Success:** Semantic green/positive tokens.
- **Processing:** Semantic blue/info tokens with active pulse animations.
- **Error:** Semantic red/destructive tokens.
- **Neutral:** Semantic gray/muted tokens.

### 4. AI Feedback

- **Skeleton:** Use shimmering skeleton loaders for initial data fetching.
- **Progress Indication:** Use deterministic progress bars for multi-step background workflows.
- **Non-blocking Feedback:** Use Toast notifications for background completions, avoiding modal interruptions.

---

## 📱 Responsiveness (Strict Mobile-First)

**Core Rule:** Code for the smallest screen (Mobile) FIRST, then use `md:` and `lg:` prefixes to override for larger screens.

### 1. Touch Targets & Ergonomics

- **Touch Area:** All interactive elements must meet minimum touch target size standards (min 44px).
- **No Hover:** Critical actions must be visible without hover states.
- **Reachability:** Primary actions should be positioned within the natural thumb zone on mobile devices.

### 2. Layout & Typography Scaling

- **Grid Strategy:** Start with single-column layouts (`grid-cols-1`) by default.
- **Font Scaling:** Headers must automatically scale down on mobile to prevent overflow.
- **Input Zoom Prevention:** Font sizes for inputs must prevent automatic browser zooming on mobile devices.

### 3. Component Adaptation

- **Navigation:** Sidebar navigation must collapse into a Drawer/Sheet on mobile.
- **Data Display:** Complex tables must transform into Stacked Cards or simplified lists on small screens.
- **Modals:** Center-aligned modals should transform into Bottom Sheets (Drawers) on mobile for better ergonomics.

### 4. Viewer vs. Editor Strategy

- **The Viewer (Consumption):** MUST be 100% Mobile-Native.
  - **Reflow Logic:** Multi-column layouts on desktop must stack vertically on mobile (like a modern website).
  - **Touch:** Swipe navigation between Cards.
- **The Editor (Creation):**
  - **Mobile:** "Companion Mode" (Quick text edits, reviewing comments, checking analytics).
  - **Desktop:** Full "Canvas Mode" (Heavy layout changes, AI generation).
  - _Reasoning:_ Complex block manipulation is frustrating on small screens; guide users to desktop for deep work.

---

## ♿ Accessibility (A11y)

- **Focus Management:** All interactive elements must have visible focus rings for keyboard navigation.
- **Contrast Ratios:** Text and essential icons must pass WCAG AA contrast standards against their background.
- **Keyboard Navigation:** Full functionality must be achievable using only keyboard inputs (Tab, Enter, Space, Arrows).

---

## 🖼 Icons

- **Library:** Consistent stroke-width SVG icons (e.g., Lucide).
- **Sizing:** Standardized sizing classes for consistency across buttons and navigation.
- **RTL Mirroring:** Directional icons (arrows, chevrons, back/forward indicators) must be automatically mirrored/rotated in RTL mode.
