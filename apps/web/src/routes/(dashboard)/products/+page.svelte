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
  import type { ProductDto } from '@pharmapos/types'

  export let data: PageData

  let deleteId = ''
  let showConfirm = false
  let deleteLoading = false

  let selectedProduct: ProductDto | null = null
  let showDetail = false

  function openDetail(item: ProductDto) { selectedProduct = item; showDetail = true }

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

  <div class="bg-white rounded-xl border border-gray-200 overflow-x-auto">
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
                <button on:click={() => openDetail(item)}
                  class="px-3 py-1.5 text-xs font-medium text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition">Detail</button>
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

{#if showDetail && selectedProduct}
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <button class="absolute inset-0 bg-black/40" on:click={() => showDetail = false} aria-label="Tutup"></button>
    <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div>
          <h3 class="text-base font-semibold text-gray-900">{selectedProduct.name}</h3>
          <p class="text-xs text-gray-500 font-mono mt-0.5">{selectedProduct.code}</p>
        </div>
        <div class="flex items-center gap-3">
          <Badge variant={selectedProduct.isActive ? 'success' : 'danger'}>
            {selectedProduct.isActive ? 'Aktif' : 'Nonaktif'}
          </Badge>
          <button on:click={() => showDetail = false} class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition" aria-label="Tutup">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Body -->
      <div class="px-6 py-4 space-y-4">
        <div class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <p class="text-xs text-gray-500 mb-0.5">Barcode</p>
            <p class="font-medium text-gray-900">{selectedProduct.barcode ?? '—'}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-0.5">Kategori</p>
            <p class="font-medium text-gray-900">{selectedProduct.category?.name ?? '—'}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-0.5">Satuan</p>
            <p class="font-medium text-gray-900">{selectedProduct.unit ? `${selectedProduct.unit.name} (${selectedProduct.unit.symbol})` : '—'}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-0.5">Supplier</p>
            <p class="font-medium text-gray-900">{selectedProduct.supplier?.name ?? '—'}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-0.5">Harga Beli</p>
            <p class="font-medium text-gray-900">{formatPrice(selectedProduct.purchasePrice)}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-0.5">Harga Jual</p>
            <p class="font-medium text-gray-900">{formatPrice(selectedProduct.sellingPrice)}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-0.5">Stok</p>
            <p class="font-semibold" class:text-red-600={selectedProduct.stock <= selectedProduct.minimumStock}>
              {selectedProduct.stock}
              {#if selectedProduct.stock <= selectedProduct.minimumStock}
                <span class="text-xs font-normal">(di bawah minimum)</span>
              {/if}
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-0.5">Stok Minimum</p>
            <p class="font-medium text-gray-900">{selectedProduct.minimumStock}</p>
          </div>
        </div>

        {#if selectedProduct.description}
          <div>
            <p class="text-xs text-gray-500 mb-1">Deskripsi</p>
            <p class="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">{selectedProduct.description}</p>
          </div>
        {/if}
      </div>

      <!-- Footer -->
      <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
        <button on:click={() => showDetail = false}
          class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition">Tutup</button>
        <a href="/products/{selectedProduct.id}/edit"
          class="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition">Edit Produk</a>
      </div>
    </div>
  </div>
{/if}

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
