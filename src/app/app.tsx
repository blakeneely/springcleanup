import { SectionDivider } from './section'
import { EdgeCasesSection, SlotsOnlySection, SortByDateSection } from './sections'

export function App() {
  return (
    <main className="min-h-full bg-surface text-fg" data-theme="default">
      <header className="w-full border-b border-border bg-surface-elevated px-4 py-10 text-fg md:px-12 md:py-12">
        <h1 className="text-3xl font-semibold text-fg md:text-4xl">
          Sign-Up Sheet Component System
        </h1>
        <p className="mt-3 text-sm text-fg-muted md:text-base">
          Layered library: domain-agnostic primitives + a sign-up-sheet recipe
          that dispatches the right layout based on{' '}
          <code className="rounded bg-surface px-1.5 py-0.5 text-fg">
            data.type
          </code>
          . Scroll through the three sections below to see the layouts, states,
          and edge cases.
        </p>
      </header>
      <SortByDateSection />
      <SectionDivider />
      <SlotsOnlySection />
      <SectionDivider />
      <EdgeCasesSection />
    </main>
  )
}
