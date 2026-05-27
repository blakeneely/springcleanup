import type { Theme } from '@component-library/sign-up-sheet'

import { ThemeButtonRow } from './theme-button-row'

type SectionProps = {
  title: string
  caption: string
  theme: Theme
  onThemeChange: (next: Theme) => void
  variant?: 'showcase' | 'cards'
  children: React.ReactNode
}

export function Section({
  title,
  caption,
  theme,
  onThemeChange,
  variant = 'showcase',
  children
}: SectionProps) {
  return (
    <section
      data-theme={theme}
      data-demo-section={variant}
      className="bg-surface px-4 pt-12 pb-24 md:px-8 md:pt-16 md:pb-32"
    >
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6">
        <header className="flex flex-col gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-headline">{title}</h2>
            <p className="mt-1 text-sm text-fg-muted">{caption}</p>
          </div>
          <ThemeButtonRow active={theme} onChange={onThemeChange} />
        </header>
        <div className="flex flex-col gap-6">{children}</div>
      </div>
    </section>
  )
}

export function SectionDivider() {
  return <div aria-hidden="true" className="h-px w-full bg-border" />
}
