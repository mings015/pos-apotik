<script lang="ts">
  import { enhance } from '$app/forms'
  import { goto } from '$app/navigation'
  import PageHeader from '$components/ui/PageHeader.svelte'
  import { toast } from '$stores/toast'
  import type { PageData, ActionData } from './$types'

  export let data: PageData
  export let form: ActionData

  let formLoading = false
  let selectedProductId = ''
  let physicalCount = 0

  type FormResult = { success?: boolean; message?: string; error?: string } | null
  $: f = form as FormResult
  $: if (f?.success) { toast.success(f.message ?? 'Berhasil'); goto('/inventory') }
  $: if (f?.error) toast.error(f.error ?? 'Terjadi kesalahan')

  $: selectedProduct = data.products.find(p => p.id === selectedProductId)
  $: difference = selectedProduct ? physicalCount - selectedProduct.stock : 0
</script>

<svelte:head><title>Stock Opname — PharmaPOS</title></svelte:head>

<div class="space-y-6">
  <PageHeader title="Stock Opname" description="Cocokkan stok fisik dengan stok sistem" />

  <div class="bg-white rounded-xl border border-gray-200 p-6 max-w-lg mx-auto">
    <form method="POST"
      use:enhance={() => { formLoading = true; return async ({ update }) => { await update(); formLoading = false } }}>
      <div class="space-y-4">
        <div>
          <label for="opname-product" class="block text-sm font-medium text-gray-700 mb-1">Produk <span class="text-red-500">*</span></label>
          <select id="opname-product" name="productId" bind:value={selectedProductId} required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">Pilih produk...</option>
            {#each data.products as p}
              <option value={p.id}>{p.name} ({p.code})</option>
            {/each}
          </select>
        </div>

        {#if selectedProduct}
          <div class="bg-blue-50 rounded-lg px-4 py-3 text-sm border border-blue-200">
            <div class="flex justify-between">
              <span class="text-blue-700">Stok sistem saat ini</span>
              <span class="font-bold text-blue-900">{selectedProduct.stock}</span>
            </div>
          </div>
        {/if}

        <div>
          <label for="opname-count" class="block text-sm font-medium text-gray-700 mb-1">Jumlah Fisik <span class="text-red-500">*</span></label>
          <input id="opname-count" name="physicalCount" type="number" min="0" bind:value={physicalCount} required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>

        {#if selectedProduct}
          <div class="rounded-lg px-4 py-3 text-sm border
            {difference === 0 ? 'bg-gray-50 border-gray-200' : difference > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}">
            <div class="flex justify-between">
              <span class="text-gray-600">Selisih</span>
              <span class="font-bold {difference === 0 ? 'text-gray-700' : difference > 0 ? 'text-green-700' : 'text-red-700'}">
                {difference > 0 ? '+' : ''}{difference}
              </span>
            </div>
            <p class="text-xs mt-1 text-gray-500">
              {difference === 0 ? 'Stok cocok' : difference > 0 ? 'Stok fisik lebih banyak dari sistem' : 'Stok fisik lebih sedikit dari sistem'}
            </p>
          </div>
        {/if}

        <div>
          <label for="opname-notes" class="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
          <textarea id="opname-notes" name="notes" rows="2" placeholder="Catatan opname (opsional)"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"></textarea>
        </div>
      </div>

      <div class="flex gap-3 mt-6 justify-end">
        <a href="/inventory" class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition">Batal</a>
        <button type="submit" disabled={formLoading || !selectedProductId}
          class="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 rounded-lg transition">
          {formLoading ? 'Menyimpan...' : 'Simpan Opname'}
        </button>
      </div>
    </form>
  </div>
</div>
