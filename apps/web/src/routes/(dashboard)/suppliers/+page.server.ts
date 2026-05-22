import { fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import type { ApiResponse, PaginatedResponse, SupplierDto } from '@pharmapos/types'
import { serverFetch } from '$api/server'

export const load: PageServerLoad = async ({ locals, url }) => {
  const page = url.searchParams.get('page') ?? '1'
  const search = url.searchParams.get('search') ?? ''

  const data = await serverFetch<ApiResponse<PaginatedResponse<SupplierDto>>>(
    `/suppliers?page=${page}&limit=10${search ? `&search=${search}` : ''}`,
    locals.accessToken,
  )

  return { suppliers: data.data ?? { data: [], total: 0, page: 1, limit: 10, totalPages: 0 } }
}

export const actions: Actions = {
  create: async ({ request, locals }) => {
    const form = await request.formData()
    const body = {
      name: form.get('name'),
      phone: form.get('phone') || undefined,
      email: form.get('email') || undefined,
      address: form.get('address') || undefined,
    }

    const res = await serverFetch<ApiResponse>('/suppliers', locals.accessToken, {
      method: 'POST',
      body: JSON.stringify(body),
    })

    if (!res.success) return fail(400, { error: res.message })
    return { success: true, message: res.message }
  },

  update: async ({ request, locals }) => {
    const form = await request.formData()
    const id = form.get('id') as string
    const body = {
      name: form.get('name'),
      phone: form.get('phone') || undefined,
      email: form.get('email') || undefined,
      address: form.get('address') || undefined,
      isActive: form.get('isActive') === 'true',
    }

    const res = await serverFetch<ApiResponse>(`/suppliers/${id}`, locals.accessToken, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })

    if (!res.success) return fail(400, { error: res.message })
    return { success: true, message: res.message }
  },

  delete: async ({ request, locals }) => {
    const form = await request.formData()
    const id = form.get('id') as string

    const res = await serverFetch<ApiResponse>(`/suppliers/${id}`, locals.accessToken, {
      method: 'DELETE',
    })

    if (!res.success) return fail(400, { error: res.message })
    return { success: true, message: res.message }
  },
}
