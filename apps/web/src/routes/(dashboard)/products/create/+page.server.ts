import { fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import type { ApiResponse, PaginatedResponse, CategoryDto, UnitDto, SupplierDto } from '@pharmapos/types'
import { serverFetch } from '$api/server'

export const load: PageServerLoad = async ({ locals }) => {
  const [categoriesData, unitsData, suppliersData] = await Promise.all([
    serverFetch<ApiResponse<PaginatedResponse<CategoryDto>>>('/categories?limit=100', locals.accessToken),
    serverFetch<ApiResponse<PaginatedResponse<UnitDto>>>('/units?limit=100', locals.accessToken),
    serverFetch<ApiResponse<PaginatedResponse<SupplierDto>>>('/suppliers?limit=100', locals.accessToken),
  ])

  return {
    categories: categoriesData.data?.data ?? [],
    units: unitsData.data?.data ?? [],
    suppliers: suppliersData.data?.data ?? [],
  }
}

export const actions: Actions = {
  default: async ({ request, locals }) => {
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
    }

    const barcode = form.get('barcode') as string
    if (barcode) body.barcode = barcode

    const supplierId = form.get('supplierId') as string
    if (supplierId) body.supplierId = supplierId

    const description = form.get('description') as string
    if (description) body.description = description

    const res = await serverFetch<ApiResponse>('/products', locals.accessToken, {
      method: 'POST',
      body: JSON.stringify(body),
    })

    if (!res.success) return fail(400, { error: res.message })
    return { success: true, message: 'Produk berhasil ditambahkan' }
  },
}
