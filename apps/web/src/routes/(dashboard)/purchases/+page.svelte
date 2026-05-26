<script lang="ts">
  import PageHeader from '$components/ui/PageHeader.svelte'
  import EmptyState from '$components/ui/EmptyState.svelte'
  import Pagination from '$components/ui/Pagination.svelte'
  import Badge from '$components/ui/Badge.svelte'
  import type { PageData } from './$types'
  import type { PurchaseOrderStatus } from '@pharmapos/types'

  export let data: PageData

  $: status = data.filters.status
  $: supplierId = data.filters.supplierId
  $: search = data.filters.search
  $: dateFrom = data.filters.dateFrom
  $: dateTo = data.filters.dateTo

  function buildQuery(page = 1) {
    const p = new URLSearchParams({ page: String(page) })
    if (status) p.set('status', status)
    if (supplierId) p.set('supplierId', supplierId)
    if (search) p.set('search', search)
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

  function statusVariant(s: PurchaseOrderStatus) {
    if (s === 'RECEIVED') return 'success' as const
    if (s === 'APPROVED') return 'info' as const
    if (s === 'PENDING') return 'warning' as const
    if (s === 'CANCELLED') return 'danger' as const
    return 'gray' as const
  }

  function statusLabel(s: PurchaseOrderStatus) {
    if (s === 'DRAFT') return 'Draft'
    if (s === 'PENDING') return 'Menunggu'
    if (s === 'APPROVED') return 'Disetujui'
    if (s === 'RECEIVED') return 'Diterima'
    if (s === 'CANCELLED') return 'Dibatalkan'
    return s
  }

  $: hasFilter = !!(status || supplierId || search || dateFrom || dateTo)
</script>

<svelte:head><title>Purchase Order — PharmaPOS</title></svelte:head>

<div class="space-y-6">
  <PageHeader title="Purchase Order" description="Kelola pemesanan barang ke supplier">
    <a href="/purchases/create"
      class="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition">
      + Buat PO
    </a>
  </PageHeader>

  <!-- Filter Bar -->
  <div class="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
    <div class="relative">
      <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input type="text" bind:value={search} placeholder="Cari nomor PO atau nama supplier..."
        on:keydown={(e) => e.key === 'Enter' && applyFilter()}
        class="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
    </div>
    <div class="flex flex-wrap gap-2 items-end">
      <div class="flex flex-col gap-1">
        <label for="po-filter-status" class="text-xs text-gray-500 font-medium">Status</label>
        <select id="po-filter-status" bind:value={status}
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="">Semua Status</option>
          <option value="DRAFT">Draft</option>
          <option value="PENDING">Menunggu</option>
          <option value="APPROVED">Disetujui</option>
          <option value="RECEIVED">Diterima</option>
          <option value="CANCELLED">Dibatalkan</option>
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label for="po-filter-supplier" class="text-xs text-gray-500 font-medium">Supplier</label>
        <select id="po-filter-supplier" bind:value={supplierId}
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="">Semua Supplier</option>
          {#each data.suppliers as s}
            <option value={s.id}>{s.name}</option>
          {/each}
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label for="po-filter-from" class="text-xs text-gray-500 font-medium">Dari Tanggal</label>
        <input id="po-filter-from" type="date" bind:value={dateFrom}
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
      </div>
      <div class="flex flex-col gap-1">
        <label for="po-filter-to" class="text-xs text-gray-500 font-medium">Sampai Tanggal</label>
        <input id="po-filter-to" type="date" bind:value={dateTo}
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
          <th class="px-4 py-3 text-left font-medium text-gray-600">No. PO</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Supplier</th>
          <th class="px-4 py-3 text-right font-medium text-gray-600">Item</th>
          <th class="px-4 py-3 text-right font-medium text-gray-600">Total</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Status</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Tanggal</th>
          <th class="px-4 py-3 text-right font-medium text-gray-600">Aksi</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        {#each data.orders.data as order}
          <tr class="hover:bg-gray-50 transition">
            <td class="px-4 py-3 font-mono text-xs font-medium text-gray-700">{order.poNumber}</td>
            <td class="px-4 py-3 text-gray-700">{order.supplier?.name ?? '—'}</td>
            <td class="px-4 py-3 text-right text-gray-500">{(order as any)._count?.items ?? 0}</td>
            <td class="px-4 py-3 text-right font-semibold text-gray-900">{formatRp(Number(order.total))}</td>
            <td class="px-4 py-3">
              <Badge variant={statusVariant(order.status as PurchaseOrderStatus)}>
                {statusLabel(order.status as PurchaseOrderStatus)}
              </Badge>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs">{formatDate(String(order.createdAt))}</td>
            <td class="px-4 py-3 text-right">
              <a href="/purchases/{order.id}"
                class="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                Detail
              </a>
            </td>
          </tr>
        {:else}
          <tr><td colspan="7"><EmptyState message="Belum ada purchase order" /></td></tr>
        {/each}
      </tbody>
    </table>
  </div>

  {#if data.orders.totalPages > 1}
    <Pagination page={data.orders.page} totalPages={data.orders.totalPages}
      total={data.orders.total} limit={data.orders.limit}
      on:change={(e) => { window.location.href = buildQuery(e.detail) }} />
  {/if}
</div>
