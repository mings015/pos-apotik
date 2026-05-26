<script lang="ts">
  import PageHeader from '$components/ui/PageHeader.svelte'
  import EmptyState from '$components/ui/EmptyState.svelte'
  import Pagination from '$components/ui/Pagination.svelte'
  import type { PageData } from './$types'

  export let data: PageData

  $: dateFrom = data.filters.dateFrom
  $: dateTo = data.filters.dateTo

  function buildQuery(page = 1) {
    const p = new URLSearchParams({ page: String(page) })
    if (dateFrom) p.set('dateFrom', dateFrom)
    if (dateTo) p.set('dateTo', dateTo)
    return `?${p}`
  }

  function applyFilter() { window.location.href = buildQuery(1) }
  function resetFilter() { window.location.href = '?' }

  function formatDate(d: string) {
    return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d))
  }

  $: hasFilter = !!(dateFrom || dateTo)
</script>

<svelte:head><title>Retur Pembelian — PharmaPOS</title></svelte:head>

<div class="space-y-6">
  <PageHeader title="Retur Pembelian" description="Daftar pengembalian barang ke supplier" />

  <!-- Filter -->
  <div class="bg-white rounded-xl border border-gray-200 p-4">
    <div class="flex flex-wrap gap-2 items-end">
      <div class="flex flex-col gap-1">
        <label for="rtn-from" class="text-xs text-gray-500 font-medium">Dari Tanggal</label>
        <input id="rtn-from" type="date" bind:value={dateFrom}
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
      </div>
      <div class="flex flex-col gap-1">
        <label for="rtn-to" class="text-xs text-gray-500 font-medium">Sampai Tanggal</label>
        <input id="rtn-to" type="date" bind:value={dateTo}
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
          <th class="px-4 py-3 text-left font-medium text-gray-600">No. Retur</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600">No. Invoice</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Supplier</th>
          <th class="px-4 py-3 text-right font-medium text-gray-600">Item</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Alasan</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Tanggal</th>
          <th class="px-4 py-3 text-right font-medium text-gray-600">Aksi</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        {#each data.returns.data as rtn}
          <tr class="hover:bg-gray-50 transition">
            <td class="px-4 py-3 font-mono text-xs font-medium text-gray-700">{rtn.returnNumber}</td>
            <td class="px-4 py-3 font-mono text-xs text-gray-500">{(rtn as any).supplierInvoice?.invoiceNumber ?? '—'}</td>
            <td class="px-4 py-3 text-gray-700">{(rtn as any).supplierInvoice?.purchaseOrder?.supplier?.name ?? '—'}</td>
            <td class="px-4 py-3 text-right text-gray-500">{(rtn as any)._count?.items ?? 0}</td>
            <td class="px-4 py-3 text-gray-600 max-w-xs truncate">{rtn.reason}</td>
            <td class="px-4 py-3 text-gray-500 text-xs">{formatDate(String(rtn.createdAt))}</td>
            <td class="px-4 py-3 text-right">
              <a href="/purchases/{(rtn as any).supplierInvoice?.purchaseOrder?.id}"
                class="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                Lihat PO
              </a>
            </td>
          </tr>
        {:else}
          <tr><td colspan="7"><EmptyState message="Belum ada retur pembelian" /></td></tr>
        {/each}
      </tbody>
    </table>
  </div>

  {#if data.returns.totalPages > 1}
    <Pagination page={data.returns.page} totalPages={data.returns.totalPages}
      total={data.returns.total} limit={data.returns.limit}
      on:change={(e) => { window.location.href = buildQuery(e.detail) }} />
  {/if}
</div>
