import type { PageServerLoad } from './$types'
import { serverFetch } from '$api/server'

export const load: PageServerLoad = async ({ locals }) => {
  const role = locals.user?.role?.name ?? ''
  const canSeeDashboard = role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'WAREHOUSE'

  if (!canSeeDashboard) return { stats: null, role }

  try {
    const res = await serverFetch('/analytics/dashboard', locals.accessToken)
    return { stats: (res as any).data ?? null, role }
  } catch {
    return { stats: null, role }
  }
}
