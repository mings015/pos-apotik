<script lang="ts">
  import { invalidateAll } from '$app/navigation'
  import { goto } from '$app/navigation'
  import PageHeader from '$components/ui/PageHeader.svelte'
  import EmptyState from '$components/ui/EmptyState.svelte'
  import Pagination from '$components/ui/Pagination.svelte'
  import ConfirmDialog from '$components/ui/ConfirmDialog.svelte'
  import Badge from '$components/ui/Badge.svelte'
  import { toast } from '$stores/toast'
  import type { PageData } from './$types'

  export let data: PageData

  let deleteId = ''
  let showConfirm = false
  let deleteLoading = false

  let search = data.filters.search
  let categoryId = data.filters.categoryId
  let supplierId = data.filters.supplierId
  let isActive = data.filters.isActive

  function buildQuery(page = 1) {
    const p = new URLSearchParams({ page: String(page) })
    if (search) p.set('search', search)
    if (categoryId) p.set('categoryId', categoryId)
    if (supplierId) p.set('supplierId', supplierId)
    if (isActive !== '') p.set('isActive', isActive)
    return `?${p}`
  }

  function formatPrice(n: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
  }
</script>

<svelte:head><title>Produk — PharmaPOS</title></svelte:head>

<div class="space-y-6">
  <PageHeader title="Produk" description="Kelola data produk dan obat">
    <a href="/products/create"
      class="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      Tambah Produk
    </a>
  </PageHeader>

  <form method="GET" class="flex flex-wrap gap-2">
    <input name="search" bind:value={search} placeholder="Cari kode atau nama..."
      class="flex-1 min-w-[200px] max-w-xs px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
    <select name="categoryId" bind:value={categoryId}
      class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
      <option value="">Semua Kategori</option>
      {#each data.categories as cat}
        <option value={cat.id}>{cat.name}</option>
      {/each}
    </select>
    <select name="supplierId" bind:value={supplierId}
      class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
      <option value="">Semua Supplier</option>
      {#each data.suppliers as sup}
        <option value={sup.id}>{sup.name}</option>
      {/each}
    </select>
    <select name="isActive" bind:value={isActive}
      class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
      <option value="">Semua Status</option>
      <option value="true">Aktif</option>
      <option value="false">Nonaktif</option>
    </select>
    <button type="submit" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm font-medium rounded-lg transition">Cari</button>
  </form>

  <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <table class="w-full text-sm">
      <thead class="bg-gray-50 border-b border-gray-200">
        <tr>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Kode</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Nama</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Kategori</th>
          <th class="px-4 py-3 text-right font-medium text-gray-600">Harga Jual</th>
          <th class="px-4 py-3 text-right font-medium text-gray-600">Stok</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Status</th>
          <th class="px-4 py-3 text-right font-medium text-gray-600">Aksi</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        {#each data.products.data as item}
          <tr class="hover:bg-gray-50 transition" class:opacity-60={!item.isActive}>
            <td class="px-4 py-3 font-mono text-xs text-gray-600">{item.code}</td>
            <td class="px-4 py-3 font-medium text-gray-900">{item.name}</td>
            <td class="px-4 py-3 text-gray-500">{item.category?.name ?? '—'}</td>
            <td class="px-4 py-3 text-right text-gray-900">{formatPrice(item.sellingPrice)}</td>
            <td class="px-4 py-3 text-right" class:text-red-600={item.stock <= item.minimumStock} class:font-semibold={item.stock <= item.minimumStock}>
              {item.stock}
            </td>
            <td class="px-4 py-3">
              <Badge variant={item.isActive ? 'success' : 'danger'}>
                {item.isActive ? 'Aktif' : 'Nonaktif'}
              </Badge>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-2">
                <a href="/products/{item.id}/edit"
                  class="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition">Edit</a>
                <button on:click={() => { deleteId = item.id; showConfirm = true }}
                  class="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition">Hapus</button>
              </div>
            </td>
          </tr>
        {:else}
          <tr><td colspan="7"><EmptyState message="Belum ada produk" /></td></tr>
        {/each}
      </tbody>
    </table>
  </div>

  {#if data.products.totalPages > 1}
    <Pagination page={data.products.page} totalPages={data.products.totalPages} total={data.products.total} limit={data.products.limit}
      on:change={(e) => { window.location.href = buildQuery(e.detail) }} />
  {/if}
</div>

<ConfirmDialog bind:open={showConfirm} title="Hapus Produk" message="Apakah Anda yakin ingin menghapus produk ini?"
  confirmLabel="Ya, Hapus" loading={deleteLoading}
  on:confirm={async () => {
    deleteLoading = true
    const fd = new FormData(); fd.set('id', deleteId)
    const res = await fetch('?/delete', { method: 'POST', body: fd })
    const result = await res.json()
    deleteLoading = false; showConfirm = false
    if (result.type === 'success') { toast.success('Produk berhasil dihapus'); await invalidateAll() }
    else toast.error('Gagal menghapus produk')
  }}
/>
