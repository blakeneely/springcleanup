import type {
  SlotsOnlySheet,
  SortByDateSheet
} from '@component-library/sign-up-sheet'
import { useEffect, useState } from 'react'

import { mockApi } from './mock-api'

type FetchSheetResult<T> = {
  data: T | undefined
  loading: boolean
}

export function useFetchSortByDateSheet(): FetchSheetResult<SortByDateSheet> {
  const [data, setData] = useState<SortByDateSheet | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    void mockApi.fetchSortByDateSheet().then(result => {
      if (cancelled) return
      setData(result)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return { data, loading }
}

export function useFetchSlotsOnlySheet(): FetchSheetResult<SlotsOnlySheet> {
  const [data, setData] = useState<SlotsOnlySheet | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    void mockApi.fetchSlotsOnlySheet().then(result => {
      if (cancelled) return
      setData(result)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return { data, loading }
}
