import { z } from 'zod'
import { tokenStorage, unauthorizedEvent } from '../lib/storage'

type QueryValue = string | number | boolean | null | undefined

type ApiRequestOptions<TSchema extends z.ZodType | undefined> = Omit<
  RequestInit,
  'body'
> & {
  body?: unknown
  query?: Record<string, QueryValue>
  schema?: TSchema
}

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
).replace(/\/+$/, '')

export function buildUrl(path: string, query?: Record<string, QueryValue>) {
  const url = new URL(`${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`)

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  })

  return url.toString()
}

export async function apiRequest<TSchema extends z.ZodType | undefined>(
  path: string,
  options: ApiRequestOptions<TSchema> = {},
): Promise<TSchema extends z.ZodType ? z.infer<TSchema> : undefined> {
  const { body, query, schema, headers, ...init } = options
  const token = tokenStorage.get()
  const requestHeaders = new Headers(headers)

  requestHeaders.set('Accept', 'application/json')

  if (token) {
    requestHeaders.set('Authorization', `Bearer ${token}`)
  }

  const isFormData = body instanceof FormData
  const requestInit: RequestInit = {
    ...init,
    headers: requestHeaders,
  }

  if (body !== undefined) {
    if (isFormData) {
      requestInit.body = body
    } else {
      requestHeaders.set('Content-Type', 'application/json')
      requestInit.body = JSON.stringify(body)
    }
  }

  const response = await fetch(buildUrl(path, query), requestInit)

  if (response.status === 401) {
    window.dispatchEvent(new Event(unauthorizedEvent))
  }

  if (!response.ok) {
    throw new ApiError(await getErrorMessage(response), response.status)
  }

  if (response.status === 204) {
    return undefined as TSchema extends z.ZodType ? z.infer<TSchema> : undefined
  }

  const contentType = response.headers.get('content-type') ?? ''

  if (!contentType.includes('application/json')) {
    return undefined as TSchema extends z.ZodType ? z.infer<TSchema> : undefined
  }

  const data = await response.json()

  if (!schema) {
    return undefined as TSchema extends z.ZodType ? z.infer<TSchema> : undefined
  }

  return schema.parse(data) as TSchema extends z.ZodType ? z.infer<TSchema> : undefined
}

async function getErrorMessage(response: Response) {
  const fallback = `Request failed with status ${response.status}`
  const text = await response.text()

  if (!text) {
    return fallback
  }

  try {
    const payload = JSON.parse(text) as { message?: unknown; error?: unknown }
    return String(payload.message ?? payload.error ?? fallback)
  } catch {
    return text
  }
}
