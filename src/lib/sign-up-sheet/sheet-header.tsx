import { format } from './messages/format'
import { useSignUpSheetContext } from './state/context'

export type SheetHeaderProps = {
  /** Sheet title - rendered as the primary `<h1>`. */
  title: string
  /** Optional supporting copy below the title. */
  description?: string
  /**
   * When true, the title and description are replaced with skeleton bars
   * sized to match their text line-box, so the header keeps its layout
   * dimensions during a loading flash.
   */
  loading?: boolean
  /** Optional extra classes applied to the header element. */
  className?: string
}

export function SheetHeader({
  title,
  description,
  loading = false,
  className
}: SheetHeaderProps) {
  const { messages, timeZone } = useSignUpSheetContext()

  return (
    <header
      data-sheet-header
      className={`flex flex-col gap-1 border-b border-border bg-headline px-4 py-4 text-headline-fg ${className ?? ''}`}
    >
      <h1 className="text-lg font-semibold">
        {loading ? (
          <span
            aria-hidden="true"
            data-skeleton-bar
            className="inline-block h-[1em] w-2/3 animate-pulse rounded bg-headline-fg/30 align-middle"
          />
        ) : (
          title
        )}
      </h1>
      {loading || description ? (
        <p className="text-sm opacity-90">
          {loading ? (
            <span
              aria-hidden="true"
              data-skeleton-bar
              className="inline-block h-[1em] w-1/2 animate-pulse rounded bg-headline-fg/20 align-middle"
            />
          ) : (
            description
          )}
        </p>
      ) : null}
      {timeZone ? (
        <p data-sheet-header-timezone className="text-xs opacity-75">
          {format(messages.timeZoneNote, { timeZone })}
        </p>
      ) : null}
    </header>
  )
}
