import type { PageServerLoad } from './$types'
import type { ApiResponse, PaginatedResponse } from '@pharmapos/types'
import { serverFetch } from '$api/server'

export const load: PageServerLoad = async ({ locals, url }) => {
  const page = url.searchParams.get('page') ?? '1'
  const status = url.searchParams.get('status') ?? ''
  const dateFrom = url.searchParams.get('dateFrom') ?? ''
  const dateTo = url.searchParams.get('dateTo') ?? ''

  const params = new URLSearchParams({ page, limit: '20' })
  if (status) params.set('status', status)
  if (dateFrom) params.set('dateFrom', dateFrom)
  if (dateTo) params.set('dateTo', dateTo)

  const res = await serverFetch<ApiResponse<PaginatedResponse<Record<string, unknown>>>>(
    `/sales?${params}`, locals.accessToken
  )

  return {
    sales: res.data ?? { data: [], total: 0, page: 1, limit: 20, totalPages: 0 },
    filters: { status, dateFrom, dateTo },
  }
}
