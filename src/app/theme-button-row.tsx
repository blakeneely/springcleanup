import type { Theme } from '@component-library/sign-up-sheet'
import { useCallback } from 'react'

const AVAILABLE_THEMES: readonly Theme[] = ['default', 'bluey', 'mando', 'boba']

function themeLabel(theme: Theme): string {
  switch (theme) {
    case 'default':
      return 'Default'
    case 'bluey':
      return 'Bluey'
    case 'mando':
      return 'Mando'
    case 'boba':
      return 'Boba'
  }
}

type ThemeButtonProps = {
  theme: Theme
  active: boolean
  onChange: (theme: Theme) => void
}

function ThemeButton({ theme, active, onChange }: ThemeButtonProps) {
  const handleClick = useCallback(() => {
    onChange(theme)
  }, [onChange, theme])
  const className = active
    ? 'inline-flex min-h-9 items-center justify-center rounded-md border border-accent bg-accent px-3 py-1 text-sm font-semibold text-accent-fg shadow-sm'
    : 'inline-flex min-h-9 items-center justify-center rounded-md border border-border bg-surface-elevated px-3 py-1 text-sm font-medium text-fg hover:bg-surface'
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={handleClick}
      className={className}
    >
      {themeLabel(theme)}
    </button>
  )
}

type ThemeButtonRowProps = {
  active: Theme
  onChange: (theme: Theme) => void
}

export function ThemeButtonRow({ active, onChange }: ThemeButtonRowProps) {
  return (
    <div
      role="group"
      aria-label="Theme"
      className="flex flex-wrap items-center gap-2"
      data-theme-button-row
    >
      {AVAILABLE_THEMES.map((theme: Theme) => (
        <ThemeButton
          key={theme}
          theme={theme}
          active={theme === active}
          onChange={onChange}
        />
      ))}
    </div>
  )
}
