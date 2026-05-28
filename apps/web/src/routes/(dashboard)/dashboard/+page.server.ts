import type { PageServerLoad } from './$types'
import { serverFetch } from '$api/server'

export const load: PageServerLoad = async ({ locals }) => {
  const role = locals.user?.role?.name ?? ''

  if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
    try {
      const today = new Date().toISOString().split('T')[0]
      const [statsRes, recentRes] = await Promise.all([
        serverFetch('/analytics/dashboard', locals.accessToken),
        serverFetch(`/sales?status=COMPLETED&dateFrom=${today}&limit=6`, locals.accessToken),
      ])
      return {
        stats: (statsRes as any).data ?? null,
        role,
        recentSales: (recentRes as any).data?.data ?? [],
      }
    } catch {
      return { stats: null, role, recentSales: [] }
    }
  }

  if (role === 'WAREHOUSE') {
    try {
      const [statsRes, pendingPORes, approvedPORes] = await Promise.all([
        serverFetch('/analytics/dashboard', locals.accessToken),
        serverFetch('/purchase-orders?status=PENDING&limit=1', locals.accessToken),
        serverFetch('/purchase-orders?status=APPROVED&limit=1', locals.accessToken),
      ])
      return {
        stats: (statsRes as any).data ?? null,
        role,
        pendingPOCount: Number((pendingPORes as any).data?.total ?? 0),
        approvedPOCount: Number((approvedPORes as any).data?.total ?? 0),
      }
    } catch {
      return { stats: null, role, pendingPOCount: 0, approvedPOCount: 0 }
    }
  }

  if (role === 'CASHIER') {
    try {
      const today = new Date().toISOString().split('T')[0]
      const cashierId = locals.user?.id ?? ''
      const [todayRes, holdRes] = await Promise.all([
        serverFetch(`/sales?status=COMPLETED&cashierId=${cashierId}&dateFrom=${today}&limit=6`, locals.accessToken),
        serverFetch('/sales?status=HOLD&limit=1', locals.accessToken),
      ])
      return {
        stats: null,
        role,
        cashierToday: {
          transactions: Number((todayRes as any).data?.total ?? 0),
          recentSales: (todayRes as any).data?.data ?? [],
        },
        heldCount: Number((holdRes as any).data?.total ?? 0),
      }
    } catch {
      return { stats: null, role, cashierToday: { transactions: 0, recentSales: [] }, heldCount: 0 }
    }
  }

  return { stats: null, role }
}
