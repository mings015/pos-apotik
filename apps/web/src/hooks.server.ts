import { redirect } from '@sveltejs/kit'
import type { Handle } from '@sveltejs/kit'
import type { UserDto, ApiResponse } from '@pharmapos/types'

const API_URL = process.env.API_URL || 'http://localhost:3000/api'

// Routes yang memerlukan role tertentu (prefix-based)
const routeRoles: Array<{ prefix: string; roles: string[] }> = [
  { prefix: '/sales', roles: ['SUPER_ADMIN', 'ADMIN', 'CASHIER'] },
  { prefix: '/purchases', roles: ['SUPER_ADMIN', 'ADMIN', 'WAREHOUSE'] },
  { prefix: '/reports', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { prefix: '/inventory', roles: ['SUPER_ADMIN', 'ADMIN', 'WAREHOUSE'] },
  { prefix: '/batches', roles: ['SUPER_ADMIN', 'ADMIN', 'WAREHOUSE'] },
  { prefix: '/expired', roles: ['SUPER_ADMIN', 'ADMIN', 'WAREHOUSE'] },
  { prefix: '/categories', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { prefix: '/suppliers', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { prefix: '/units', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { prefix: '/users', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { prefix: '/roles', roles: ['SUPER_ADMIN'] },
  { prefix: '/settings', roles: ['SUPER_ADMIN'] },
]

// Routes yang tidak memerlukan autentikasi
const publicRoutes = ['/login', '/']

export const handle: Handle = async ({ event, resolve }) => {
  const accessToken = event.cookies.get('accessToken')
  const { pathname } = event.url

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

  const user = event.locals.user
  const isPublic = publicRoutes.includes(pathname)

  // Sudah login tapi akses halaman publik → ke dashboard
  if (user && isPublic) {
    throw redirect(303, '/dashboard')
  }

  // Belum login dan bukan halaman publik → ke login
  if (!user && !isPublic) {
    throw redirect(303, '/login')
  }

  // Sudah login, cek role untuk route yang dibatasi
  if (user) {
    const userRole = user.role?.name ?? ''
    const restricted = routeRoles.find((r) => pathname.startsWith(r.prefix))
    if (restricted && !restricted.roles.includes(userRole)) {
      throw redirect(303, '/dashboard')
    }
  }

  return resolve(event)
}
