# Architecture Decision Record — Sign-Up Sheet Component System

## 1. Component API design

The library ships in two layers:

- **`primitives`** — `Avatar`, `CapacityPill`, `ParticipantBadge`, `CollapsibleSection`. Domain-agnostic and reusable beyond sign-up sheets. The folder has zero imports from `sign-up-sheet`, so the boundary is architectural rather than aspirational.
- **`sign-up-sheet`** — the recipe. Composes primitives with sheet-specific pieces (`SheetHeader`, `SlotTable`, `Slot`, `SlotAction`, `SlotGroup`, `TimeHeader`) into layout containers wired through a shared provider.

The five components the brief calls out — `<SignUpSheet>`, `<SlotGroup>`, `<Slot>`, `<SlotAction>`, `<ParticipantBadge>` — are all top-level exports under those names.

The 99% case is one component:

```tsx
<SignUpSheet
  data={data}
  currentUser={currentUser}
  pendingSlotIds={pendingSlotIds}
  slotErrors={slotErrors}
  onSlotJoin={onSlotJoin}
  onSlotLeave={onSlotLeave}
/>
```

`<SignUpSheet>` dispatches on `data.type` (a discriminated union) to pick a layout. For custom layouts, `<SignUpSheetProvider>` exposes the same context and the recipe components are exported standalone — an integration test renders the prop-driven and compound paths against the same fixture and asserts identical output.

Data types use a `Data` suffix (`SlotData`, `SignUpSheetData`) so they don't collide with the component names of the same root. `import-x/no-unused-modules` fails CI on unused exports, so the public barrel can't drift from real usage.

**Rejected:** prop-driven only (forces a fork for non-standard layouts); compound only (boilerplate `.map` in the 99% case); a hybrid controlled/uncontrolled component (doubles the API surface).

## 2. State management

The component is **fully controlled.** The caller owns `data`, `pendingSlotIds`, and `slotErrors`; the component fires callbacks and the caller passes new values back. Optimistic updates and server reconciliation live at the caller's layer where they belong.

`pendingSlotIds` and `slotErrors` are first-class props rather than internal state because every real mutation library (TanStack Query, RTK Query, SWR) already exposes in-flight status. Lifting them also keeps per-slot errors inline (`role="alert"` under the slot) instead of needing a global toast portal.

For demos and prototypes, **`useSignUpSheetState`** bundles data, pending, errors, and join/leave actions with a built-in simulated latency (default 600 ms). It accepts optional `onJoin` / `onLeave` async callbacks for real-server wiring; an opt-in `simulatedErrorRate` powers the error-state demo. The hook returns stable references — `useCallback` for actions, replaced (not mutated) state for sets and records — so consumers don't trip `react-perf` lint rules or re-render memoized children.

Both the hook's `initialData` and `<SignUpSheet>`'s `data` prop accept `undefined`. The hook seeds itself the first time `initialData` becomes defined; the component renders the loading skeleton until then. This mirrors the `{ data, loading }` shape that real fetching layers (Apollo, React Query, SWR) return on first render, so consumers can pass `useQuery().data` straight in without a guard or a separate "loaded" subcomponent.

Async safety lives at two layers: the action button reads `pendingSlotIds.has(slotId)` and renders as `aria-disabled` + `aria-busy` so rapid taps can't fire the callback, and the hook short-circuits in-flight slots even if the caller doesn't disable the button. A live region (`role="status"`, `aria-live="polite"`) inside the provider announces only the current user's own joins and leaves to avoid screen-reader spam on busy sheets.

**At scale:** integrate directly with a mutation library rather than the demo hook, and move to optimistic updates once a rollback contract exists.

**Rejected:** uncontrolled (production source of truth is the server); internal pending tracking (no clean error-recovery contract); debounce (hides bugs); promise-returning callbacks with component-owned errors (dual ownership with the caller's data).

## 3. Theming strategy

Theming is **CSS custom properties** declared via Tailwind 4's `@theme` directive. The custom-property names (`--color-surface`, `--color-fg`, `--color-accent`, `--color-marker`, `--color-danger`, …) are the only contract every component knows. No component sees a literal hex. Where two visually-similar elements would otherwise collapse to the same token (e.g. accent buttons and small recurring badges), the token surface adds a second slot rather than letting a theme reach for a per-element CSS override — `--color-marker` is the bg for the capacity pill so themes like `bluey` can scatter a secondary palette color across the page (her tan muzzle accent) without touching component code. Themes that don't need the split set `marker` equal to `accent`.

Switching works at two scopes: a per-sheet `theme` prop that wraps the tree in `<div data-theme={theme}>`, and any ancestor with `data-theme="..."` (typically `document.documentElement`) cascading to every sheet below it.

Four themes ship: `default`, `bluey`, `mando`, `boba`. The flavor themes act as a token-contract stress test — `mando`'s danger color is the standard `#dc2626` red rather than a palette match, because `danger` is a _functional_ semantic ("this failed"), not a palette slot. The themes wouldn't survive that decision being wrong.

A per-sheet `themeOverride` prop accepts `Partial<Tokens>` and applies them as inline CSS custom properties on the sheet root, overriding the named theme's tokens for that instance. Real sign-up sheets have per-event brand colors; `themeOverride` covers that without ballooning the API.

Generated strings (capacity captions, button labels, announcements) flow through a `messages` prop of named-placeholder templates with English defaults. Translators own the entire phrase including placeholder position — the right shape for languages whose word order differs from English. Data strings (dates, times, names) arrive on `SlotData` pre-formatted, so the library never owns `Intl`, never owns locale, and never disagrees with the consumer's app on date formatting.

Tokens live in a single semantic layer today. At scale the right shape is **primitive → semantic → component** (`--color-blue-500` → `--color-accent` → `--button-bg`); the seam is visible in the token file and the addition is non-breaking.

**Rejected:** JS token objects via context (can't hot-swap without re-render); prop-only switching (no page-level toggle); a single `accentColor` prop instead of `themeOverride` (custom API for the easy case, inadequate for the real case); component-side string concatenation around placeholders (forces every language into English word order).

## 4. Testing strategy

The contract under test is **behaviour, not internals**. Every component renders through `@testing-library/react` and is asserted via what a user (or screen reader) actually sees — labels, roles, aria-live announcements, button enabled/busy state. No test reaches into context or asserts on the props of internal children, so refactors that preserve behaviour don't cascade through the test suite.

One **parity test** is the safety net for the dual API. `sign-up-sheet.test.tsx` renders the same fixture twice — once through prop-driven `<SignUpSheet>`, once through `<SignUpSheetProvider>` + compound children — and asserts identical DOM. The dispatcher and the manual-composition path can't drift without that test failing.

**jest-axe runs on the top-level component.** The dispatcher composes everything below it, so a violation there catches regressions in any descendant. Per-primitive axe runs would be redundant noise.

**Pure functions get their own tests.** `messages/format.ts` (template substitution) and `state/helpers.ts` (slot math) are unit-tested without a DOM — the fastest signal in the suite, and the easiest place to pin edge cases.

The **hook gets integration-style coverage in its own right.** `use-sign-up-sheet-state` is part of the public API, and its pending/error contract is what the rest of the library leans on, so it has ~330 lines of coverage including async edges: rapid taps on the same slot, simulated error rates, in-flight short-circuiting when the caller forgets to disable the button.

**What's deliberately not tested.** Layout components have no unit tests — they're thin compositions of components that already have coverage, and the parity test exercises them through the dispatcher. No visual regression (Chromatic / Loki belong with multi-team ownership — see section 5). No CSS / theming snapshots — tokens swap via `data-theme` attributes, so behaviour is the contract and the palette isn't.

**Rejected:** snapshot tests as a baseline (brittle, encourage rubber-stamp updates on every legitimate change); mocking the hook inside component tests (lets the component and the hook drift apart silently); asserting against internal context values (locks the implementation, not the contract).

## 5. What I'd change at scale

If this graduated to a shared design system consumed by 2+ teams:

- **Publish each layer as its own package.** Today the layers live under `src/lib/` with path aliases. As `@company/primitives` and `@company/sign-up-sheet`, consumers update the recipe without re-pulling primitives, and primitives can power other domains.

- **A headless layer under these primitives.** Today the widget set is `<button>`, `<ul>`, `<li>`, `<section>`, `<h2>`, `<details>`, and `[role="status"]` — things I write correctly by hand. When dialogs, popovers, comboboxes, or virtualized listboxes arrive, **Radix UI** or **React Aria Components** is the right layer for the genuinely-hard a11y machinery (focus traps, escape handling, listbox semantics).

- **Three-layer token scheme.** Today renaming `--color-accent` touches every component class. Splitting `primitive → semantic → component` lets each level evolve independently. The change is additive.

- **Optimistic UI.** Today join/leave disables the button until the server confirms. Optimistic flips immediately and reverts on error — better perceived latency, but requires rollback, stable identifiers for the reconcile, and an error contract that distinguishes "your action failed" from "data refreshed underneath you."

- **Two-axis theming.** `mando` and `boba` are single light palettes today. A real product wants `mando-dark` and `boba-dark`. The clean shape is `theme="mando"` × `mode="dark"` backed by paired `[data-theme][data-mode]` selectors.

- **Storybook + visual regression.** Today the demo page exercises every shipped capability in one scroll. Owned by multiple teams, a per-component sandbox is worth the dependency cost — Chromatic / Loki for visual regression and live a11y feedback layer on top.
