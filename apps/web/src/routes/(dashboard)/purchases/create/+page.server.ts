import type { PageServerLoad, Actions } from './$types'
import type { ApiResponse, PaginatedResponse, SupplierDto, ProductDto } from '@pharmapos/types'
import { serverFetch } from '$api/server'
import { redirect } from '@sveltejs/kit'

export const load: PageServerLoad = async ({ locals }) => {
  const [suppliersRes, productsRes] = await Promise.all([
    serverFetch<ApiResponse<PaginatedResponse<SupplierDto>>>('/suppliers?limit=100&isActive=true', locals.accessToken),
    serverFetch<ApiResponse<PaginatedResponse<ProductDto>>>('/products?limit=500&isActive=true', locals.accessToken),
  ])

  return {
    suppliers: (suppliersRes.data as any)?.data ?? [],
    products: (productsRes.data as any)?.data ?? [],
  }
}

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const fd = await request.formData()
    const supplierId = fd.get('supplierId') as string
    const notes = fd.get('notes') as string
    const tax = Number(fd.get('tax') ?? 0)
    const discount = Number(fd.get('discount') ?? 0)

    const itemsJson = fd.get('items') as string
    let items: Array<{ productId: string; quantity: number; purchasePrice: number }> = []
    try {
      items = JSON.parse(itemsJson)
    } catch {
      return { error: 'Data item tidak valid' }
    }

    const res = await serverFetch<ApiResponse<{ id: string }>>('/purchase-orders', locals.accessToken, {
      method: 'POST',
      body: JSON.stringify({ supplierId, items, tax, discount, notes }),
    })

    if (!res.success) return { error: res.message ?? 'Gagal membuat purchase order' }

    redirect(302, `/purchases/${(res.data as any).id}`)
  },
}
