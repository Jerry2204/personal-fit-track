const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

interface ApiError {
  message: string
  statusCode: number
  error?: string
}

export class ApiClientError extends Error {
  statusCode: number
  constructor(error: ApiError) {
    super(error.message)
    this.name = "ApiClientError"
    this.statusCode = error.statusCode
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth-token") : null

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({
      message: "An unexpected error occurred",
    }))
    throw new ApiClientError({
      message: body.message || "An unexpected error occurred",
      statusCode: res.status,
    })
  }

  return res.json()
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
}
