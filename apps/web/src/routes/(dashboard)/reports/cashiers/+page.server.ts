import type { PageServerLoad } from './$types'
import { serverFetch } from '$api/server'

export const load: PageServerLoad = async ({ locals, url }) => {
  const now = new Date()
  const defaultFrom = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const defaultTo = now.toISOString().slice(0, 10)

  const dateFrom = url.searchParams.get('dateFrom') || defaultFrom
  const dateTo = url.searchParams.get('dateTo') || defaultTo
  const cashierId = url.searchParams.get('cashierId') || ''
  const page = url.searchParams.get('page') || '1'

  const params = new URLSearchParams({ page, limit: '25', dateFrom, dateTo })
  if (cashierId) params.set('cashierId', cashierId)

  const [reportRes, usersRes] = await Promise.all([
    serverFetch(`/reports/cashiers?${params}`, locals.accessToken),
    serverFetch('/users?limit=100', locals.accessToken),
  ])

  return {
    report: (reportRes as any).data ?? { data: [], meta: { total: 0, page: 1, totalPages: 1 }, summary: {} },
    cashiers: ((usersRes as any).data as any)?.data ?? [],
    filters: { dateFrom, dateTo, cashierId, page: Number(page) },
  }
}
