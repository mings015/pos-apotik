<script lang="ts">
  import { enhance } from '$app/forms'
  import { goto } from '$app/navigation'
  import PageHeader from '$components/ui/PageHeader.svelte'
  import { toast } from '$stores/toast'
  import type { PageData, ActionData } from './$types'

  export let data: PageData
  export let form: ActionData

  let formLoading = false
  let selectedProductId = data.preselectedProductId
  let adjustType: 'add' | 'subtract' = 'add'
  let quantityAbs = 1

  $: if (form?.success) { toast.success(form.message ?? 'Berhasil'); goto('/inventory') }
  $: if (form?.error) toast.error(form.error)

  $: computedQuantity = adjustType === 'add' ? quantityAbs : -quantityAbs
  $: selectedProduct = data.products.find(p => p.id === selectedProductId)
</script>

<svelte:head><title>Stock Adjustment — PharmaPOS</title></svelte:head>

<div class="space-y-6">
  <PageHeader title="Stock Adjustment" description="Koreksi manual jumlah stok produk" />

  <div class="bg-white rounded-xl border border-gray-200 p-6 max-w-lg mx-auto">
    <form method="POST"
      use:enhance={() => { formLoading = true; return async ({ update }) => { await update(); formLoading = false } }}>
      <input type="hidden" name="quantity" value={computedQuantity} />

      <div class="space-y-4">
        <div>
          <label for="adj-product" class="block text-sm font-medium text-gray-700 mb-1">Produk <span class="text-red-500">*</span></label>
          <select id="adj-product" name="productId" bind:value={selectedProductId} required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">Pilih produk...</option>
            {#each data.products as p}
              <option value={p.id}>{p.name} — Stok: {p.stock}</option>
            {/each}
          </select>
        </div>

        {#if selectedProduct}
          <div class="bg-gray-50 rounded-lg px-4 py-3 text-sm">
            <span class="text-gray-500">Stok saat ini:</span>
            <span class="ml-2 font-bold text-gray-900">{selectedProduct.stock}</span>
          </div>
        {/if}

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Tipe Adjustment</label>
          <div class="grid grid-cols-2 gap-2">
            <button type="button" on:click={() => adjustType = 'add'}
              class="py-2 rounded-lg text-sm font-medium border transition
                {adjustType === 'add' ? 'bg-green-50 border-green-400 text-green-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}">
              + Tambah Stok
            </button>
            <button type="button" on:click={() => adjustType = 'subtract'}
              class="py-2 rounded-lg text-sm font-medium border transition
                {adjustType === 'subtract' ? 'bg-red-50 border-red-400 text-red-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}">
              − Kurangi Stok
            </button>
          </div>
        </div>

        <div>
          <label for="adj-qty" class="block text-sm font-medium text-gray-700 mb-1">Jumlah <span class="text-red-500">*</span></label>
          <input id="adj-qty" type="number" min="1" bind:value={quantityAbs} required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          {#if selectedProduct}
            <p class="mt-1 text-xs text-gray-500">
              Stok setelah adjustment:
              <span class="font-semibold {selectedProduct.stock + computedQuantity < 0 ? 'text-red-600' : 'text-gray-900'}">
                {selectedProduct.stock + computedQuantity}
              </span>
            </p>
          {/if}
        </div>

        <div>
          <label for="adj-notes" class="block text-sm font-medium text-gray-700 mb-1">Alasan <span class="text-red-500">*</span></label>
          <textarea id="adj-notes" name="notes" rows="3" required placeholder="Contoh: Koreksi hasil hitung fisik, barang rusak, dll."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"></textarea>
        </div>
      </div>

      <div class="flex gap-3 mt-6 justify-end">
        <a href="/inventory" class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition">Batal</a>
        <button type="submit" disabled={formLoading || !selectedProductId || quantityAbs < 1}
          class="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 rounded-lg transition">
          {formLoading ? 'Menyimpan...' : 'Simpan Adjustment'}
        </button>
      </div>
    </form>
  </div>
</div>
