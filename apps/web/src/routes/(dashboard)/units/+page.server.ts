import { fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import type { ApiResponse, PaginatedResponse, UnitDto } from '@pharmapos/types'
import { serverFetch } from '$api/server'

export const load: PageServerLoad = async ({ locals, url }) => {
  const page = url.searchParams.get('page') ?? '1'
  const search = url.searchParams.get('search') ?? ''

  const data = await serverFetch<ApiResponse<PaginatedResponse<UnitDto>>>(
    `/units?page=${page}&limit=10${search ? `&search=${search}` : ''}`,
    locals.accessToken,
  )

  return { units: data.data ?? { data: [], total: 0, page: 1, limit: 10, totalPages: 0 } }
}

export const actions: Actions = {
  create: async ({ request, locals }) => {
    const form = await request.formData()
    const name = form.get('name') as string
    const symbol = form.get('symbol') as string

    const res = await serverFetch<ApiResponse>('/units', locals.accessToken, {
      method: 'POST',
      body: JSON.stringify({ name, symbol }),
    })

    if (!res.success) return fail(400, { error: res.message, action: 'create' })
    return { success: true, message: res.message, action: 'create' }
  },

  update: async ({ request, locals }) => {
    const form = await request.formData()
    const id = form.get('id') as string
    const name = form.get('name') as string
    const symbol = form.get('symbol') as string

    const res = await serverFetch<ApiResponse>(`/units/${id}`, locals.accessToken, {
      method: 'PATCH',
      body: JSON.stringify({ name, symbol }),
    })

    if (!res.success) return fail(400, { error: res.message, action: 'update' })
    return { success: true, message: res.message, action: 'update' }
  },

  delete: async ({ request, locals }) => {
    const form = await request.formData()
    const id = form.get('id') as string

    const res = await serverFetch<ApiResponse>(`/units/${id}`, locals.accessToken, {
      method: 'DELETE',
    })

    if (!res.success) return fail(400, { error: res.message, action: 'delete' })
    return { success: true, message: res.message, action: 'delete' }
  },
}
