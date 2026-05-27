import { useSignUpSheetContext } from './state/context'

export type SignUpSheetSkeletonProps = {
  rowCount?: number
  className?: string
}

export function SignUpSheetSkeleton({
  rowCount = 3,
  className
}: SignUpSheetSkeletonProps) {
  const { messages } = useSignUpSheetContext()
  const rows = Array.from(
    { length: Math.max(1, rowCount) },
    (_, i) => `skeleton-row-${String(i)}`
  )

  return (
    <div
      data-sign-up-sheet-skeleton
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={className}
    >
      <span className="sr-only">{messages.loadingSheet}</span>
      <ul data-skeleton-rows className="m-0 list-none p-0">
        {rows.map(rowKey => (
          <li
            key={rowKey}
            data-skeleton-row
            className="block border-b border-border px-4 py-3 last:border-b-0"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="h-4 w-1/2 animate-pulse rounded bg-fg/10" />
                <div className="h-5 w-28 animate-pulse rounded-full bg-fg/10" />
                <div className="flex flex-wrap gap-1.5">
                  <div className="h-6 w-20 animate-pulse rounded-full bg-fg/10" />
                  <div className="h-6 w-24 animate-pulse rounded-full bg-fg/10" />
                </div>
              </div>
              <div className="h-9 w-24 animate-pulse rounded bg-fg/10 md:shrink-0" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
