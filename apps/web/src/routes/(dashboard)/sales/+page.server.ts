import type { PageServerLoad } from './$types'
import type { ApiResponse } from '@pharmapos/types'
import { serverFetch } from '$api/server'

export const load: PageServerLoad = async ({ locals }) => {
  const [settingRes, holdRes] = await Promise.all([
    serverFetch<ApiResponse<{ taxPercentage: number }>>('/settings', locals.accessToken),
    serverFetch<ApiResponse<{ data: unknown[] }>>('/sales?status=HOLD&limit=50', locals.accessToken),
  ])

  return {
    taxPercentage: Number(settingRes.data?.taxPercentage ?? 0),
    heldSales: (holdRes.data as { data: unknown[] })?.data ?? [],
  }
}
