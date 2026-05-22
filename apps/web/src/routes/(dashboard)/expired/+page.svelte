<script lang="ts">
  import PageHeader from '$components/ui/PageHeader.svelte'
  import EmptyState from '$components/ui/EmptyState.svelte'
  import Pagination from '$components/ui/Pagination.svelte'
  import Badge from '$components/ui/Badge.svelte'
  import type { PageData } from './$types'

  export let data: PageData

  let search = data.filters.search
  let status = data.filters.status

  function buildQuery(page = 1) {
    const p = new URLSearchParams({ page: String(page), status })
    if (search) p.set('search', search)
    return `?${p}`
  }

  function daysUntil(date: string) {
    return Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  }

  function formatDate(d: string) {
    return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d))
  }
</script>

<svelte:head><title>Produk Expired — PharmaPOS</title></svelte:head>

<div class="space-y-6">
  <PageHeader title="Produk Expired" description="Batch yang sudah atau mendekati expired">
    <a href="/batches" class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
      Semua Batch
    </a>
  </PageHeader>

  <div class="flex flex-wrap gap-2">
    <button on:click={() => { status = 'expired'; window.location.href = buildQuery() }}
      class="px-4 py-2 text-sm font-medium rounded-lg border transition
        {status === 'expired' ? 'bg-red-50 border-red-400 text-red-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}">
      Sudah Expired
    </button>
    <button on:click={() => { status = 'near_expired'; window.location.href = buildQuery() }}
      class="px-4 py-2 text-sm font-medium rounded-lg border transition
        {status === 'near_expired' ? 'bg-yellow-50 border-yellow-400 text-yellow-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}">
      Mendekati Expired (≤30 hari)
    </button>
  </div>

  <form method="GET" class="flex gap-2">
    <input type="hidden" name="status" value={status} />
    <input name="search" bind:value={search} placeholder="Cari produk atau batch..."
      class="flex-1 max-w-xs px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
    <button type="submit" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm font-medium rounded-lg transition">Cari</button>
  </form>

  <div class="bg-white rounded-xl border border-gray-200 overflow-x-auto">
    <table class="w-full text-sm">
      <thead class="bg-gray-50 border-b border-gray-200">
        <tr>
          <th class="px-4 py-3 text-left font-medium text-gray-600">No. Batch</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Produk</th>
          <th class="px-4 py-3 text-right font-medium text-gray-600">Qty Tersisa</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Tgl Expired</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Sisa Hari</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        {#each data.batches.data as item}
          {@const days = daysUntil(item.expiredDate)}
          <tr class="hover:bg-gray-50 transition">
            <td class="px-4 py-3 font-mono text-xs text-gray-700 font-medium">{item.batchNumber}</td>
            <td class="px-4 py-3">
              <p class="font-medium text-gray-900">{item.product?.name ?? '—'}</p>
              <p class="text-xs text-gray-400">{item.product?.code ?? ''}</p>
            </td>
            <td class="px-4 py-3 text-right font-semibold text-gray-900">
              {item.quantity} {item.product?.unit?.symbol ?? ''}
            </td>
            <td class="px-4 py-3 text-gray-700">{formatDate(item.expiredDate)}</td>
            <td class="px-4 py-3">
              {#if days < 0}
                <Badge variant="danger">{Math.abs(days)} hari lalu</Badge>
              {:else if days === 0}
                <Badge variant="danger">Hari ini</Badge>
              {:else}
                <Badge variant="warning">{days} hari lagi</Badge>
              {/if}
            </td>
          </tr>
        {:else}
          <tr>
            <td colspan="5">
              <EmptyState message={status === 'expired' ? 'Tidak ada batch yang expired' : 'Tidak ada batch mendekati expired'} />
            </td>
          </tr>
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
