import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import type { ApiResponse } from '@pharmapos/types'
import { serverFetch } from '$api/server'

export const load: PageServerLoad = async ({ locals, params }) => {
  const res = await serverFetch<ApiResponse<Record<string, unknown>>>(`/sales/${params.id}`, locals.accessToken)
  if (!res.success || !res.data) throw error(404, 'Transaksi tidak ditemukan')
  const [settingRes] = await Promise.all([
    serverFetch<ApiResponse<{ storeName: string; taxPercentage: number }>>('/settings', locals.accessToken),
  ])
  return { sale: res.data, storeName: settingRes.data?.storeName ?? 'PharmaPOS' }
}
