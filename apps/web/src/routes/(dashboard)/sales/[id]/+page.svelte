<script lang="ts">
  import Badge from '$components/ui/Badge.svelte'
  import { apiClient } from '$api/client'
  import { toast } from '$stores/toast'
  import type { PageData } from './$types'

  export let data: PageData

  const sale = data.sale as SaleDetail

  interface SaleDetail {
    id: string; invoiceNumber: string; status: string; paymentMethod: string | null
    subtotal: number; discount: number; tax: number; total: number
    amountPaid: number | null; change: number | null; notes: string | null
    cashier: { name: string }; createdAt: string
    items: Array<{ id: string; quantity: number; price: number; discount: number; subtotal: number; product: { name: string; code: string; unit: { name: string; symbol: string } } }>
  }

  let checkoutMethod: 'CASH' | 'TRANSFER' = 'CASH'
  let checkoutPaid = ''
  let showCheckout = false
  let submitting = false

  function formatRp(n: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
  }

  function formatDate(d: string) {
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(d))
  }

  async function doCheckout() {
    submitting = true
    try {
      const body = {
        paymentMethod: checkoutMethod,
        ...(checkoutMethod === 'CASH' && checkoutPaid ? { amountPaid: Number(checkoutPaid) } : {}),
      }
      await apiClient.patch(`/sales/${sale.id}/checkout`, body)
      toast.success('Transaksi berhasil diselesaikan')
      window.location.reload()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Gagal menyelesaikan transaksi')
    }
    submitting = false
  }

  function statusBadge(s: string) {
    if (s === 'COMPLETED') return 'success' as const
    if (s === 'HOLD') return 'warning' as const
    return 'danger' as const
  }

  function statusLabel(s: string) {
    if (s === 'COMPLETED') return 'Selesai'
    if (s === 'HOLD') return 'Hold'
    return 'Dibatalkan'
  }
</script>

<svelte:head><title>{sale.invoiceNumber} — PharmaPOS</title></svelte:head>

<style>
  @media print {
    :global(nav), :global(header), :global(aside), .no-print { display: none !important; }
    .print-only { display: block !important; }
  }
</style>

<div class="max-w-2xl mx-auto space-y-4 no-print">
  <div class="flex items-center justify-between">
    <div>
      <a href="/sales/history" class="text-sm text-gray-500 hover:text-gray-700">← Riwayat</a>
      <h1 class="text-lg font-semibold text-gray-900 mt-1 font-mono">{sale.invoiceNumber}</h1>
    </div>
    <div class="flex gap-2">
      {#if sale.status === 'HOLD'}
        <button on:click={() => showCheckout = true}
          class="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition">
          Selesaikan
        </button>
      {/if}
      <button on:click={() => window.print()}
        class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
        Print Struk
      </button>
    </div>
  </div>

  <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
    <div class="grid grid-cols-2 gap-4 text-sm">
      <div>
        <p class="text-gray-400 text-xs">Status</p>
        <div class="mt-1"><Badge variant={statusBadge(sale.status)}>{statusLabel(sale.status)}</Badge></div>
      </div>
      <div>
        <p class="text-gray-400 text-xs">Kasir</p>
        <p class="font-medium text-gray-900 mt-1">{sale.cashier?.name ?? '—'}</p>
      </div>
      <div>
        <p class="text-gray-400 text-xs">Waktu</p>
        <p class="font-medium text-gray-900 mt-1">{formatDate(String(sale.createdAt))}</p>
      </div>
      <div>
        <p class="text-gray-400 text-xs">Metode Bayar</p>
        <p class="font-medium text-gray-900 mt-1">
          {sale.paymentMethod === 'CASH' ? 'Tunai' : sale.paymentMethod === 'TRANSFER' ? 'Transfer' : '—'}
        </p>
      </div>
    </div>

    <div class="border-t border-gray-100 pt-4">
      <h3 class="text-sm font-semibold text-gray-700 mb-3">Item Pembelian</h3>
      <div class="space-y-2">
        {#each sale.items as item}
          <div class="flex justify-between items-start text-sm">
            <div>
              <p class="font-medium text-gray-900">{item.product.name}</p>
              <p class="text-xs text-gray-400">{item.quantity} {item.product.unit?.symbol} × {formatRp(Number(item.price))}</p>
            </div>
            <span class="font-semibold text-gray-900 ml-4">{formatRp(Number(item.subtotal))}</span>
          </div>
        {/each}
      </div>
    </div>

    <div class="border-t border-gray-100 pt-4 space-y-1.5 text-sm">
      <div class="flex justify-between text-gray-500">
        <span>Subtotal</span><span>{formatRp(Number(sale.subtotal))}</span>
      </div>
      {#if Number(sale.discount) > 0}
        <div class="flex justify-between text-gray-500">
          <span>Diskon</span><span>-{formatRp(Number(sale.discount))}</span>
        </div>
      {/if}
      <div class="flex justify-between text-gray-500">
        <span>Pajak</span><span>{formatRp(Number(sale.tax))}</span>
      </div>
      <div class="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-2 mt-2">
        <span>Total</span><span>{formatRp(Number(sale.total))}</span>
      </div>
      {#if sale.paymentMethod === 'CASH' && sale.amountPaid != null}
        <div class="flex justify-between text-gray-500">
          <span>Dibayar</span><span>{formatRp(Number(sale.amountPaid))}</span>
        </div>
        <div class="flex justify-between text-green-600 font-semibold">
          <span>Kembalian</span><span>{formatRp(Number(sale.change))}</span>
        </div>
      {/if}
    </div>
  </div>
</div>

<!-- Checkout Modal for HOLD -->
{#if showCheckout}
  <button class="fixed inset-0 z-40 bg-black/40" on:click={() => showCheckout = false} aria-label="Tutup"></button>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm pointer-events-auto">
      <div class="p-5 border-b border-gray-100">
        <h3 class="font-semibold text-gray-900">Selesaikan Pembayaran</h3>
        <p class="text-sm text-gray-500 mt-1">Total: {formatRp(Number(sale.total))}</p>
      </div>
      <div class="p-5 space-y-4">
        <div class="grid grid-cols-2 gap-2">
          <button on:click={() => checkoutMethod = 'CASH'}
            class="py-2.5 rounded-xl text-sm font-medium border transition
              {checkoutMethod === 'CASH' ? 'bg-primary-50 border-primary-400 text-primary-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}">
            Tunai
          </button>
          <button on:click={() => checkoutMethod = 'TRANSFER'}
            class="py-2.5 rounded-xl text-sm font-medium border transition
              {checkoutMethod === 'TRANSFER' ? 'bg-primary-50 border-primary-400 text-primary-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}">
            Transfer
          </button>
        </div>
        {#if checkoutMethod === 'CASH'}
          <div>
            <label for="checkout-paid" class="block text-sm font-medium text-gray-700 mb-1">Jumlah Bayar</label>
            <input id="checkout-paid" type="number" bind:value={checkoutPaid}
              class="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-right" />
          </div>
        {/if}
        <button on:click={doCheckout} disabled={submitting || (checkoutMethod === 'CASH' && Number(checkoutPaid) < Number(sale.total))}
          class="w-full py-3 font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition disabled:opacity-40">
          {submitting ? 'Memproses...' : 'Konfirmasi'}
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Print-only receipt -->
<div class="print-only hidden p-4 max-w-xs mx-auto font-mono text-xs">
  <p class="text-center font-bold text-sm">{data.storeName}</p>
  <p class="text-center mb-2">Struk Pembayaran</p>
  <div class="border-t border-dashed my-2"></div>
  <p>No: {sale.invoiceNumber}</p>
  <p>Kasir: {sale.cashier?.name}</p>
  <p>{formatDate(String(sale.createdAt))}</p>
  <div class="border-t border-dashed my-2"></div>
  {#each sale.items as item}
    <p>{item.product.name}</p>
    <div class="flex justify-between pl-2">
      <span>{item.quantity}×{formatRp(Number(item.price))}</span>
      <span>{formatRp(Number(item.subtotal))}</span>
    </div>
  {/each}
  <div class="border-t border-dashed my-2"></div>
  <div class="flex justify-between"><span>Subtotal</span><span>{formatRp(Number(sale.subtotal))}</span></div>
  {#if Number(sale.discount)>0}<div class="flex justify-between"><span>Diskon</span><span>-{formatRp(Number(sale.discount))}</span></div>{/if}
  <div class="flex justify-between"><span>Pajak</span><span>{formatRp(Number(sale.tax))}</span></div>
  <div class="flex justify-between font-bold"><span>TOTAL</span><span>{formatRp(Number(sale.total))}</span></div>
  {#if sale.paymentMethod==='CASH'}
    <div class="flex justify-between"><span>Bayar</span><span>{formatRp(Number(sale.amountPaid))}</span></div>
    <div class="flex justify-between"><span>Kembali</span><span>{formatRp(Number(sale.change))}</span></div>
  {/if}
  <div class="border-t border-dashed my-2"></div>
  <p class="text-center">Terima kasih!</p>
</div>
