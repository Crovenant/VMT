// src/modules/Shared/FieldMapping/hooks/useFieldSchema.ts
import useSWR from 'swr'
import type { ViewType } from '../schemaUtils'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function useFieldSchema(viewType: ViewType, baseUrl = '') {
  const key = viewType ? `${baseUrl}/schema/${viewType}/`.replace(/(?<!:)\/\//g, '/') : null
  const { data, error, isValidating, mutate } = useSWR(key, fetcher)
  const fields = Array.isArray(data?.fields) ? (data.fields as string[]) : []
  return { fields, error, isValidating, mutate }
}
