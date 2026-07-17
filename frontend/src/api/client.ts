import i18n from "../i18n/config.js"

const BASE_URL = "/api"

function translateError(code: string, fallback: string): string {
  const key = `errors.${code}`
  const translated = i18n.t(key)
  return translated !== key ? translated : fallback
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: { field: string; message: string }[]
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export async function apiRequest<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const options: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
  }

  if (body !== undefined) {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(`${BASE_URL}${path}`, options)

  if (response.status === 204) {
    return undefined as T
  }

  const data = await response.json()

  if (!response.ok) {
    const message = translateError(data.code, data.message)
    throw new ApiError(
      response.status,
      data.code,
      message,
      data.details
    )
  }

  return data as T
}
