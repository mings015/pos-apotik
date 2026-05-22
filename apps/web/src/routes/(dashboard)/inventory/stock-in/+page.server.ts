import { fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import type { ApiResponse, PaginatedResponse, ProductDto } from '@pharmapos/types'
import { serverFetch } from '$api/server'

export const load: PageServerLoad = async ({ locals, url }) => {
  const productId = url.searchParams.get('productId') ?? ''
  const res = await serverFetch<ApiResponse<PaginatedResponse<ProductDto>>>(
    '/products?limit=100&isActive=true', locals.accessToken
  )
  return {
    products: res.data?.data ?? [],
    preselectedProductId: productId,
  }
}

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const form = await request.formData()
    const body = {
      productId: form.get('productId'),
      batchNumber: form.get('batchNumber'),
      expiredDate: form.get('expiredDate'),
      quantity: Number(form.get('quantity')),
      notes: form.get('notes') || undefined,
    }

    if (!body.productId) return fail(400, { error: 'Pilih produk terlebih dahulu' })
    if (!body.batchNumber) return fail(400, { error: 'Nomor batch wajib diisi' })
    if (!body.expiredDate) return fail(400, { error: 'Tanggal expired wajib diisi' })
    if (!body.quantity || body.quantity < 1) return fail(400, { error: 'Jumlah minimal 1' })

    const res = await serverFetch<ApiResponse>('/inventory/stock-in', locals.accessToken, {
      method: 'POST',
      body: JSON.stringify(body),
    })

    if (!res.success) return fail(400, { error: res.message })
    return { success: true, message: 'Stok masuk berhasil dicatat' }
  },
}
