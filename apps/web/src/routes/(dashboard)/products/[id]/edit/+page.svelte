<script lang="ts">
  import { enhance } from '$app/forms'
  import { goto } from '$app/navigation'
  import PageHeader from '$components/ui/PageHeader.svelte'
  import { toast } from '$stores/toast'
  import type { PageData, ActionData } from './$types'

  export let data: PageData
  export let form: ActionData

  let formLoading = false

  $: if (form?.success) { toast.success(form.message ?? 'Produk berhasil diperbarui'); goto('/products') }
  $: if (form?.error) toast.error(form.error)

  const p = data.product
</script>

<svelte:head><title>Edit Produk — PharmaPOS</title></svelte:head>

<div class="space-y-6">
  <PageHeader title="Edit Produk" description="Perbarui data produk">
    <a href="/products"
      class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
      Kembali
    </a>
  </PageHeader>

  <div class="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl">
    <form method="POST"
      use:enhance={() => { formLoading = true; return async ({ update }) => { await update(); formLoading = false } }}>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Kode Produk <span class="text-red-500">*</span></label>
          <input name="code" value={p.code} required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
          <input name="barcode" value={p.barcode ?? ''}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div class="col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Nama Produk <span class="text-red-500">*</span></label>
          <input name="name" value={p.name} required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Kategori <span class="text-red-500">*</span></label>
          <select name="categoryId" required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            {#each data.categories as cat}
              <option value={cat.id} selected={cat.id === p.categoryId}>{cat.name}</option>
            {/each}
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Satuan <span class="text-red-500">*</span></label>
          <select name="unitId" required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            {#each data.units as unit}
              <option value={unit.id} selected={unit.id === p.unitId}>{unit.name} ({unit.symbol})</option>
            {/each}
          </select>
        </div>
        <div class="col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
          <select name="supplierId"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="" selected={!p.supplierId}>Tanpa supplier</option>
            {#each data.suppliers as sup}
              <option value={sup.id} selected={sup.id === p.supplierId}>{sup.name}</option>
            {/each}
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Harga Beli <span class="text-red-500">*</span></label>
          <input name="purchasePrice" type="number" min="0" value={p.purchasePrice} required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Harga Jual <span class="text-red-500">*</span></label>
          <input name="sellingPrice" type="number" min="0" value={p.sellingPrice} required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Stok</label>
          <input name="stock" type="number" min="0" value={p.stock}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Stok Minimum</label>
          <input name="minimumStock" type="number" min="0" value={p.minimumStock}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div class="col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
          <textarea name="description" rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">{p.description ?? ''}</textarea>
        </div>
        <div class="col-span-2 flex items-center gap-2">
          <input type="checkbox" id="isActive" name="isActive" value="true" checked={p.isActive} class="rounded" />
          <label for="isActive" class="text-sm text-gray-700">Produk Aktif</label>
        </div>
      </div>
      <div class="flex gap-3 mt-6 justify-end">
        <a href="/products"
          class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition">Batal</a>
        <button type="submit" disabled={formLoading}
          class="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 rounded-lg transition">
          {formLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>
    </form>
  </div>
</div>
