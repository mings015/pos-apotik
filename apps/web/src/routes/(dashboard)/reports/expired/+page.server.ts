import type { PageServerLoad } from './$types'
import { serverFetch } from '$api/server'

export const load: PageServerLoad = async ({ locals, url }) => {
  const status = url.searchParams.get('status') || ''
  const categoryId = url.searchParams.get('categoryId') || ''
  const supplierId = url.searchParams.get('supplierId') || ''
  const page = url.searchParams.get('page') || '1'

  const params = new URLSearchParams({ page, limit: '25' })
  if (status) params.set('status', status)
  if (categoryId) params.set('categoryId', categoryId)
  if (supplierId) params.set('supplierId', supplierId)

  const [reportRes, categoriesRes, suppliersRes] = await Promise.all([
    serverFetch(`/reports/expired?${params}`, locals.accessToken),
    serverFetch('/categories?limit=100', locals.accessToken),
    serverFetch('/suppliers?limit=100&isActive=true', locals.accessToken),
  ])

  return {
    report: (reportRes as any).data ?? { data: [], meta: { total: 0, page: 1, totalPages: 1 } },
    categories: ((categoriesRes as any).data as any)?.data ?? [],
    suppliers: ((suppliersRes as any).data as any)?.data ?? [],
    filters: { status, categoryId, supplierId, page: Number(page) },
  }
}
