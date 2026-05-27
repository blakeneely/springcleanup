import type {
  SlotsOnlySheet,
  SortByDateSheet
} from '@component-library/sign-up-sheet'

import { slotsOnlySheet, sortByDateSheet } from './demo-data'

const NETWORK_LATENCY_MS = 600

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const mockApi = {
  // In production, this is a `fetch('/api/sheets/sort-by-date')` call.
  async fetchSortByDateSheet(): Promise<SortByDateSheet> {
    await delay(NETWORK_LATENCY_MS)
    return sortByDateSheet
  },
  async fetchSlotsOnlySheet(): Promise<SlotsOnlySheet> {
    await delay(NETWORK_LATENCY_MS)
    return slotsOnlySheet
  },
  // In production, this is a `fetch('/api/slots/...')` call.
  async joinSlot(slotId: string, userId: string): Promise<void> {
    await delay(NETWORK_LATENCY_MS)
    void slotId
    void userId
  },
  async leaveSlot(slotId: string, userId: string): Promise<void> {
    await delay(NETWORK_LATENCY_MS)
    void slotId
    void userId
  }
}
