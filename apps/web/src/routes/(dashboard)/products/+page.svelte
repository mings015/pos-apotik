<script lang="ts">
  import { invalidateAll } from '$app/navigation'
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
      class="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition shadow-sm">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      Tambah Produk
    </a>
  </PageHeader>

  <!-- Filter bar -->
  <form method="GET" class="flex flex-wrap items-center gap-2">
    <div class="relative flex-1 min-w-[180px] max-w-xs">
      <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
      </svg>
      <input name="search" bind:value={search} placeholder="Cari kode atau nama..."
        class="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
    </div>
    <select name="categoryId" bind:value={categoryId}
      class="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
      <option value="">Semua Kategori</option>
      {#each data.categories as cat}
        <option value={cat.id}>{cat.name}</option>
      {/each}
    </select>
    <select name="supplierId" bind:value={supplierId}
      class="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
      <option value="">Semua Supplier</option>
      {#each data.suppliers as sup}
        <option value={sup.id}>{sup.name}</option>
      {/each}
    </select>
    <select name="isActive" bind:value={isActive}
      class="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
      <option value="">Semua Status</option>
      <option value="true">Aktif</option>
      <option value="false">Nonaktif</option>
    </select>
    <button type="submit"
      class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm font-medium rounded-xl transition text-gray-700">
      Cari
    </button>
    {#if data.products.total > 0}
      <span class="text-sm text-gray-400 ml-1">{data.products.total} produk</span>
    {/if}
  </form>

  <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden overflow-x-auto">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-gray-100 bg-gray-50/80">
          <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Produk</th>
          <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Kategori</th>
          <th class="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Harga Jual</th>
          <th class="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Stok</th>
          <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
          <th class="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-50">
        {#each data.products.data as item}
          {@const lowStock = item.stock <= item.minimumStock}
          {@const outOfStock = item.stock === 0}
          <tr class="hover:bg-gray-50/60 transition-colors" class:opacity-50={!item.isActive}>
            <td class="px-5 py-3.5">
              <div>
                <p class="font-semibold text-gray-900">{item.name}</p>
                <p class="text-xs text-gray-400 font-mono mt-0.5">{item.code}</p>
              </div>
            </td>
            <td class="px-5 py-3.5 text-gray-500">{item.category?.name ?? '—'}</td>
            <td class="px-5 py-3.5 text-right font-medium text-gray-900">{formatPrice(item.sellingPrice)}</td>
            <td class="px-5 py-3.5 text-right">
              {#if outOfStock}
                <span class="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                  <span class="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                  Habis
                </span>
              {:else if lowStock}
                <span class="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  <span class="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                  {item.stock}
                </span>
              {:else}
                <span class="font-medium text-gray-700">{item.stock}</span>
              {/if}
            </td>
            <td class="px-5 py-3.5">
              <span class="inline-flex items-center gap-1.5 text-xs font-medium {item.isActive ? 'text-emerald-700' : 'text-gray-400'}">
                <span class="w-1.5 h-1.5 rounded-full {item.isActive ? 'bg-emerald-500' : 'bg-gray-300'}"></span>
                {item.isActive ? 'Aktif' : 'Nonaktif'}
              </span>
            </td>
            <td class="px-5 py-3.5">
              <div class="flex items-center justify-end gap-1">
                <button on:click={() => openDetail(item)}
                  class="p-1.5 rounded-lg text-gray-400 hover:text-sky-600 hover:bg-sky-50 transition" title="Detail">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </button>
                <a href="/products/{item.id}/edit"
                  class="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition" title="Edit">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </a>
                <button on:click={() => { deleteId = item.id; showConfirm = true }}
                  class="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition" title="Hapus">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        {:else}
          <tr><td colspan="6"><EmptyState message="Belum ada produk" /></td></tr>
        {/each}
      </tbody>
    </table>
  </div>

  {#if data.products.totalPages > 1}
    <Pagination page={data.products.page} totalPages={data.products.totalPages} total={data.products.total} limit={data.products.limit}
      on:change={(e) => { window.location.href = buildQuery(e.detail) }} />
  {/if}
</div>

<!-- Detail Modal -->
{#if showDetail && selectedProduct}
  {@const sp = selectedProduct}
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <button class="absolute inset-0 bg-black/40 backdrop-blur-sm" on:click={() => showDetail = false} aria-label="Tutup"></button>
    <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
      <!-- Header -->
      <div class="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
        <div class="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
        </div>
        <div class="min-w-0">
          <h3 class="text-base font-semibold text-gray-900 truncate">{sp.name}</h3>
          <p class="text-xs text-gray-400 font-mono">{sp.code}</p>
        </div>
        <div class="flex items-center gap-2 ml-auto shrink-0">
          <span class="inline-flex items-center gap-1.5 text-xs font-medium {sp.isActive ? 'text-emerald-700' : 'text-gray-400'}">
            <span class="w-1.5 h-1.5 rounded-full {sp.isActive ? 'bg-emerald-500' : 'bg-gray-300'}"></span>
            {sp.isActive ? 'Aktif' : 'Nonaktif'}
          </span>
          <button on:click={() => showDetail = false} class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition" aria-label="Tutup">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Body -->
      <div class="px-6 py-5 space-y-4">
        <div class="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div>
            <p class="text-xs text-gray-400 mb-0.5">Barcode</p>
            <p class="font-medium text-gray-900 font-mono">{sp.barcode ?? '—'}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 mb-0.5">Kategori</p>
            <p class="font-medium text-gray-900">{sp.category?.name ?? '—'}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 mb-0.5">Satuan</p>
            <p class="font-medium text-gray-900">{sp.unit ? `${sp.unit.name} (${sp.unit.symbol})` : '—'}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 mb-0.5">Supplier</p>
            <p class="font-medium text-gray-900">{sp.supplier?.name ?? '—'}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 mb-0.5">Harga Beli</p>
            <p class="font-medium text-gray-900">{formatPrice(sp.purchasePrice)}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 mb-0.5">Harga Jual</p>
            <p class="font-semibold text-gray-900">{formatPrice(sp.sellingPrice)}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 mb-0.5">Stok</p>
            <p class="font-semibold {sp.stock <= sp.minimumStock ? 'text-red-600' : 'text-gray-900'}">
              {sp.stock}
              {#if sp.stock <= sp.minimumStock}
                <span class="text-xs font-normal text-red-500 ml-1">(di bawah minimum)</span>
              {/if}
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-400 mb-0.5">Stok Minimum</p>
            <p class="font-medium text-gray-900">{sp.minimumStock}</p>
          </div>
        </div>

        {#if sp.description}
          <div class="bg-gray-50 rounded-xl px-4 py-3">
            <p class="text-xs text-gray-400 mb-1">Deskripsi</p>
            <p class="text-sm text-gray-700">{sp.description}</p>
          </div>
        {/if}
      </div>

      <!-- Footer -->
      <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50/60">
        <button on:click={() => showDetail = false}
          class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-100 transition">Tutup</button>
        <a href="/products/{sp.id}/edit"
          class="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition">Edit Produk</a>
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
