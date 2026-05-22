<script lang="ts">
  import PageHeader from '$components/ui/PageHeader.svelte'
  import EmptyState from '$components/ui/EmptyState.svelte'
  import Pagination from '$components/ui/Pagination.svelte'
  import Badge from '$components/ui/Badge.svelte'
  import type { PageData } from './$types'

  export let data: PageData

  let movementType = data.filters.movementType
  let dateFrom = data.filters.dateFrom
  let dateTo = data.filters.dateTo

  function buildQuery(page = 1) {
    const p = new URLSearchParams({ page: String(page) })
    if (movementType) p.set('movementType', movementType)
    if (dateFrom) p.set('dateFrom', dateFrom)
    if (dateTo) p.set('dateTo', dateTo)
    return `?${p}`
  }

  const typeConfig: Record<string, { label: string; variant: 'success' | 'danger' | 'warning' | 'info' | 'default' }> = {
    IN:         { label: 'Masuk',      variant: 'success' },
    OUT:        { label: 'Keluar',     variant: 'danger' },
    ADJUSTMENT: { label: 'Adjustment', variant: 'warning' },
    OPNAME:     { label: 'Opname',     variant: 'info' },
    EXPIRED:    { label: 'Expired',    variant: 'danger' },
    RETURN:     { label: 'Return',     variant: 'default' },
  }

  function formatDate(d: string | Date) {
    return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d))
  }
</script>

<svelte:head><title>Riwayat Pergerakan Stok — PharmaPOS</title></svelte:head>

<div class="space-y-6">
  <PageHeader title="Riwayat Pergerakan Stok" description="Log semua perubahan stok">
    <a href="/inventory" class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
      Kembali
    </a>
  </PageHeader>

  <form method="GET" class="flex flex-wrap gap-2">
    <select name="movementType" bind:value={movementType}
      class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
      <option value="">Semua Tipe</option>
      <option value="IN">Masuk</option>
      <option value="OUT">Keluar</option>
      <option value="ADJUSTMENT">Adjustment</option>
      <option value="OPNAME">Opname</option>
      <option value="EXPIRED">Expired</option>
      <option value="RETURN">Return</option>
    </select>
    <input type="date" name="dateFrom" bind:value={dateFrom}
      class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
    <input type="date" name="dateTo" bind:value={dateTo}
      class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
    <button type="submit" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm font-medium rounded-lg transition">Filter</button>
    <a href="?" class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition">Reset</a>
  </form>

  <div class="bg-white rounded-xl border border-gray-200 overflow-x-auto">
    <table class="w-full text-sm">
      <thead class="bg-gray-50 border-b border-gray-200">
        <tr>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Waktu</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Tipe</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Produk</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Batch</th>
          <th class="px-4 py-3 text-right font-medium text-gray-600">Qty</th>
          <th class="px-4 py-3 text-right font-medium text-gray-600">Sebelum</th>
          <th class="px-4 py-3 text-right font-medium text-gray-600">Sesudah</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Catatan</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Oleh</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        {#each data.movements.data as item}
          {@const cfg = typeConfig[item.movementType] ?? { label: item.movementType, variant: 'default' as const }}
          <tr class="hover:bg-gray-50 transition">
            <td class="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(item.createdAt)}</td>
            <td class="px-4 py-3"><Badge variant={cfg.variant}>{cfg.label}</Badge></td>
            <td class="px-4 py-3">
              <p class="font-medium text-gray-900">{item.product?.name ?? '—'}</p>
              <p class="text-xs text-gray-400 font-mono">{item.product?.code ?? ''}</p>
            </td>
            <td class="px-4 py-3 text-xs text-gray-500">{item.batch?.batchNumber ?? '—'}</td>
            <td class="px-4 py-3 text-right font-semibold
              {item.movementType === 'IN' || (item.movementType === 'ADJUSTMENT' && item.quantity > 0) || (item.movementType === 'OPNAME' && item.quantity > 0) ? 'text-green-600' : 'text-red-600'}">
              {item.quantity > 0 ? '+' : ''}{item.quantity}
            </td>
            <td class="px-4 py-3 text-right text-gray-500">{item.beforeStock}</td>
            <td class="px-4 py-3 text-right font-medium text-gray-900">{item.afterStock}</td>
            <td class="px-4 py-3 text-xs text-gray-500 max-w-[150px] truncate">{item.notes ?? '—'}</td>
            <td class="px-4 py-3 text-xs text-gray-500">{item.createdBy?.name ?? '—'}</td>
          </tr>
        {:else}
          <tr><td colspan="9"><EmptyState message="Belum ada riwayat pergerakan" /></td></tr>
        {/each}
      </tbody>
    </table>
  </div>

  {#if data.movements.totalPages > 1}
    <Pagination page={data.movements.page} totalPages={data.movements.totalPages}
      total={data.movements.total} limit={data.movements.limit}
      on:change={(e) => { window.location.href = buildQuery(e.detail) }} />
  {/if}
</div>
