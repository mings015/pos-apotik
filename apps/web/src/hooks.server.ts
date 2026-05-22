import type { Handle } from '@sveltejs/kit'
import type { UserDto, ApiResponse } from '@pharmapos/types'

const API_URL = process.env.API_URL || 'http://localhost:3000/api'

export const handle: Handle = async ({ event, resolve }) => {
  const accessToken = event.cookies.get('accessToken')

  if (accessToken) {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (res.ok) {
        const data = (await res.json()) as ApiResponse<UserDto>
        event.locals.user = data.data ?? null
        event.locals.accessToken = accessToken
      } else {
        event.locals.user = null
        event.locals.accessToken = null
        event.cookies.delete('accessToken', { path: '/' })
      }
    } catch {
      event.locals.user = null
      event.locals.accessToken = null
    }
  } else {
    event.locals.user = null
    event.locals.accessToken = null
  }

  return resolve(event)
}
