import type { ApiErrorBody } from '../types'

const API_URL = import.meta.env.VITE_API_URL

type QueryValue = string | number | boolean | (string | number)[] | undefined

export class ApiError extends Error {
  status: number
  code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

const buildUrl = (path: string, query?: Record<string, QueryValue>) => {
  const url = new URL(path, API_URL)

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return

    if (Array.isArray(value)) {
      value.forEach((v) => url.searchParams.append(key, String(v)))
    } else {
      url.searchParams.set(key, String(value))
    }
  })

  return url.toString()
}

const getErrorMessage = (body?: ApiErrorBody | null) =>
  Array.isArray(body?.message)
    ? body.message.join(', ')
    : body?.message || body?.code || 'Не удалось выполнить запрос'

export const apiClient = async <T>(
  path: string,
  options: RequestInit & { query?: Record<string, QueryValue> } = {},
): Promise<T> => {
  const headers = new Headers(options.headers)

  const token = localStorage.getItem('taskBoardToken')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  let response: Response
  try {
    response = await fetch(buildUrl(path, options.query), {
      ...options,
      headers,
    })
  } catch {
    throw new ApiError('Сетевая ошибка', 0)
  }

  if (response.status === 204) return undefined as T

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const body = isJson ? await response.json() : null

  if (!response.ok) {
    const err = body as ApiErrorBody | null
    throw new ApiError(getErrorMessage(err), response.status, err?.code)
  }

  return body as T
}