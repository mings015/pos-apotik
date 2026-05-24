<script lang="ts">
  import PageHeader from '$components/ui/PageHeader.svelte'
  import EmptyState from '$components/ui/EmptyState.svelte'
  import Pagination from '$components/ui/Pagination.svelte'
  import Badge from '$components/ui/Badge.svelte'
  import type { PageData } from './$types'

  export let data: PageData

  let status = data.filters.status
  let dateFrom = data.filters.dateFrom
  let dateTo = data.filters.dateTo

  function buildQuery(page = 1) {
    const p = new URLSearchParams({ page: String(page) })
    if (status) p.set('status', status)
    if (dateFrom) p.set('dateFrom', dateFrom)
    if (dateTo) p.set('dateTo', dateTo)
    return `?${p}`
  }

  function formatRp(n: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
  }

  function formatDate(d: string) {
    return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d))
  }

  function statusBadge(s: string) {
    if (s === 'COMPLETED') return 'success' as const
    if (s === 'HOLD') return 'warning' as const
    return 'danger' as const
  }

  function statusLabel(s: string) {
    if (s === 'COMPLETED') return 'Selesai'
    if (s === 'HOLD') return 'Hold'
    return 'Dibatalkan'
  }
</script>

<svelte:head><title>Riwayat Penjualan — PharmaPOS</title></svelte:head>

<div class="space-y-6">
  <PageHeader title="Riwayat Penjualan" description="Daftar semua transaksi penjualan">
    <a href="/sales" class="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition">
      + Transaksi Baru
    </a>
  </PageHeader>

  <form method="GET" class="flex flex-wrap gap-2">
    <select name="status" bind:value={status}
      class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
      <option value="">Semua Status</option>
      <option value="COMPLETED">Selesai</option>
      <option value="HOLD">Hold</option>
      <option value="CANCELLED">Dibatalkan</option>
    </select>
    <input type="date" name="dateFrom" bind:value={dateFrom}
      class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
    <input type="date" name="dateTo" bind:value={dateTo}
      class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
    <button type="submit" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm font-medium rounded-lg transition">Filter</button>
  </form>

  <div class="bg-white rounded-xl border border-gray-200 overflow-x-auto">
    <table class="w-full text-sm">
      <thead class="bg-gray-50 border-b border-gray-200">
        <tr>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Invoice</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Kasir</th>
          <th class="px-4 py-3 text-right font-medium text-gray-600">Item</th>
          <th class="px-4 py-3 text-right font-medium text-gray-600">Total</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Metode</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Status</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Waktu</th>
          <th class="px-4 py-3 text-right font-medium text-gray-600">Aksi</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        {#each data.sales.data as sale}
          <tr class="hover:bg-gray-50 transition">
            <td class="px-4 py-3 font-mono text-xs text-gray-700 font-medium">{sale.invoiceNumber}</td>
            <td class="px-4 py-3 text-gray-700">{sale.cashier?.name ?? '—'}</td>
            <td class="px-4 py-3 text-right text-gray-500">{sale.items?.length ?? 0}</td>
            <td class="px-4 py-3 text-right font-semibold text-gray-900">{formatRp(Number(sale.total))}</td>
            <td class="px-4 py-3 text-gray-500">{sale.paymentMethod === 'CASH' ? 'Tunai' : sale.paymentMethod === 'TRANSFER' ? 'Transfer' : '—'}</td>
            <td class="px-4 py-3">
              <Badge variant={statusBadge(String(sale.status))}>{statusLabel(String(sale.status))}</Badge>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs">{formatDate(String(sale.createdAt))}</td>
            <td class="px-4 py-3 text-right">
              <a href="/sales/{sale.id}" class="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                Detail
              </a>
            </td>
          </tr>
        {:else}
          <tr><td colspan="8"><EmptyState message="Belum ada transaksi" /></td></tr>
        {/each}
      </tbody>
    </table>
  </div>

  {#if data.sales.totalPages > 1}
    <Pagination page={data.sales.page} totalPages={data.sales.totalPages}
      total={data.sales.total} limit={data.sales.limit}
      on:change={(e) => { window.location.href = buildQuery(e.detail) }} />
  {/if}
</div>
