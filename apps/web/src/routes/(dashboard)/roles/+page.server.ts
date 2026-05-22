import type { PageServerLoad } from './$types'
import type { ApiResponse, RoleDto } from '@pharmapos/types'
import { serverFetch } from '$api/server'

export const load: PageServerLoad = async ({ locals }) => {
  const data = await serverFetch<ApiResponse<RoleDto[]>>('/roles', locals.accessToken)
  return { roles: data.data ?? [] }
}
