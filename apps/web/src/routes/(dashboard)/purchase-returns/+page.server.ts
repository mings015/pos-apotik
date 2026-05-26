import type { PageServerLoad } from './$types'
import type { ApiResponse, PaginatedResponse, PurchaseReturnDto } from '@pharmapos/types'
import { serverFetch } from '$api/server'

export const load: PageServerLoad = async ({ locals, url }) => {
  const page = url.searchParams.get('page') ?? '1'
  const dateFrom = url.searchParams.get('dateFrom') ?? ''
  const dateTo = url.searchParams.get('dateTo') ?? ''

  const params = new URLSearchParams({ page, limit: '10' })
  if (dateFrom) params.set('dateFrom', dateFrom)
  if (dateTo) params.set('dateTo', dateTo)

  const res = await serverFetch<ApiResponse<PaginatedResponse<PurchaseReturnDto>>>(
    `/purchase-returns?${params}`,
    locals.accessToken,
  )

  return {
    returns: res.data ?? { data: [], total: 0, page: 1, limit: 10, totalPages: 0 },
    filters: { dateFrom, dateTo },
  }
}
