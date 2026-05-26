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
    items: Array<{
      id: string; quantity: number; price: number; discount: number; subtotal: number
      product: { name: string; code: string; unit: { name: string; symbol: string } }
    }>
  }

  // ── Checkout (HOLD → COMPLETED) ──────────────────────────────────────────────
  let checkoutMethod: 'CASH' | 'TRANSFER' = 'CASH'
  let checkoutPaid = ''
  let showCheckout = false
  let submitting = false
  let checkoutInput: HTMLInputElement

  $: saleTotal = Number(sale.total)
  $: checkoutChange = checkoutMethod === 'CASH' && Number(checkoutPaid) >= saleTotal
    ? Number(checkoutPaid) - saleTotal : 0
  $: canCheckout = checkoutMethod === 'TRANSFER' || (checkoutMethod === 'CASH' && Number(checkoutPaid) >= saleTotal)

  function openCheckout() { showCheckout = true; setTimeout(() => checkoutInput?.focus(), 80) }

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

  // ── Delete ────────────────────────────────────────────────────────────────────
  let showDelete = false
  let deletePassword = ''
  let deleting = false
  $: canDelete = ['SUPER_ADMIN', 'ADMIN'].includes(data.userRole)

  async function doDelete() {
    if (!deletePassword) { toast.error('Masukkan password'); return }
    deleting = true
    try {
      await apiClient.delete(`/sales/${sale.id}`, { body: { password: deletePassword } })
      toast.success('Transaksi berhasil dihapus')
      window.location.href = '/sales/history'
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Gagal menghapus transaksi')
    }
    deleting = false
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────
  function formatRp(n: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
  }
  function formatDate(d: string) {
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(d))
  }

  // ── Print ─────────────────────────────────────────────────────────────────────
  function printReceipt() {
    const date = new Intl.DateTimeFormat('id-ID', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(String(sale.createdAt)))

    const itemsHtml = sale.items.map(item => {
      const disc = Number(item.discount) > 0
        ? `<div class="row"><span style="padding-left:12px">Diskon</span><span>-${formatRp(Number(item.discount))}</span></div>`
        : ''
      return `
        <div class="item-name">${item.product.name}</div>
        <div class="row item-row">
          <span style="padding-left:12px">${item.quantity} ${item.product.unit?.symbol ?? ''} &times; ${formatRp(Number(item.price))}</span>
          <span>${formatRp(Number(item.subtotal))}</span>
        </div>${disc}`
    }).join('')

    const payHtml = sale.paymentMethod === 'CASH'
      ? `<div class="row"><span>Tunai</span><span>${formatRp(Number(sale.amountPaid))}</span></div>
         <div class="row bold"><span>Kembali</span><span>${formatRp(Number(sale.change))}</span></div>`
      : `<div class="row"><span>Metode Bayar</span><span>Transfer</span></div>`

    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Struk ${sale.invoiceNumber}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Courier New',Courier,monospace;font-size:11.5px;width:80mm;padding:4mm 5mm;line-height:1.6;color:#000}
  .center{text-align:center}
  .bold{font-weight:bold}
  .store-name{font-size:16px;font-weight:bold;letter-spacing:0.5px}
  .sep-dash{border:none;border-top:1px dashed #000;margin:5px 0}
  .sep-solid{border:none;border-top:1px solid #000;margin:5px 0}
  .row{display:flex;justify-content:space-between;align-items:flex-start}
  .item-name{font-weight:bold;margin-top:4px}
  .item-row{font-size:11px;color:#333}
  .total-row{display:flex;justify-content:space-between;font-weight:bold;font-size:14px;padding:3px 0}
  .meta{font-size:10.5px;color:#444}
  @page{size:80mm auto;margin:0}
</style></head>
<body>
  <div class="center store-name">${data.storeName}</div>
  <div class="center meta">Apotek &mdash; Struk Pembelian</div>
  <hr class="sep-dash">
  <div class="meta">No. Faktur : <strong>${sale.invoiceNumber}</strong></div>
  <div class="meta">Tanggal   : ${date}</div>
  <div class="meta">Kasir     : ${sale.cashier?.name ?? '-'}</div>
  <hr class="sep-dash">
  ${itemsHtml}
  <hr class="sep-dash">
  <div class="row"><span>Subtotal</span><span>${formatRp(Number(sale.subtotal))}</span></div>
  ${Number(sale.discount) > 0 ? `<div class="row"><span>Diskon</span><span>-${formatRp(Number(sale.discount))}</span></div>` : ''}
  ${Number(sale.tax) > 0 ? `<div class="row meta"><span>Pajak</span><span>${formatRp(Number(sale.tax))}</span></div>` : ''}
  <hr class="sep-solid">
  <div class="total-row"><span>TOTAL</span><span>${formatRp(Number(sale.total))}</span></div>
  <hr class="sep-solid">
  ${payHtml}
  <hr class="sep-dash">
  <div class="center" style="margin-top:6px;font-size:11px">Terima kasih sudah berbelanja!</div>
  <div class="center" style="font-size:11px">Semoga lekas sembuh :)</div>
  <div style="margin-top:10px"></div>
</body></html>`

    const blob = new Blob([html], { type: 'text/html; charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const iframe = document.createElement('iframe')
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:1px;height:1px;border:0;opacity:0'
    document.body.appendChild(iframe)
    iframe.src = url
    iframe.onload = () => {
      iframe.contentWindow?.print()
      setTimeout(() => { document.body.removeChild(iframe); URL.revokeObjectURL(url) }, 1000)
    }
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

<div class="max-w-2xl mx-auto space-y-4">
  <!-- Breadcrumb + actions -->
  <div class="flex items-start justify-between gap-3">
    <div>
      <a href="/sales/history" class="text-sm text-gray-500 hover:text-gray-700 transition">← Riwayat</a>
      <h1 class="text-lg font-bold text-gray-900 mt-1 font-mono">{sale.invoiceNumber}</h1>
    </div>
    <div class="flex gap-2 flex-wrap justify-end">
      {#if sale.status === 'HOLD'}
        <button on:click={openCheckout}
          class="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition">
          Selesaikan
        </button>
      {/if}
      <button on:click={printReceipt}
        class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-1.5">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
        </svg>
        Print Struk
      </button>
      {#if canDelete}
        <button on:click={() => showDelete = true}
          class="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition">
          Hapus
        </button>
      {/if}
    </div>
  </div>

  <!-- Detail card -->
  <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
    <div class="grid grid-cols-2 gap-4 text-sm">
      <div>
        <p class="text-gray-400 text-xs mb-1">Status</p>
        <Badge variant={statusBadge(sale.status)}>{statusLabel(sale.status)}</Badge>
      </div>
      <div>
        <p class="text-gray-400 text-xs mb-1">Kasir</p>
        <p class="font-medium text-gray-900">{sale.cashier?.name ?? '—'}</p>
      </div>
      <div>
        <p class="text-gray-400 text-xs mb-1">Waktu</p>
        <p class="font-medium text-gray-900 text-xs leading-relaxed">{formatDate(String(sale.createdAt))}</p>
      </div>
      <div>
        <p class="text-gray-400 text-xs mb-1">Metode Bayar</p>
        <p class="font-medium text-gray-900">
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
            <span class="font-semibold text-gray-900 ml-4 shrink-0">{formatRp(Number(item.subtotal))}</span>
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
          <span>Diskon</span><span class="text-red-500">−{formatRp(Number(sale.discount))}</span>
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

<!-- ── Checkout Modal (HOLD) ─────────────────────────────────────────────── -->
{#if showCheckout}
  <button class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
    on:click={() => showCheckout = false} aria-label="Tutup"></button>
  <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 pointer-events-none">
    <div class="bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl w-full sm:max-w-sm pointer-events-auto">
      <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <h3 class="font-bold text-gray-900">Selesaikan Pembayaran</h3>
        <button on:click={() => showCheckout = false}
          class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100" aria-label="Tutup">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
        <!-- Total -->
        <div class="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-5 text-center text-white">
          <p class="text-xs opacity-80 mb-1 uppercase tracking-wide">Total Pembayaran</p>
          <p class="text-4xl font-bold">{formatRp(saleTotal)}</p>
          <p class="text-xs opacity-70 mt-1">{sale.items.length} item</p>
        </div>

        <!-- Metode -->
        <div>
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Metode Pembayaran</p>
          <div class="grid grid-cols-2 gap-2">
            {#each [['CASH', 'Tunai', '💵'], ['TRANSFER', 'Transfer', '🏦']] as [method, label, icon]}
              <button on:click={() => checkoutMethod = method as 'CASH' | 'TRANSFER'}
                class="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border-2 transition-all
                  {checkoutMethod === method
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}">
                <span>{icon}</span> {label}
              </button>
            {/each}
          </div>
        </div>

        <!-- Jumlah bayar (CASH) -->
        {#if checkoutMethod === 'CASH'}
          <div>
            <label for="checkout-paid" class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Jumlah Bayar
            </label>
            <input id="checkout-paid" bind:this={checkoutInput} type="number" min={saleTotal}
              bind:value={checkoutPaid} placeholder={formatRp(saleTotal)}
              class="w-full px-4 py-3 border-2 rounded-xl text-right text-xl font-bold focus:outline-none transition
                     {Number(checkoutPaid) >= saleTotal && checkoutPaid
                       ? 'border-green-400 bg-green-50 text-green-800'
                       : checkoutPaid
                         ? 'border-red-300 bg-red-50 text-red-700'
                         : 'border-gray-300 text-gray-900'}" />

            <!-- Quick nominals -->
            <div class="flex gap-1.5 mt-2 flex-wrap">
              {#each [...new Set([saleTotal, Math.ceil(saleTotal / 5000) * 5000, Math.ceil(saleTotal / 10000) * 10000, Math.ceil(saleTotal / 50000) * 50000])] as nominal}
                <button on:click={() => checkoutPaid = String(nominal)}
                  class="px-2.5 py-1 text-xs font-medium border rounded-lg transition
                         {Number(checkoutPaid) === nominal
                           ? 'border-primary-400 bg-primary-50 text-primary-700'
                           : 'border-gray-200 text-gray-600 hover:bg-gray-50'}">
                  {formatRp(nominal)}
                </button>
              {/each}
            </div>
          </div>

          {#if Number(checkoutPaid) >= saleTotal && checkoutPaid}
            <div class="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <span class="text-sm text-green-700 font-medium">Kembalian</span>
              <span class="text-xl font-bold text-green-700">{formatRp(checkoutChange)}</span>
            </div>
          {:else if checkoutPaid && Number(checkoutPaid) < saleTotal}
            <div class="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <span class="text-sm text-red-600">Kurang</span>
              <span class="text-lg font-bold text-red-600">{formatRp(saleTotal - Number(checkoutPaid))}</span>
            </div>
          {/if}
        {/if}
      </div>

      <div class="px-5 pb-6 pt-2">
        <button on:click={doCheckout} disabled={submitting || !canCheckout}
          class="w-full py-3.5 font-bold text-white rounded-xl transition text-base
                 {canCheckout && !submitting ? 'bg-primary-600 hover:bg-primary-700 shadow-sm' : 'bg-gray-300 cursor-not-allowed'}">
          {submitting ? 'Memproses...' : 'Konfirmasi Pembayaran'}
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- ── Delete Modal ──────────────────────────────────────────────────────── -->
{#if showDelete}
  <button class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
    on:click={() => showDelete = false} aria-label="Tutup"></button>
  <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 pointer-events-none">
    <div class="bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl w-full sm:max-w-sm pointer-events-auto">
      <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <div class="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
          <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </div>
        <div>
          <h3 class="font-bold text-gray-900">Hapus Transaksi</h3>
          <p class="text-xs text-gray-400 font-mono">{sale.invoiceNumber}</p>
        </div>
      </div>

      <div class="p-5 space-y-4">
        <div class="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 space-y-1">
          <p class="font-semibold">Peringatan:</p>
          <p>• Transaksi akan dihapus permanen</p>
          {#if sale.status === 'COMPLETED'}
            <p>• Stok produk akan dikembalikan otomatis</p>
          {/if}
          <p>• Aksi ini tidak dapat dibatalkan</p>
        </div>

        <div>
          <label for="delete-pwd" class="block text-sm font-medium text-gray-700 mb-1.5">
            Konfirmasi Password
          </label>
          <input id="delete-pwd" type="password" bind:value={deletePassword}
            placeholder="Masukkan password Anda"
            class="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
        </div>

        <div class="flex gap-2">
          <button on:click={() => { showDelete = false; deletePassword = '' }}
            class="flex-1 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition">
            Batal
          </button>
          <button on:click={doDelete} disabled={deleting || !deletePassword}
            class="flex-1 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition disabled:opacity-40">
            {deleting ? 'Menghapus...' : 'Hapus Transaksi'}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

