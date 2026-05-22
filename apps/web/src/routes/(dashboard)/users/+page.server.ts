import { fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import type { ApiResponse, PaginatedResponse, UserDto, RoleDto } from '@pharmapos/types'
import { serverFetch } from '$api/server'

export const load: PageServerLoad = async ({ locals, url }) => {
  const page = url.searchParams.get('page') ?? '1'
  const search = url.searchParams.get('search') ?? ''

  const [usersData, rolesData] = await Promise.all([
    serverFetch<ApiResponse<PaginatedResponse<UserDto>>>(
      `/users?page=${page}&limit=10${search ? `&search=${search}` : ''}`,
      locals.accessToken,
    ),
    serverFetch<ApiResponse<RoleDto[]>>('/roles', locals.accessToken),
  ])

  return {
    users: usersData.data ?? { data: [], total: 0, page: 1, limit: 10, totalPages: 0 },
    roles: rolesData.data ?? [],
  }
}

export const actions: Actions = {
  create: async ({ request, locals }) => {
    const form = await request.formData()
    const body = {
      name: form.get('name'),
      email: form.get('email'),
      password: form.get('password'),
      roleId: form.get('roleId'),
      isActive: true,
    }

    const res = await serverFetch<ApiResponse>('/users', locals.accessToken, {
      method: 'POST',
      body: JSON.stringify(body),
    })

    if (!res.success) return fail(400, { error: res.message })
    return { success: true, message: res.message }
  },

  update: async ({ request, locals }) => {
    const form = await request.formData()
    const id = form.get('id') as string
    const body: Record<string, unknown> = {
      name: form.get('name'),
      email: form.get('email'),
      roleId: form.get('roleId'),
      isActive: form.get('isActive') === 'true',
    }
    const password = form.get('password') as string
    if (password) body.password = password

    const res = await serverFetch<ApiResponse>(`/users/${id}`, locals.accessToken, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })

    if (!res.success) return fail(400, { error: res.message })
    return { success: true, message: res.message }
  },

  delete: async ({ request, locals }) => {
    const form = await request.formData()
    const id = form.get('id') as string

    const res = await serverFetch<ApiResponse>(`/users/${id}`, locals.accessToken, {
      method: 'DELETE',
    })

    if (!res.success) return fail(400, { error: res.message })
    return { success: true, message: res.message }
  },
}
