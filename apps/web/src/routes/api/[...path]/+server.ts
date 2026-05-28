import type { RequestHandler } from './$types'

const API_URL = (process.env.API_URL || 'http://localhost:3000/api').replace(/\/$/, '')

async function proxy(event: Parameters<RequestHandler>[0], method: string): Promise<Response> {
  const { params, url, request, locals } = event
  const token = locals.accessToken
  const targetUrl = `${API_URL}/${params.path}${url.search}`

  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`

  const contentType = request.headers.get('Content-Type')
  if (contentType) headers['Content-Type'] = contentType

  let body: string | undefined
  if (method !== 'GET' && method !== 'DELETE') {
    body = await request.text()
  }

  const res = await fetch(targetUrl, { method, headers, body })
  const text = await res.text()

  return new Response(text, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' },
  })
}

export const GET: RequestHandler = (event) => proxy(event, 'GET')
export const POST: RequestHandler = (event) => proxy(event, 'POST')
export const PATCH: RequestHandler = (event) => proxy(event, 'PATCH')
export const PUT: RequestHandler = (event) => proxy(event, 'PUT')
export const DELETE: RequestHandler = (event) => proxy(event, 'DELETE')
