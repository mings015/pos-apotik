import type { PageServerLoad } from './$types'
import type { ApiResponse, PaginatedResponse, StockMovementDto } from '@pharmapos/types'
import { serverFetch } from '$api/server'

export const load: PageServerLoad = async ({ locals, url }) => {
  const page = url.searchParams.get('page') ?? '1'
  const movementType = url.searchParams.get('movementType') ?? ''
  const dateFrom = url.searchParams.get('dateFrom') ?? ''
  const dateTo = url.searchParams.get('dateTo') ?? ''
  const productId = url.searchParams.get('productId') ?? ''

  const params = new URLSearchParams({ page, limit: '20' })
  if (movementType) params.set('movementType', movementType)
  if (dateFrom) params.set('dateFrom', dateFrom)
  if (dateTo) params.set('dateTo', dateTo)
  if (productId) params.set('productId', productId)

  const res = await serverFetch<ApiResponse<PaginatedResponse<StockMovementDto>>>(
    `/stock-movements?${params}`, locals.accessToken
  )

  return {
    movements: res.data ?? { data: [], total: 0, page: 1, limit: 20, totalPages: 0 },
    filters: { movementType, dateFrom, dateTo, productId },
  }
}
