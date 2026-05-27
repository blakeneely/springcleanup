# Sign-Up Sheet Component System

A small, themeable, accessible-by-default React + TypeScript component library for participant-facing sign-up sheets — volunteer rosters, potluck lists, shift schedules, parent-teacher conferences. It is split into two layers, each with its own public barrel:

- **`@component-library/primitives`** — domain-agnostic UI primitives (`Avatar`, `CapacityPill`, `ParticipantBadge`, `CollapsibleSection`). Reusable beyond sign-up sheets.
- **`@component-library/sign-up-sheet`** — the sign-up-sheet recipe. Composes the primitives with sheet-specific components (`SheetHeader`, `SlotTable`, `Slot`, `SlotAction`, `SlotGroup`, …) into layout containers, and ships a top-level `<SignUpSheet>` that dispatches to the right layout based on `data.type`.

The five components the brief calls out — `<SignUpSheet>`, `<SlotGroup>`, `<Slot>`, `<SlotAction>`, `<ParticipantBadge>` — are all top-level exports under these names.

A demo page at the project root exercises every shipped capability across all four themes.

## Run

```bash
npm install
npm run dev          # start the demo at http://localhost:5173
npm run build        # type-check + production build
npm run preview      # serve the production build locally
npm run test         # vitest single run (unit + hook + integration + jest-axe)
npm run test:watch   # vitest in watch mode
npm run lint         # eslint, zero warnings expected
npm run format       # prettier --write .
npm run format:check # prettier --check . (CI-safe)
```

`.npmrc` sets `legacy-peer-deps=true` so a plain `npm install` succeeds. `eslint-plugin-react-perf` (latest 3.3.3) caps its ESLint peer at v9 and has not published a v10-compatible release; the setting can be removed when it does.

## Using the library

### 1. Default usage

The 99% case. Pass `data` and the join/leave callbacks; the library renders the matching layout, manages the live a11y region, and exposes pending + error state as first-class props.

```tsx
import {
  SignUpSheet,
  useSignUpSheetState,
} from '@component-library/sign-up-sheet'

const CURRENT_USER = { id: 'you', name: 'You' }

export function MySheet({ initialData }) {
  const state = useSignUpSheetState(initialData, {
    currentUser: CURRENT_USER,
  })

  return (
    <SignUpSheet
      data={state.data}
      currentUser={state.currentUser}
      pendingSlotIds={state.pendingSlotIds}
      slotErrors={state.slotErrors}
      onSlotJoin={state.joinSlot}
      onSlotLeave={state.leaveSlot}
      timeZone="EDT"
    />
  )
}
```

`useSignUpSheetState` ships a built-in simulated latency (default 600 ms) so demos and prototypes show pending UX out of the box. Pass `onJoin` / `onLeave` to wire real server mutations:

```tsx
const state = useSignUpSheetState(initialData, {
  currentUser: session.user,
  onJoin: async (slotId, user) => { await api.join(slotId, user.id) },
  onLeave: async (slotId, user) => { await api.leave(slotId, user.id) },
})
```

The demo app uses exactly this pattern. `src/app/mock-api.ts` exposes a `mockApi` module that mirrors a real backend with simulated latency — both the initial sheet fetch (`fetchSortByDateSheet`, `fetchSlotsOnlySheet`) and the per-slot mutations (`joinSlot`, `leaveSlot`). `src/app/use-fetch-sheet.ts` wraps the fetch in an Apollo-style hook (`{ data, loading }`), and each section combines that with `useSignUpSheetState` for a single, flat render:

```tsx
const { data, loading } = useFetchSortByDateSheet()
const state = useSignUpSheetState(data, {
  currentUser,
  onJoin: (slotId, user) => mockApi.joinSlot(slotId, user.id),
  onLeave: (slotId, user) => mockApi.leaveSlot(slotId, user.id),
})
return <SignUpSheet data={state.data} loading={loading} ... />
```

`useSignUpSheetState` accepts `initialData` as `undefined` and seeds itself once the data arrives, so the section never needs to branch on the loading state. Swap each `mockApi.*` call for a real `fetch` and nothing else in the consumer changes.

### 2. Read-only mode

Omit `currentUser` to render the sheet for an unauthenticated viewer. Participants and capacity still render; action buttons are absent from the DOM entirely.

```tsx
<SignUpSheet data={data} />
```

### 3. Compound API (manual composition)

For custom layouts, drop down a level. `<SignUpSheetProvider>` exposes the same context the dispatcher uses; the recipe components consume it.

```tsx
import {
  SheetHeader,
  SignUpSheetProvider,
  Slot,
  SlotTable,
  useSignUpSheetState,
} from '@component-library/sign-up-sheet'

const COLUMNS = ['slot'] as const

export function CustomSheet({ initialData }) {
  const state = useSignUpSheetState(initialData, {
    currentUser: CURRENT_USER,
  })

  return (
    <SignUpSheetProvider
      currentUser={state.currentUser}
      pendingSlotIds={state.pendingSlotIds}
      slotErrors={state.slotErrors}
      onSlotJoin={state.joinSlot}
      onSlotLeave={state.leaveSlot}
      theme="boba"
    >
      <SheetHeader title={state.data.title} />
      <SlotTable columns={COLUMNS} ariaLabel={state.data.title}>
        {state.data.slots.map((slot) => (
          <Slot key={slot.id} slot={slot} columns={COLUMNS} />
        ))}
      </SlotTable>
    </SignUpSheetProvider>
  )
}
```

### 4. Primitives-only

Each primitive renders correctly on its own — no provider, no context.

```tsx
import {
  Avatar,
  CapacityPill,
  ParticipantBadge,
} from '@component-library/primitives'

<Avatar participant={{ id: 'u-1', name: 'Anna Reyes' }} />
<ParticipantBadge participant={user} isCurrent />
<CapacityPill capacity={50} filled={32} />
```

## Theming

Tokens are CSS custom properties declared via Tailwind 4's `@theme` directive and scoped by `[data-theme="..."]`. Four themes ship: `default`, `bluey`, `mando`, and `boba`. `default` is the palette applied at `:root`, so consumers who never set `data-theme` get it for free. Adding a fifth is a CSS edit — drop a new `[data-theme="..."]` block into `src/styles/tokens.css` with the same custom-property names.

Themes apply at two scopes:

- **Per-sheet** — `<SignUpSheet theme="mando" ... />` wraps the rendered tree in `<div data-theme="mando">`.
- **Page-wide** — set `document.documentElement.dataset.theme = 'bluey'` and every sheet without an explicit `theme` prop inherits it.

For per-event brand colors without authoring a new named theme, pass `themeOverride`. It applies the overridden tokens as inline CSS custom properties on the sheet root, leaving the page-level theme untouched.

```tsx
<SignUpSheet
  data={data}
  themeOverride={{ accent: '#3a6b7c', headline: '#f16622' }}
/>
```

The `messages` prop accepts a partial override map of named-placeholder templates. Library-generated strings (capacity captions, button labels, a11y announcements) substitute through `format(template, values)`; missing keys leave their placeholder visible as a debugging aid. Date, time, and location strings stay the consumer's responsibility — they arrive on `SlotData` pre-formatted.

```tsx
<SignUpSheet
  data={data}
  messages={{
    timeZoneNote: 'Todas las horas en {timeZone}',
    signUp: 'Apuntarme',
  }}
/>
```

## Project structure

```
src/
  app/                                 demo app — consumer of the library
    sections/                          one demo section per shipped capability
      edge-cases-section.tsx
      slots-only-section.tsx
      sort-by-date-section.tsx
      index.ts
    app.tsx                            three-section demo page
    demo-data.ts                       realistic + edge-case sheets
    mock-api.ts                        fake server module (fetch + mutations)
    section.tsx                        demo-only layout wrapper
    theme-button-row.tsx               theme switcher control
    use-fetch-sheet.ts                 Apollo-style fetch hook (data + loading)
  lib/
    primitives/                        @component-library/primitives
      __tests__/
      avatar.tsx
      capacity-pill.tsx
      collapsible-section.tsx
      participant-badge.tsx
      types.ts
      use-expanded-above-breakpoint.ts breakpoint-aware hook
      index.ts
    sign-up-sheet/                     @component-library/sign-up-sheet
      __tests__/
      layouts/
        slots-only-layout.tsx
        sort-by-date-layout.tsx
      messages/
        __tests__/
        default-messages.ts
        format.ts
      state/
        __tests__/
        context.ts
        helpers.ts
        sign-up-sheet-provider.tsx
        use-sign-up-sheet-state.ts
      sheet-header.tsx
      sign-up-sheet.tsx                (dispatcher)
      sign-up-sheet-skeleton.tsx
      slot.tsx
      slot-action.tsx
      slot-group.tsx
      slot-table.tsx
      time-header.tsx
      types.ts
      index.ts
  styles/
    primitives.css                     mobile-only accordion CSS
    sign-up-sheet.css                  sheet-specific CSS
    tokens.css                         @theme tokens for all four themes
  index.css                            Tailwind + tokens
  main.tsx                             entry
  test/setup.ts                        vitest setup (jest-dom + jest-axe)
docs/
  ADR.md                               architecture decision record
```

## Conventions

A small set of rules the linter enforces. Worth knowing up front so the first `npm run lint` is green.

- **Import via the aliases.** Always `@component-library/primitives` and `@component-library/sign-up-sheet` — never a `src/lib/...` path. Both are declared in `tsconfig.app.json` and `vite.config.ts`.
- **Layer boundary.** `lib/primitives/` has zero imports from `lib/sign-up-sheet/`. The reverse is fine. `import-x/no-unused-modules` fails CI on dead exports, so each public barrel stays honest.
- **File and folder names are kebab-case.** `slot-group.tsx`, not `SlotGroup.tsx`. Components are still PascalCase in code — the convention is filenames only. `.js`, `.model.ts`, and `.util.ts` are blocked; use `.ts`, `.models.ts`, `.utils.ts`.
- **Data types use a `Data` suffix.** `SlotData`, `SignUpSheetData` — so they don't collide with the component of the same root name.
- **Tests live in `__tests__/`.** Anywhere else is a lint error. Naming: `*.test.ts` / `*.test.tsx`. Stack: vitest + `@testing-library/react` + `jest-axe`.
- **React perf rules are on.** No inline objects, arrays, functions, or JSX as props — hoist with `useMemo` / `useCallback`, or lift the value out of the render. Required dep arrays are also enforced (`react-hooks/exhaustive-deps`).
- **Type-only imports.** Use `import type { ... }` at the top level. `type` aliases are preferred over `interface` (linter-enforced).
- **Import order is enforced.** builtin → external → internal → sibling/parent → index, alphabetized, with a blank line between groups. `npm run lint --fix` and `npm run format` handle it.

## Testing

Stack: **vitest + jsdom + `@testing-library/react` + `jest-axe`**. Tests live in `__tests__/` folders (ESLint enforces it) next to the code they cover. `globals: false` is on, so `describe` / `it` / `expect` must be imported explicitly.

Inventory by layer:

- **Primitives** (`src/lib/primitives/__tests__/`) — 5 component tests: `avatar`, `capacity-pill`, `collapsible-section`, `participant-badge`, and the `use-expanded-above-breakpoint` hook.
- **Sign-up-sheet recipe** (`src/lib/sign-up-sheet/__tests__/`) — 5 component tests for `sheet-header`, `slot`, `slot-action`, `slot-group`, and `sign-up-sheet` itself. The last includes a **compound-API parity test** (same fixture rendered through `<SignUpSheet>` and through `<SignUpSheetProvider>` + children, asserted identical) plus a **jest-axe pass** on the dispatcher.
- **State** (`src/lib/sign-up-sheet/state/__tests__/`) — `helpers.test.ts` for the pure slot math and `use-sign-up-sheet-state.test.tsx` for the hook's pending / error contract and async edges (rapid taps, simulated errors, in-flight short-circuit).
- **Messages** (`src/lib/sign-up-sheet/messages/__tests__/`) — `format.test.ts` for named-placeholder template substitution.

Adding a new test: kebab-case filename ending in `.test.ts` or `.test.tsx`, dropped in the nearest `__tests__/` folder. Run with `npm run test` (single run) or `npm run test:watch`.

For what's intentionally *not* tested (and why), see ADR section 4.

## Architecture

See [`docs/ADR.md`](docs/ADR.md) for the architecture decision record covering component API design, state management, theming strategy, testing strategy, and what I would change at scale.
