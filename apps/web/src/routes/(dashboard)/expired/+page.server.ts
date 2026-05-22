import type { PageServerLoad } from './$types'
import type { ApiResponse, PaginatedResponse } from '@pharmapos/types'
import { serverFetch } from '$api/server'

export const load: PageServerLoad = async ({ locals, url }) => {
  const page = url.searchParams.get('page') ?? '1'
  const search = url.searchParams.get('search') ?? ''
  const status = url.searchParams.get('status') ?? 'expired'

  const params = new URLSearchParams({ page, limit: '15', expiredStatus: status })
  if (search) params.set('search', search)

  const res = await serverFetch<ApiResponse<PaginatedResponse<Record<string, unknown>>>>(
    `/batches?${params}`, locals.accessToken
  )

  return {
    batches: res.data ?? { data: [], total: 0, page: 1, limit: 15, totalPages: 0 },
    filters: { search, status },
  }
}
