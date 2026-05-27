import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SlotGroup } from '../slot-group'
import { SignUpSheetProvider } from '../state/sign-up-sheet-provider'

describe('SlotGroup', () => {
  it('opens by default in auto mode when sectionCount is at or under threshold', () => {
    render(
      <SignUpSheetProvider defaultExpandedMode="auto" collapseThreshold={5}>
        <SlotGroup id="d1" label="Saturday" sectionCount={3}>
          <p>body</p>
        </SlotGroup>
      </SignUpSheetProvider>
    )
    const details = screen
      .getByText('Saturday')
      .closest('details') as HTMLDetailsElement
    expect(details.open).toBe(true)
  })

  it('stays closed by default in auto mode when sectionCount exceeds threshold', () => {
    render(
      <SignUpSheetProvider defaultExpandedMode="auto" collapseThreshold={5}>
        <SlotGroup id="d1" label="Saturday" sectionCount={8}>
          <p>body</p>
        </SlotGroup>
      </SignUpSheetProvider>
    )
    const details = screen
      .getByText('Saturday')
      .closest('details') as HTMLDetailsElement
    expect(details.open).toBe(false)
  })

  it('forces open when defaultExpandedMode is "all"', () => {
    render(
      <SignUpSheetProvider defaultExpandedMode="all" collapseThreshold={1}>
        <SlotGroup id="d1" label="Saturday" sectionCount={100}>
          <p>body</p>
        </SlotGroup>
      </SignUpSheetProvider>
    )
    const details = screen
      .getByText('Saturday')
      .closest('details') as HTMLDetailsElement
    expect(details.open).toBe(true)
  })

  it('forces closed when defaultExpandedMode is "none"', () => {
    render(
      <SignUpSheetProvider defaultExpandedMode="none" collapseThreshold={100}>
        <SlotGroup id="d1" label="Saturday" sectionCount={1}>
          <p>body</p>
        </SlotGroup>
      </SignUpSheetProvider>
    )
    const details = screen
      .getByText('Saturday')
      .closest('details') as HTMLDetailsElement
    expect(details.open).toBe(false)
  })
})
