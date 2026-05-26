import type { PageServerLoad } from './$types'
import type { ApiResponse, PaginatedResponse, SupplierInvoiceDto, SupplierDto } from '@pharmapos/types'
import { serverFetch } from '$api/server'

export const load: PageServerLoad = async ({ locals, url }) => {
  const page = url.searchParams.get('page') ?? '1'
  const paymentStatus = url.searchParams.get('paymentStatus') ?? ''
  const supplierId = url.searchParams.get('supplierId') ?? ''
  const dateFrom = url.searchParams.get('dateFrom') ?? ''
  const dateTo = url.searchParams.get('dateTo') ?? ''

  const params = new URLSearchParams({ page, limit: '10' })
  if (paymentStatus) params.set('paymentStatus', paymentStatus)
  if (supplierId) params.set('supplierId', supplierId)
  if (dateFrom) params.set('dateFrom', dateFrom)
  if (dateTo) params.set('dateTo', dateTo)

  const [invoicesRes, suppliersRes] = await Promise.all([
    serverFetch<ApiResponse<PaginatedResponse<SupplierInvoiceDto>>>(
      `/supplier-invoices?${params}`,
      locals.accessToken,
    ),
    serverFetch<ApiResponse<PaginatedResponse<SupplierDto>>>(
      '/suppliers?limit=100&isActive=true',
      locals.accessToken,
    ),
  ])

  return {
    invoices: invoicesRes.data ?? { data: [], total: 0, page: 1, limit: 10, totalPages: 0 },
    suppliers: (suppliersRes.data as any)?.data ?? [],
    filters: { paymentStatus, supplierId, dateFrom, dateTo },
  }
}
