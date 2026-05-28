import type { PageServerLoad } from './$types'
import { serverFetch } from '$api/server'

export const load: PageServerLoad = async ({ locals, url }) => {
  const now = new Date()
  const defaultFrom = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const defaultTo = now.toISOString().slice(0, 10)

  const dateFrom = url.searchParams.get('dateFrom') || defaultFrom
  const dateTo = url.searchParams.get('dateTo') || defaultTo
  const categoryId = url.searchParams.get('categoryId') || ''
  const page = url.searchParams.get('page') || '1'

  const params = new URLSearchParams({ page, limit: '25', dateFrom, dateTo })
  if (categoryId) params.set('categoryId', categoryId)

  const [reportRes, categoriesRes] = await Promise.all([
    serverFetch(`/reports/profit?${params}`, locals.accessToken),
    serverFetch('/categories?limit=100', locals.accessToken),
  ])

  return {
    report: (reportRes as any).data ?? { data: [], meta: { total: 0, page: 1, totalPages: 1 }, summary: {} },
    categories: ((categoriesRes as any).data as any)?.data ?? [],
    filters: { dateFrom, dateTo, categoryId, page: Number(page) },
  }
}
