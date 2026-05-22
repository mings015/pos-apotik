import { fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import type { ApiResponse, PaginatedResponse, ProductDto } from '@pharmapos/types'
import { serverFetch } from '$api/server'

export const load: PageServerLoad = async ({ locals }) => {
  const res = await serverFetch<ApiResponse<PaginatedResponse<ProductDto>>>(
    '/products?limit=100&isActive=true', locals.accessToken
  )
  return { products: res.data?.data ?? [] }
}

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const form = await request.formData()
    const body = {
      productId: form.get('productId'),
      physicalCount: Number(form.get('physicalCount')),
      notes: form.get('notes') || undefined,
    }

    const res = await serverFetch<ApiResponse<{ difference: number; beforeStock: number; afterStock: number }>>(
      '/inventory/opname', locals.accessToken, {
        method: 'POST',
        body: JSON.stringify(body),
      }
    )

    if (!res.success) return fail(400, { error: res.message })
    return {
      success: true,
      message: 'Stock opname berhasil disimpan',
      result: res.data,
    }
  },
}
