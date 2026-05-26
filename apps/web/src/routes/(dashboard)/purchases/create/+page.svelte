<script lang="ts">
  import { enhance } from '$app/forms'
  import PageHeader from '$components/ui/PageHeader.svelte'
  import ConfirmDialog from '$components/ui/ConfirmDialog.svelte'
  import { toast } from '$stores/toast'
  import type { PageData, ActionData } from './$types'

  export let data: PageData
  export let form: ActionData

  type FormResult = { error?: string } | null
  $: f = form as FormResult
  $: if (f?.error) toast.error(f.error ?? 'Terjadi kesalahan')

  let supplierId = ''
  let tax = 0
  let discount = 0
  let notes = ''
  let loading = false
  let showConfirm = false

  type Item = { productId: string; quantity: number; purchasePrice: number }
  let items: Item[] = [{ productId: '', quantity: 1, purchasePrice: 0 }]

  function addItem() {
    items = [...items, { productId: '', quantity: 1, purchasePrice: 0 }]
  }

  function removeItem(i: number) {
    items = items.filter((_, idx) => idx !== i)
  }

  function onProductChange(i: number) {
    const product = data.products.find((p: any) => p.id === items[i].productId)
    if (product && (product as any).purchasePrice) {
      items[i].purchasePrice = Number((product as any).purchasePrice)
      items = [...items]
    }
  }

  function getProductName(id: string) {
    return data.products.find((p: any) => p.id === id) as any
  }

  $: subtotal = items.reduce((sum, it) => sum + it.quantity * it.purchasePrice, 0)
  $: total = subtotal + tax - discount

  function formatRp(n: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
  }

  let formEl: HTMLFormElement
  function handleSubmit() {
    if (!supplierId) { toast.error('Pilih supplier terlebih dahulu'); return }
    if (items.some((i) => !i.productId)) { toast.error('Pilih produk untuk semua baris'); return }
    if (items.some((i) => i.quantity < 1)) { toast.error('Jumlah minimal 1'); return }
    if (items.some((i) => i.purchasePrice < 0)) { toast.error('Harga tidak boleh negatif'); return }
    showConfirm = true
  }
</script>

<svelte:head><title>Buat Purchase Order — PharmaPOS</title></svelte:head>

<div class="space-y-6">
  <PageHeader title="Buat Purchase Order" description="Buat pesanan barang baru ke supplier">
    <a href="/purchases" class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
      Kembali
    </a>
  </PageHeader>

  <form bind:this={formEl} method="POST"
    use:enhance={() => { loading = true; return async ({ update }) => { await update(); loading = false } }}>

    <input type="hidden" name="supplierId" value={supplierId} />
    <input type="hidden" name="tax" value={tax} />
    <input type="hidden" name="discount" value={discount} />
    <input type="hidden" name="notes" value={notes} />
    <input type="hidden" name="items" value={JSON.stringify(items)} />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Kiri: Supplier + Items -->
      <div class="lg:col-span-2 space-y-4">
        <!-- Supplier -->
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <h3 class="text-sm font-semibold text-gray-900 mb-3">Informasi Supplier</h3>
          <div>
            <label for="create-supplier" class="block text-sm font-medium text-gray-700 mb-1">
              Supplier <span class="text-red-500">*</span>
            </label>
            <select id="create-supplier" bind:value={supplierId} required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">-- Pilih Supplier --</option>
              {#each data.suppliers as s}
                <option value={(s as any).id}>{(s as any).name}</option>
              {/each}
            </select>
          </div>
        </div>

        <!-- Items -->
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-gray-900">Daftar Produk</h3>
            <button type="button" on:click={addItem}
              class="px-3 py-1.5 text-xs font-medium text-primary-600 border border-primary-300 rounded-lg hover:bg-primary-50 transition">
              + Tambah Baris
            </button>
          </div>

          <div class="space-y-3">
            {#each items as item, i}
              <div class="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <!-- Product selector -->
                <div class="flex items-start gap-2 mb-2">
                  <div class="flex-1">
                    <label for="prod-{i}" class="text-xs text-gray-500 mb-1 block">Produk <span class="text-red-400">*</span></label>
                    <select id="prod-{i}" bind:value={item.productId}
                      on:change={() => onProductChange(i)}
                      class="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                      <option value="">-- Pilih Produk --</option>
                      {#each data.products as p}
                        <option value={(p as any).id}>{(p as any).name} — {(p as any).code}</option>
                      {/each}
                    </select>
                  </div>
                  {#if items.length > 1}
                    <button type="button" on:click={() => removeItem(i)}
                      class="mt-5 text-red-400 hover:text-red-600 transition shrink-0" aria-label="Hapus baris">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  {/if}
                </div>

                <!-- Product info row -->
                {#if item.productId}
                  {@const prod = getProductName(item.productId)}
                  {#if prod}
                    <p class="text-xs text-gray-400 mb-2">
                      Satuan: <span class="text-gray-600">{prod.unit?.symbol ?? '—'}</span>
                      · Stok saat ini: <span class="text-gray-600">{prod.stock ?? 0}</span>
                      · Harga beli terakhir: <span class="text-gray-600">{formatRp(Number(prod.purchasePrice ?? 0))}</span>
                    </p>
                  {/if}
                {/if}

                <!-- Qty + Price -->
                <div class="grid grid-cols-3 gap-2">
                  <div>
                    <label for="qty-{i}" class="text-xs text-gray-500 mb-1 block">Jumlah</label>
                    <input id="qty-{i}" type="number" bind:value={item.quantity} min="1"
                      class="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label for="price-{i}" class="text-xs text-gray-500 mb-1 block">Harga Beli (Rp)</label>
                    <input id="price-{i}" type="number" bind:value={item.purchasePrice} min="0" step="1"
                      class="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 mb-1">Subtotal</p>
                    <p class="px-2 py-1.5 text-sm text-right font-medium text-gray-800">{formatRp(item.quantity * item.purchasePrice)}</p>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>

        <!-- Catatan -->
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <label for="create-notes" class="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
          <textarea id="create-notes" bind:value={notes} rows="2"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Catatan tambahan (opsional)"></textarea>
        </div>
      </div>

      <!-- Kanan: Ringkasan -->
      <div class="space-y-4">
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <h3 class="text-sm font-semibold text-gray-900 mb-4">Ringkasan</h3>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span class="font-medium">{formatRp(subtotal)}</span>
            </div>
            <div class="flex items-center justify-between gap-2">
              <label for="create-tax" class="text-gray-600 shrink-0">Pajak (Rp)</label>
              <input id="create-tax" type="number" bind:value={tax} min="0" step="1"
                class="w-32 px-2 py-1 border border-gray-300 rounded text-right text-sm focus:outline-none focus:ring-1 focus:ring-primary-500" />
            </div>
            <div class="flex items-center justify-between gap-2">
              <label for="create-discount" class="text-gray-600 shrink-0">Diskon (Rp)</label>
              <input id="create-discount" type="number" bind:value={discount} min="0" step="1"
                class="w-32 px-2 py-1 border border-gray-300 rounded text-right text-sm focus:outline-none focus:ring-1 focus:ring-primary-500" />
            </div>
            <div class="border-t border-gray-200 pt-3 flex justify-between font-semibold text-gray-900">
              <span>Total</span>
              <span class="text-primary-700">{formatRp(total)}</span>
            </div>
          </div>
        </div>

        <button type="button" on:click={handleSubmit} disabled={loading}
          class="w-full py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 rounded-lg transition">
          {loading ? 'Membuat...' : 'Buat Purchase Order'}
        </button>
      </div>
    </div>
  </form>
</div>

<ConfirmDialog
  bind:open={showConfirm}
  title="Buat Purchase Order"
  message="Konfirmasi pembuatan PO untuk supplier {data.suppliers.find((s: any) => s.id === supplierId)?.name ?? ''}. Total: {formatRp(total)}"
  confirmLabel="Ya, Buat PO"
  on:confirm={() => { showConfirm = false; formEl.requestSubmit() }}
/>
