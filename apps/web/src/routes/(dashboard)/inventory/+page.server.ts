import type { PageServerLoad } from './$types'
import type { ApiResponse, PaginatedResponse } from '@pharmapos/types'
import { serverFetch } from '$api/server'

export const load: PageServerLoad = async ({ locals, url }) => {
  const page = url.searchParams.get('page') ?? '1'
  const search = url.searchParams.get('search') ?? ''
  const isActive = url.searchParams.get('isActive') ?? ''

  const params = new URLSearchParams({ page, limit: '15' })
  if (search) params.set('search', search)
  if (isActive) params.set('isActive', isActive)

  const [overviewData, stockData] = await Promise.all([
    serverFetch<ApiResponse<{ totalProducts: number; lowStockCount: number; expiredCount: number; nearExpiredCount: number }>>(
      '/inventory/overview', locals.accessToken
    ),
    serverFetch<ApiResponse<PaginatedResponse<Record<string, unknown>>>>(
      `/inventory?${params}`, locals.accessToken
    ),
  ])

  return {
    overview: overviewData.data ?? { totalProducts: 0, lowStockCount: 0, expiredCount: 0, nearExpiredCount: 0 },
    stocks: stockData.data ?? { data: [], total: 0, page: 1, limit: 15, totalPages: 0 },
    filters: { search, isActive },
  }
}
