<script lang="ts">
  import PageHeader from '$components/ui/PageHeader.svelte'
  import EmptyState from '$components/ui/EmptyState.svelte'
  import Pagination from '$components/ui/Pagination.svelte'
  import Badge from '$components/ui/Badge.svelte'
  import type { PageData } from './$types'

  export let data: PageData

  let search = data.filters.search
  let expiredStatus = data.filters.expiredStatus

  function buildQuery(page = 1) {
    const p = new URLSearchParams({ page: String(page) })
    if (search) p.set('search', search)
    if (expiredStatus) p.set('expiredStatus', expiredStatus)
    return `?${p}`
  }

  function daysUntil(date: string) {
    return Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  }

  function expiryBadge(date: string) {
    const days = daysUntil(date)
    if (days < 0) return { variant: 'danger' as const, label: `Expired ${Math.abs(days)}h lalu` }
    if (days === 0) return { variant: 'danger' as const, label: 'Expired hari ini' }
    if (days <= 30) return { variant: 'warning' as const, label: `${days} hari lagi` }
    return { variant: 'success' as const, label: `${days} hari lagi` }
  }

  function formatDate(d: string) {
    return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d))
  }
</script>

<svelte:head><title>Batch — PharmaPOS</title></svelte:head>

<div class="space-y-6">
  <PageHeader title="Batch" description="Daftar batch produk dan status expired" />

  <form method="GET" class="flex flex-wrap gap-2">
    <input name="search" bind:value={search} placeholder="Cari produk atau nomor batch..."
      class="flex-1 min-w-[200px] max-w-xs px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
    <select name="expiredStatus" bind:value={expiredStatus}
      class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
      <option value="">Semua Status</option>
      <option value="safe">Aman</option>
      <option value="near_expired">Mendekati Expired</option>
      <option value="expired">Sudah Expired</option>
    </select>
    <button type="submit" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm font-medium rounded-lg transition">Cari</button>
    <a href="?" class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition">Reset</a>
  </form>

  <div class="bg-white rounded-xl border border-gray-200 overflow-x-auto">
    <table class="w-full text-sm">
      <thead class="bg-gray-50 border-b border-gray-200">
        <tr>
          <th class="px-4 py-3 text-left font-medium text-gray-600">No. Batch</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Produk</th>
          <th class="px-4 py-3 text-right font-medium text-gray-600">Qty Tersisa</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Tgl Expired</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Status</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Dibuat</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        {#each data.batches.data as item}
          {@const exp = expiryBadge(item.expiredDate)}
          <tr class="hover:bg-gray-50 transition"
            class:bg-red-50={daysUntil(item.expiredDate) < 0}
            class:bg-yellow-50={daysUntil(item.expiredDate) >= 0 && daysUntil(item.expiredDate) <= 30}>
            <td class="px-4 py-3 font-mono text-xs text-gray-700 font-medium">{item.batchNumber}</td>
            <td class="px-4 py-3">
              <p class="font-medium text-gray-900">{item.product?.name ?? '—'}</p>
              <p class="text-xs text-gray-400">{item.product?.code ?? ''}</p>
            </td>
            <td class="px-4 py-3 text-right font-semibold
              {item.quantity === 0 ? 'text-gray-400' : 'text-gray-900'}">
              {item.quantity} {item.product?.unit?.symbol ?? ''}
            </td>
            <td class="px-4 py-3 text-gray-700">{formatDate(item.expiredDate)}</td>
            <td class="px-4 py-3"><Badge variant={exp.variant}>{exp.label}</Badge></td>
            <td class="px-4 py-3 text-xs text-gray-500">{formatDate(item.createdAt)}</td>
          </tr>
        {:else}
          <tr><td colspan="6"><EmptyState message="Belum ada data batch" /></td></tr>
        {/each}
      </tbody>
    </table>
  </div>

  {#if data.batches.totalPages > 1}
    <Pagination page={data.batches.page} totalPages={data.batches.totalPages}
      total={data.batches.total} limit={data.batches.limit}
      on:change={(e) => { window.location.href = buildQuery(e.detail) }} />
  {/if}
</div>
