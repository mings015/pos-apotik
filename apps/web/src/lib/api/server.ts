const API_URL = process.env.API_URL || 'http://localhost:3000/api'

export async function serverFetch<T>(
  endpoint: string,
  token: string | null,
  options: RequestInit = {},
): Promise<T> {
  const isFormData = options.body instanceof FormData
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> ?? {}),
  }
  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers })
  const data = (await res.json()) as T
  return data
}
