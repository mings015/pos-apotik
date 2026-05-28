import type { PageServerLoad, Actions } from './$types'
import type { ApiResponse, PurchaseOrderDto } from '@pharmapos/types'
import { serverFetch } from '$api/server'
import { redirect, fail } from '@sveltejs/kit'

export const load: PageServerLoad = async ({ locals, params }) => {
  const res = await serverFetch<ApiResponse<PurchaseOrderDto>>(
    `/purchase-orders/${params.id}`,
    locals.accessToken,
  )
  if (!res.success || !res.data) redirect(302, '/purchases')

  return {
    po: res.data,
    userRole: locals.user?.role ?? '',
  }
}

export const actions: Actions = {
  updateStatus: async ({ request, locals, params }) => {
    const fd = await request.formData()
    const status = fd.get('status') as string
    const notes = fd.get('notes') as string | null

    const res = await serverFetch<ApiResponse<unknown>>(
      `/purchase-orders/${params.id}`,
      locals.accessToken,
      { method: 'PATCH', body: JSON.stringify({ status, ...(notes ? { notes } : {}) }) },
    )
    if (!res.success) return fail(400, { error: res.message ?? 'Gagal memperbarui status' })
    return { success: true, message: `Status berhasil diubah ke ${status}` }
  },

  receiveGoods: async ({ request, locals, params }) => {
    const fd = await request.formData()
    const purchaseOrderId = params.id
    const itemsJson = fd.get('items') as string
    const notes = fd.get('notes') as string | null

    let items: unknown[]
    try {
      items = JSON.parse(itemsJson)
    } catch {
      return fail(400, { error: 'Data item tidak valid' })
    }

    const res = await serverFetch<ApiResponse<unknown>>(
      '/goods-receiving',
      locals.accessToken,
      { method: 'POST', body: JSON.stringify({ purchaseOrderId, items, notes }) },
    )
    if (!res.success) return fail(400, { error: res.message ?? 'Gagal menerima barang' })
    return { success: true, message: 'Barang berhasil diterima dan stok diperbarui' }
  },

  recordPayment: async ({ request, locals }) => {
    const fd = await request.formData()
    const invoiceId = fd.get('invoiceId') as string
    const amount = Number(fd.get('amount'))
    const paymentMethod = fd.get('paymentMethod') as string
    const paymentDate = fd.get('paymentDate') as string
    const notes = fd.get('notes') as string | null

    if (!invoiceId) return fail(400, { error: 'ID invoice tidak ditemukan' })
    if (!amount || amount <= 0) return fail(400, { error: 'Jumlah pembayaran harus lebih dari 0' })

    const res = await serverFetch<ApiResponse<unknown>>(
      `/supplier-invoices/${invoiceId}/payment`,
      locals.accessToken,
      { method: 'PATCH', body: JSON.stringify({ amount, paymentMethod, paymentDate, notes }) },
    )
    if (!res.success) return fail(400, { error: (res as any).message ?? 'Gagal mencatat pembayaran' })
    return { success: true, message: 'Pembayaran berhasil dicatat' }
  },

  createReturn: async ({ request, locals }) => {
    const fd = await request.formData()
    const supplierInvoiceId = fd.get('supplierInvoiceId') as string
    const reason = fd.get('reason') as string
    const notes = fd.get('notes') as string | null
    const itemsJson = fd.get('items') as string

    if (!reason?.trim()) return fail(400, { error: 'Alasan retur wajib diisi' })

    let items: Array<{ productId: string; batchId: string; quantity: number }> = []
    try {
      items = JSON.parse(itemsJson)
    } catch {
      return fail(400, { error: 'Data item tidak valid' })
    }

    if (items.length === 0) return fail(400, { error: 'Pilih minimal satu item untuk diretur' })

    const res = await serverFetch<ApiResponse<unknown>>(
      '/purchase-returns',
      locals.accessToken,
      { method: 'POST', body: JSON.stringify({ supplierInvoiceId, reason, notes, items }) },
    )
    if (!res.success) return fail(400, { error: (res as any).message ?? 'Gagal membuat retur pembelian' })
    return { success: true, message: 'Retur pembelian berhasil dibuat' }
  },
}
