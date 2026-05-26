import type { PageServerLoad } from './$types'
import type { ApiResponse, PaginatedResponse, PurchaseOrderDto, SupplierDto } from '@pharmapos/types'
import { serverFetch } from '$api/server'

export const load: PageServerLoad = async ({ locals, url }) => {
  const page = url.searchParams.get('page') ?? '1'
  const status = url.searchParams.get('status') ?? ''
  const supplierId = url.searchParams.get('supplierId') ?? ''
  const search = url.searchParams.get('search') ?? ''
  const dateFrom = url.searchParams.get('dateFrom') ?? ''
  const dateTo = url.searchParams.get('dateTo') ?? ''

  const params = new URLSearchParams({ page, limit: '10' })
  if (status) params.set('status', status)
  if (supplierId) params.set('supplierId', supplierId)
  if (search) params.set('search', search)
  if (dateFrom) params.set('dateFrom', dateFrom)
  if (dateTo) params.set('dateTo', dateTo)

  const [ordersRes, suppliersRes] = await Promise.all([
    serverFetch<ApiResponse<PaginatedResponse<PurchaseOrderDto>>>(
      `/purchase-orders?${params}`,
      locals.accessToken,
    ),
    serverFetch<ApiResponse<PaginatedResponse<SupplierDto>>>(
      '/suppliers?limit=100&isActive=true',
      locals.accessToken,
    ),
  ])

  return {
    orders: ordersRes.data ?? { data: [], total: 0, page: 1, limit: 10, totalPages: 0 },
    suppliers: (suppliersRes.data as any)?.data ?? [],
    filters: { status, supplierId, search, dateFrom, dateTo },
  }
}
