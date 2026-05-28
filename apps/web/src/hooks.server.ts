import { redirect } from '@sveltejs/kit'
import type { Handle } from '@sveltejs/kit'

function decodeJwt(token: string): { sub: string; email: string; name: string; role: string; exp: number } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'))
    if (!payload.exp || Date.now() / 1000 > payload.exp) return null
    if (!payload.role) return null
    return payload
  } catch {
    return null
  }
}

// Routes yang memerlukan role tertentu (prefix-based)
const routeRoles: Array<{ prefix: string; roles: string[] }> = [
  { prefix: '/sales', roles: ['SUPER_ADMIN', 'ADMIN', 'CASHIER'] },
  { prefix: '/purchases', roles: ['SUPER_ADMIN', 'ADMIN', 'WAREHOUSE'] },
  { prefix: '/supplier-invoices', roles: ['SUPER_ADMIN', 'ADMIN', 'WAREHOUSE'] },
  { prefix: '/purchase-returns', roles: ['SUPER_ADMIN', 'ADMIN', 'WAREHOUSE'] },
  { prefix: '/reports', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { prefix: '/inventory', roles: ['SUPER_ADMIN', 'ADMIN', 'WAREHOUSE'] },
  { prefix: '/batches', roles: ['SUPER_ADMIN', 'ADMIN', 'WAREHOUSE'] },
  { prefix: '/expired', roles: ['SUPER_ADMIN', 'ADMIN', 'WAREHOUSE'] },
  { prefix: '/categories', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { prefix: '/suppliers', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { prefix: '/units', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { prefix: '/users', roles: ['SUPER_ADMIN'] },
  { prefix: '/roles', roles: ['SUPER_ADMIN'] },
  { prefix: '/settings', roles: ['SUPER_ADMIN'] },
]

// Routes yang tidak memerlukan autentikasi
const publicRoutes = ['/login', '/']

export const handle: Handle = async ({ event, resolve }) => {
  const accessToken = event.cookies.get('accessToken')
  const { pathname } = event.url

  if (accessToken) {
    const payload = decodeJwt(accessToken)
    if (payload) {
      event.locals.user = {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        roleId: '',
        isActive: true,
        role: { id: '', name: payload.role, createdAt: new Date(), updatedAt: new Date() },
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      event.locals.accessToken = accessToken
    } else {
      event.locals.user = null
      event.locals.accessToken = null
      event.cookies.delete('accessToken', { path: '/', sameSite: 'none', secure: true })
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
