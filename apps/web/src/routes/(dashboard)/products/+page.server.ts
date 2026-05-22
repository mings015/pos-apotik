import { fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import type { ApiResponse, PaginatedResponse, ProductDto, CategoryDto, SupplierDto } from '@pharmapos/types'
import { serverFetch } from '$api/server'

export const load: PageServerLoad = async ({ locals, url }) => {
  const page = url.searchParams.get('page') ?? '1'
  const search = url.searchParams.get('search') ?? ''
  const categoryId = url.searchParams.get('categoryId') ?? ''
  const supplierId = url.searchParams.get('supplierId') ?? ''
  const isActive = url.searchParams.get('isActive') ?? ''

  const params = new URLSearchParams({ page, limit: '10' })
  if (search) params.set('search', search)
  if (categoryId) params.set('categoryId', categoryId)
  if (supplierId) params.set('supplierId', supplierId)
  if (isActive !== '') params.set('isActive', isActive)

  const [productsData, categoriesData, suppliersData] = await Promise.all([
    serverFetch<ApiResponse<PaginatedResponse<ProductDto>>>(`/products?${params}`, locals.accessToken),
    serverFetch<ApiResponse<PaginatedResponse<CategoryDto>>>('/categories?limit=100', locals.accessToken),
    serverFetch<ApiResponse<PaginatedResponse<SupplierDto>>>('/suppliers?limit=100', locals.accessToken),
  ])

  return {
    products: productsData.data ?? { data: [], total: 0, page: 1, limit: 10, totalPages: 0 },
    categories: categoriesData.data?.data ?? [],
    suppliers: suppliersData.data?.data ?? [],
    filters: { search, categoryId, supplierId, isActive },
  }
}

export const actions: Actions = {
  delete: async ({ request, locals }) => {
    const form = await request.formData()
    const id = form.get('id') as string

    const res = await serverFetch<ApiResponse>(`/products/${id}`, locals.accessToken, {
      method: 'DELETE',
    })

    if (!res.success) return fail(400, { error: res.message })
    return { success: true, message: res.message }
  },
}
