import { fail, error } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import type { ApiResponse, PaginatedResponse, ProductDto, CategoryDto, UnitDto, SupplierDto } from '@pharmapos/types'
import { serverFetch } from '$api/server'

export const load: PageServerLoad = async ({ locals, params }) => {
  const [productData, categoriesData, unitsData, suppliersData] = await Promise.all([
    serverFetch<ApiResponse<ProductDto>>(`/products/${params.id}`, locals.accessToken),
    serverFetch<ApiResponse<PaginatedResponse<CategoryDto>>>('/categories?limit=100', locals.accessToken),
    serverFetch<ApiResponse<PaginatedResponse<UnitDto>>>('/units?limit=100', locals.accessToken),
    serverFetch<ApiResponse<PaginatedResponse<SupplierDto>>>('/suppliers?limit=100', locals.accessToken),
  ])

  if (!productData.success || !productData.data) throw error(404, 'Produk tidak ditemukan')

  return {
    product: productData.data,
    categories: categoriesData.data?.data ?? [],
    units: unitsData.data?.data ?? [],
    suppliers: suppliersData.data?.data ?? [],
  }
}

export const actions: Actions = {
  default: async ({ request, locals, params }) => {
    const form = await request.formData()

    const body: Record<string, unknown> = {
      code: form.get('code'),
      name: form.get('name'),
      categoryId: form.get('categoryId'),
      unitId: form.get('unitId'),
      purchasePrice: Number(form.get('purchasePrice')),
      sellingPrice: Number(form.get('sellingPrice')),
      stock: Number(form.get('stock') ?? 0),
      minimumStock: Number(form.get('minimumStock') ?? 0),
      isActive: form.get('isActive') === 'true',
    }

    const barcode = form.get('barcode') as string
    if (barcode) body.barcode = barcode

    const supplierId = form.get('supplierId') as string
    if (supplierId) body.supplierId = supplierId

    const description = form.get('description') as string
    if (description) body.description = description

    const res = await serverFetch<ApiResponse>(`/products/${params.id}`, locals.accessToken, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })

    if (!res.success) return fail(400, { error: res.message })
    return { success: true, message: 'Produk berhasil diperbarui' }
  },
}
