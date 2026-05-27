import type { ReactNode } from 'react'
import { useMemo } from 'react'

import { CollapsibleSection } from '../primitives/collapsible-section'
import { useSignUpSheetContext } from './state/context'

export type SlotGroupProps = {
  /**
   * Stable DOM id for the section. Also used as the `aria-labelledby`
   * target for the section heading.
   */
  id: string
  /** Section heading text (typically a formatted date). */
  label: string
  /**
   * Total number of sibling sections in the layout. Used together with
   * `collapseThreshold` from context to decide the initial open state
   * when `forceOpen` is not provided.
   */
  sectionCount?: number
  /**
   * Override the auto-computed initial open state. `true` opens, `false`
   * closes. When omitted the section uses `defaultExpandedMode` +
   * `collapseThreshold` from context.
   */
  forceOpen?: boolean
  /** Section body - typically a `<SlotTable>`. */
  children: ReactNode
  /** Optional extra classes applied to the `<section>` wrapper. */
  className?: string
}

export function SlotGroup({
  id,
  label,
  sectionCount,
  forceOpen,
  children,
  className
}: SlotGroupProps) {
  const { defaultExpandedMode, collapseThreshold } = useSignUpSheetContext()

  let defaultOpen: boolean
  if (forceOpen !== undefined) {
    defaultOpen = forceOpen
  } else if (defaultExpandedMode === 'all') {
    defaultOpen = true
  } else if (defaultExpandedMode === 'none') {
    defaultOpen = false
  } else {
    defaultOpen =
      sectionCount === undefined || sectionCount <= collapseThreshold
  }

  const summary = useMemo(
    () => (
      <h2 id={`${id}-label`} className="text-base font-semibold text-headline">
        {label}
      </h2>
    ),
    [id, label]
  )

  return (
    <section
      id={id}
      data-slot-group
      aria-labelledby={`${id}-label`}
      className={className ?? undefined}
    >
      <CollapsibleSection
        defaultOpen={defaultOpen}
        summary={summary}
        summaryClassName="px-4 py-3 md:hidden"
      >
        <div data-slot-group-body>{children}</div>
      </CollapsibleSection>
    </section>
  )
}
