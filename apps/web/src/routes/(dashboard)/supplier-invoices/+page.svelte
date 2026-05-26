<script lang="ts">
  import PageHeader from '$components/ui/PageHeader.svelte'
  import EmptyState from '$components/ui/EmptyState.svelte'
  import Pagination from '$components/ui/Pagination.svelte'
  import Badge from '$components/ui/Badge.svelte'
  import type { PageData } from './$types'
  import type { InvoicePaymentStatus } from '@pharmapos/types'

  export let data: PageData

  $: paymentStatus = data.filters.paymentStatus
  $: supplierId = data.filters.supplierId
  $: dateFrom = data.filters.dateFrom
  $: dateTo = data.filters.dateTo

  function buildQuery(page = 1) {
    const p = new URLSearchParams({ page: String(page) })
    if (paymentStatus) p.set('paymentStatus', paymentStatus)
    if (supplierId) p.set('supplierId', supplierId)
    if (dateFrom) p.set('dateFrom', dateFrom)
    if (dateTo) p.set('dateTo', dateTo)
    return `?${p}`
  }

  function applyFilter() { window.location.href = buildQuery(1) }
  function resetFilter() { window.location.href = '?' }

  function formatRp(n: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
  }

  function formatDate(d: string) {
    return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d))
  }

  function statusVariant(s: InvoicePaymentStatus) {
    if (s === 'PAID') return 'success' as const
    if (s === 'PARTIAL') return 'warning' as const
    return 'danger' as const
  }

  function statusLabel(s: InvoicePaymentStatus) {
    if (s === 'PAID') return 'Lunas'
    if (s === 'PARTIAL') return 'Sebagian'
    return 'Belum Bayar'
  }

  $: hasFilter = !!(paymentStatus || supplierId || dateFrom || dateTo)
</script>

<svelte:head><title>Invoice Supplier — PharmaPOS</title></svelte:head>

<div class="space-y-6">
  <PageHeader title="Invoice Supplier" description="Kelola tagihan dari supplier" />

  <!-- Filter -->
  <div class="bg-white rounded-xl border border-gray-200 p-4">
    <div class="flex flex-wrap gap-2 items-end">
      <div class="flex flex-col gap-1">
        <label for="sinv-status" class="text-xs text-gray-500 font-medium">Status Pembayaran</label>
        <select id="sinv-status" bind:value={paymentStatus}
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="">Semua Status</option>
          <option value="UNPAID">Belum Bayar</option>
          <option value="PARTIAL">Sebagian</option>
          <option value="PAID">Lunas</option>
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label for="sinv-supplier" class="text-xs text-gray-500 font-medium">Supplier</label>
        <select id="sinv-supplier" bind:value={supplierId}
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="">Semua Supplier</option>
          {#each data.suppliers as s}
            <option value={s.id}>{s.name}</option>
          {/each}
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label for="sinv-from" class="text-xs text-gray-500 font-medium">Dari Tanggal</label>
        <input id="sinv-from" type="date" bind:value={dateFrom}
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
      </div>
      <div class="flex flex-col gap-1">
        <label for="sinv-to" class="text-xs text-gray-500 font-medium">Sampai Tanggal</label>
        <input id="sinv-to" type="date" bind:value={dateTo}
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
      </div>
      <div class="flex gap-2">
        <button on:click={applyFilter}
          class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition">
          Terapkan
        </button>
        {#if hasFilter}
          <button on:click={resetFilter}
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition">
            Reset
          </button>
        {/if}
      </div>
    </div>
  </div>

  <!-- Table -->
  <div class="bg-white rounded-xl border border-gray-200 overflow-x-auto">
    <table class="w-full text-sm">
      <thead class="bg-gray-50 border-b border-gray-200">
        <tr>
          <th class="px-4 py-3 text-left font-medium text-gray-600">No. Invoice</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600">No. PO</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Supplier</th>
          <th class="px-4 py-3 text-right font-medium text-gray-600">Total</th>
          <th class="px-4 py-3 text-right font-medium text-gray-600">Dibayar</th>
          <th class="px-4 py-3 text-right font-medium text-gray-600">Sisa</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Status</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Tanggal</th>
          <th class="px-4 py-3 text-right font-medium text-gray-600">Aksi</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        {#each data.invoices.data as inv}
          {@const remaining = Number(inv.totalAmount) - Number(inv.paidAmount)}
          <tr class="hover:bg-gray-50 transition">
            <td class="px-4 py-3 font-mono text-xs font-medium text-gray-700">{inv.invoiceNumber}</td>
            <td class="px-4 py-3 font-mono text-xs text-gray-500">{(inv as any).purchaseOrder?.poNumber ?? '—'}</td>
            <td class="px-4 py-3 text-gray-700">{(inv as any).purchaseOrder?.supplier?.name ?? '—'}</td>
            <td class="px-4 py-3 text-right font-semibold text-gray-900">{formatRp(Number(inv.totalAmount))}</td>
            <td class="px-4 py-3 text-right text-green-600">{formatRp(Number(inv.paidAmount))}</td>
            <td class="px-4 py-3 text-right {remaining > 0 ? 'text-red-600' : 'text-gray-400'}">{formatRp(remaining)}</td>
            <td class="px-4 py-3">
              <Badge variant={statusVariant(inv.paymentStatus as InvoicePaymentStatus)}>
                {statusLabel(inv.paymentStatus as InvoicePaymentStatus)}
              </Badge>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs">{formatDate(String(inv.createdAt))}</td>
            <td class="px-4 py-3 text-right">
              <a href="/purchases/{(inv as any).purchaseOrder?.id}"
                class="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                Lihat PO
              </a>
            </td>
          </tr>
        {:else}
          <tr><td colspan="9"><EmptyState message="Belum ada invoice supplier" /></td></tr>
        {/each}
      </tbody>
    </table>
  </div>

  {#if data.invoices.totalPages > 1}
    <Pagination page={data.invoices.page} totalPages={data.invoices.totalPages}
      total={data.invoices.total} limit={data.invoices.limit}
      on:change={(e) => { window.location.href = buildQuery(e.detail) }} />
  {/if}
</div>
