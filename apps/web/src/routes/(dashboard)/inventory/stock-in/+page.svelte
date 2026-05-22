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

  $: if (form?.success) { toast.success(form.message ?? 'Berhasil'); goto('/inventory') }
  $: if (form?.error) toast.error(form.error)

  $: selectedProduct = data.products.find(p => p.id === selectedProductId)

  // Default expired date: 1 year from today
  const defaultExpiry = new Date()
  defaultExpiry.setFullYear(defaultExpiry.getFullYear() + 1)
  const defaultExpiryStr = defaultExpiry.toISOString().slice(0, 10)
</script>

<svelte:head><title>Stock In — PharmaPOS</title></svelte:head>

<div class="space-y-6">
  <PageHeader title="Stock In" description="Tambah batch baru dan catat stok masuk" />

  <div class="bg-white rounded-xl border border-gray-200 p-6 max-w-lg mx-auto">
    <form method="POST"
      use:enhance={() => { formLoading = true; return async ({ update }) => { await update(); formLoading = false } }}>

      <div class="space-y-4">
        <div>
          <label for="si-product" class="block text-sm font-medium text-gray-700 mb-1">
            Produk <span class="text-red-500">*</span>
          </label>
          <select id="si-product" name="productId" bind:value={selectedProductId} required
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
            <span class="ml-2 font-bold text-gray-900">
              {selectedProduct.stock} {selectedProduct.unit?.symbol ?? ''}
            </span>
          </div>
        {/if}

        <div>
          <label for="si-batch" class="block text-sm font-medium text-gray-700 mb-1">
            No. Batch <span class="text-red-500">*</span>
          </label>
          <input id="si-batch" name="batchNumber" type="text" required
            placeholder="Contoh: B-PAR-2026A"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>

        <div>
          <label for="si-expired" class="block text-sm font-medium text-gray-700 mb-1">
            Tanggal Expired <span class="text-red-500">*</span>
          </label>
          <input id="si-expired" name="expiredDate" type="date" required
            value={defaultExpiryStr}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>

        <div>
          <label for="si-qty" class="block text-sm font-medium text-gray-700 mb-1">
            Jumlah <span class="text-red-500">*</span>
          </label>
          <input id="si-qty" name="quantity" type="number" min="1" value="1" required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          {#if selectedProduct}
            <p class="mt-1 text-xs text-gray-400">
              Satuan: {selectedProduct.unit?.name ?? '—'}
            </p>
          {/if}
        </div>

        <div>
          <label for="si-notes" class="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
          <textarea id="si-notes" name="notes" rows="2"
            placeholder="Opsional. Contoh: Pembelian dari PT Kimia Farma, PO #123"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"></textarea>
        </div>
      </div>

      <div class="flex gap-3 mt-6 justify-end">
        <a href="/inventory"
          class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
          Batal
        </a>
        <button type="submit" disabled={formLoading || !selectedProductId}
          class="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 rounded-lg transition">
          {formLoading ? 'Menyimpan...' : 'Simpan Stock In'}
        </button>
      </div>
    </form>
  </div>
</div>
