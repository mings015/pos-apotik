<script lang="ts">
  import { onMount } from 'svelte'
  import { cart } from '$stores/cart'
  import { toast } from '$stores/toast'
  import { apiClient } from '$api/client'
  import ConfirmDialog from '$components/ui/ConfirmDialog.svelte'
  import type { PageData } from './$types'

  export let data: PageData

  // ── Search ──────────────────────────────────────────────────────────────────
  let searchQuery = ''
  let searchResults: ProductResult[] = []
  let searching = false
  let searchTimeout: ReturnType<typeof setTimeout>
  let searchInput: HTMLInputElement

  interface ProductResult {
    id: string
    name: string
    code: string
    barcode: string | null
    sellingPrice: number
    stock: number
    unit: { symbol: string }
    category?: { name: string }
  }

  // ── Payment ──────────────────────────────────────────────────────────────────
  let cartDiscount = 0
  let showPayment = false
  let paymentMethod: 'CASH' | 'TRANSFER' = 'CASH'
  let amountPaid = ''
  let submitting = false
  let amountInput: HTMLInputElement

  // ── Mobile cart drawer ────────────────────────────────────────────────────
  let showMobileCart = false

  // ── Hold ─────────────────────────────────────────────────────────────────────
  let showHoldList = false
  let heldSales = data.heldSales as HeldSale[]

  interface HeldSale {
    id: string
    invoiceNumber: string
    total: number
    items: { quantity: number }[]
    createdAt: string
  }

  // ── Receipt ──────────────────────────────────────────────────────────────────
  let receipt: SaleReceipt | null = null
  interface SaleReceipt {
    id: string; invoiceNumber: string; total: number; subtotal: number
    discount: number; tax: number; amountPaid: number | null; change: number | null
    paymentMethod: string | null; cashier: { name: string }
    items: { product: { name: string; unit: { symbol: string } }; quantity: number; price: number; subtotal: number }[]
    createdAt: string
  }

  // ── Confirm dialogs ──────────────────────────────────────────────────────────
  let showCancelCartConfirm = false
  let cancelHoldId = ''
  let showCancelHoldConfirm = false

  // ── Computed totals ──────────────────────────────────────────────────────────
  $: itemSubtotal = $cart.reduce((s, i) => s + i.price * i.quantity, 0)
  $: taxBase = Math.max(0, itemSubtotal - cartDiscount)
  $: tax = Math.round(taxBase * (data.taxPercentage / 100))
  $: total = taxBase + tax
  $: totalQty = $cart.reduce((s, i) => s + i.quantity, 0)
  $: cashChange = paymentMethod === 'CASH' && Number(amountPaid) >= total ? Number(amountPaid) - total : 0
  $: canPay = paymentMethod === 'TRANSFER' || (paymentMethod === 'CASH' && Number(amountPaid) >= total)

  // ── Helpers ──────────────────────────────────────────────────────────────────
  function formatRp(n: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
  }

  function formatDate(d: string) {
    return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(d))
  }

  // ── Search logic ─────────────────────────────────────────────────────────────
  async function doSearch(q: string) {
    if (!q.trim()) { searchResults = []; return }
    searching = true
    try {
      const res = await apiClient.get<{ data: ProductResult[] }>(
        `/products?search=${encodeURIComponent(q)}&isActive=true&limit=15`
      )
      searchResults = res.data?.data ?? []
    } catch {
      searchResults = []
    } finally {
      searching = false
    }
  }

  function onSearchInput() {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => doSearch(searchQuery), 280)
  }

  async function onSearchKeydown(e: KeyboardEvent) {
    if (e.key !== 'Enter') return
    e.preventDefault()
    const q = searchQuery.trim()
    if (!q) return
    clearTimeout(searchTimeout)

    if (/^\d+$/.test(q)) {
      const res = await apiClient.get<{ data: ProductResult[] }>(
        `/products?search=${q}&isActive=true&limit=5`
      )
      const exact = (res.data?.data ?? []).find((p) => p.barcode === q)
      if (exact) {
        addToCart(exact)
        searchQuery = ''
        searchResults = []
        return
      }
    }
    await doSearch(q)
  }

  function clearSearch() {
    searchQuery = ''
    searchResults = []
    searchInput?.focus()
  }

  // ── Cart logic ───────────────────────────────────────────────────────────────
  function addToCart(p: ProductResult) {
    if (p.stock === 0) { toast.error(`Stok ${p.name} habis`); return }
    cart.add({
      productId: p.id, name: p.name, code: p.code, barcode: p.barcode,
      price: Number(p.sellingPrice), stock: p.stock, unitSymbol: p.unit?.symbol ?? '',
    })
    toast.success(`${p.name} ditambahkan`)
  }

  // ── Submit sale ───────────────────────────────────────────────────────────────
  async function submitSale(status: 'COMPLETED' | 'HOLD') {
    if ($cart.length === 0) { toast.error('Keranjang masih kosong'); return }
    submitting = true
    try {
      const body = {
        items: $cart.map((i) => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
        discount: cartDiscount,
        paymentMethod: status === 'HOLD' ? undefined : paymentMethod,
        amountPaid: status === 'HOLD' ? undefined : (paymentMethod === 'CASH' ? Number(amountPaid) : undefined),
        status,
      }
      const res = await apiClient.post<SaleReceipt>('/sales', body)
      if (status === 'HOLD') {
        toast.success('Transaksi di-hold')
        heldSales = [res.data as SaleReceipt, ...heldSales]
        showMobileCart = false
      } else {
        receipt = res.data as SaleReceipt
        showPayment = false
        showMobileCart = false
      }
      cart.clear()
      cartDiscount = 0
      amountPaid = ''
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Terjadi kesalahan')
    }
    submitting = false
  }

  async function cancelHold() {
    try {
      await apiClient.patch(`/sales/${cancelHoldId}/cancel`, {})
      heldSales = heldSales.filter((s) => s.id !== cancelHoldId)
      toast.success('Transaksi dibatalkan')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Gagal membatalkan')
    }
  }

  function openPayment() {
    if ($cart.length === 0) { toast.error('Keranjang masih kosong'); return }
    showPayment = true
    showMobileCart = false
    setTimeout(() => amountInput?.focus(), 80)
  }

  onMount(() => { searchInput?.focus() })

  // ── Print ─────────────────────────────────────────────────────────────────────
  function printReceipt() {
    if (!receipt) return
    const date = new Intl.DateTimeFormat('id-ID', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(receipt.createdAt))

    const itemsHtml = receipt.items.map(item => `
      <div class="item-name">${item.product.name}</div>
      <div class="row item-row">
        <span style="padding-left:12px">${item.quantity} ${item.product.unit?.symbol ?? ''} &times; ${formatRp(Number(item.price))}</span>
        <span>${formatRp(Number(item.subtotal))}</span>
      </div>`).join('')

    const payHtml = receipt.paymentMethod === 'CASH'
      ? `<div class="row"><span>Tunai</span><span>${formatRp(Number(receipt.amountPaid))}</span></div>
         <div class="row bold"><span>Kembali</span><span>${formatRp(Number(receipt.change))}</span></div>`
      : `<div class="row"><span>Metode Bayar</span><span>Transfer</span></div>`

    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Struk ${receipt.invoiceNumber}</title>
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
  <div class="meta">No. Faktur : <strong>${receipt.invoiceNumber}</strong></div>
  <div class="meta">Tanggal   : ${date}</div>
  <div class="meta">Kasir     : ${receipt.cashier?.name ?? '-'}</div>
  <hr class="sep-dash">
  ${itemsHtml}
  <hr class="sep-dash">
  <div class="row"><span>Subtotal</span><span>${formatRp(Number(receipt.subtotal))}</span></div>
  ${Number(receipt.discount) > 0 ? `<div class="row"><span>Diskon</span><span>-${formatRp(Number(receipt.discount))}</span></div>` : ''}
  ${Number(receipt.tax) > 0 ? `<div class="row meta"><span>Pajak</span><span>${formatRp(Number(receipt.tax))}</span></div>` : ''}
  <hr class="sep-solid">
  <div class="total-row"><span>TOTAL</span><span>${formatRp(Number(receipt.total))}</span></div>
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
</script>

<svelte:head><title>POS Kasir — PharmaPOS</title></svelte:head>

<!-- ── Main POS layout ─────────────────────────────────────────────────────── -->
<div class="flex gap-4 h-[calc(100vh-4.5rem)] -mt-1 pb-16 lg:pb-0">

  <!-- LEFT: Product search (full width mobile, flex-1 desktop) -->
  <div class="flex-1 flex flex-col gap-3 min-w-0">

    <!-- Search bar -->
    <div class="flex gap-2">
      <div class="relative flex-1">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input
          bind:this={searchInput}
          bind:value={searchQuery}
          on:input={onSearchInput}
          on:keydown={onSearchKeydown}
          placeholder="Cari produk atau scan barcode..."
          autocomplete="off"
          class="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl text-sm
                 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
        />
        {#if searchQuery}
          <button on:click={clearSearch} aria-label="Hapus pencarian"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        {/if}
      </div>

      <a href="/sales/history"
        class="hidden sm:flex px-3 py-2.5 text-sm font-medium text-gray-600 border border-gray-300
               rounded-xl hover:bg-gray-50 transition items-center gap-1.5 whitespace-nowrap bg-white">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
        <span>Riwayat</span>
      </a>

      {#if heldSales.length > 0}
        <button on:click={() => showHoldList = true}
          class="px-3 py-2.5 text-sm font-semibold text-amber-700 border border-amber-300
                 bg-amber-50 hover:bg-amber-100 rounded-xl transition whitespace-nowrap flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span class="hidden sm:inline">Hold</span>
          <span class="bg-amber-200 text-amber-800 text-xs font-bold px-1.5 py-0.5 rounded-full">{heldSales.length}</span>
        </button>
      {/if}
    </div>

    <!-- Product grid -->
    <div class="flex-1 overflow-y-auto">
      {#if searching}
        <div class="flex items-center justify-center py-20 text-gray-400 gap-2">
          <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <span class="text-sm">Mencari produk...</span>
        </div>

      {:else if searchResults.length > 0}
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
          {#each searchResults as p}
            {@const outOfStock = p.stock === 0}
            <button
              on:click={() => addToCart(p)}
              disabled={outOfStock}
              class="group text-left bg-white border rounded-xl p-3 sm:p-3.5 transition-all duration-150
                     disabled:opacity-50 disabled:cursor-not-allowed
                     {outOfStock ? 'border-gray-200' : 'border-gray-200 hover:border-primary-400 hover:shadow-md hover:shadow-primary-50 cursor-pointer'}"
            >
              <p class="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-2 leading-snug min-h-[2.5rem]">{p.name}</p>
              <p class="text-[10px] sm:text-[11px] text-gray-400 font-mono mt-1">{p.code}</p>
              <div class="mt-2 sm:mt-3 flex items-end justify-between gap-1">
                <span class="text-sm sm:text-base font-bold text-primary-600 group-hover:text-primary-700 leading-none">
                  {formatRp(Number(p.sellingPrice))}
                </span>
                <span class="text-[10px] sm:text-[11px] font-medium px-1.5 py-0.5 rounded-full shrink-0
                  {outOfStock ? 'bg-red-50 text-red-500' : p.stock <= 10 ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}">
                  {outOfStock ? 'Habis' : `${p.stock}`}
                </span>
              </div>
            </button>
          {/each}
        </div>

      {:else if searchQuery}
        <div class="flex flex-col items-center justify-center py-20 text-gray-400">
          <svg class="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p class="text-sm font-medium">Produk tidak ditemukan</p>
          <p class="text-xs mt-1">Coba kata kunci lain atau periksa barcode</p>
        </div>

      {:else}
        <div class="flex flex-col items-center justify-center py-20 text-gray-300 select-none">
          <svg class="w-16 h-16 sm:w-20 sm:h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <p class="text-sm sm:text-base font-medium text-gray-400">Cari atau scan produk</p>
          <p class="text-xs sm:text-sm mt-1 text-gray-300">Ketik nama / kode, atau arahkan scanner ke barcode</p>
        </div>
      {/if}
    </div>
  </div>

  <!-- RIGHT: Cart panel (desktop only) -->
  <div class="hidden lg:flex w-[22rem] flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden shrink-0">
    <!-- Cart header -->
    <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>
        <h2 class="text-sm font-semibold text-gray-700">Keranjang</h2>
        {#if $cart.length > 0}
          <span class="text-xs bg-primary-100 text-primary-700 font-semibold px-1.5 py-0.5 rounded-full">
            {totalQty} item
          </span>
        {/if}
      </div>
      {#if $cart.length > 0}
        <button on:click={() => showCancelCartConfirm = true}
          class="text-xs text-red-400 hover:text-red-600 transition">Kosongkan</button>
      {/if}
    </div>

    <!-- Cart items -->
    <div class="flex-1 overflow-y-auto">
      {#if $cart.length === 0}
        <div class="flex flex-col items-center justify-center h-full py-10 text-gray-300">
          <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
          <p class="text-xs font-medium text-gray-400">Belum ada produk</p>
        </div>
      {:else}
        <div class="divide-y divide-gray-50">
          {#each $cart as item (item.productId)}
            {@const lineTotal = item.price * item.quantity}
            <div class="px-4 py-3 hover:bg-gray-50 transition group">
              <div class="flex items-start gap-2">
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-semibold text-gray-900 leading-snug truncate">{item.name}</p>
                  <p class="text-xs text-primary-600 font-bold mt-0.5">
                    {formatRp(item.price)}<span class="text-gray-400 font-normal">/{item.unitSymbol}</span>
                  </p>
                </div>
                <button on:click={() => cart.remove(item.productId)}
                  class="shrink-0 p-0.5 text-gray-300 hover:text-red-400 transition opacity-0 group-hover:opacity-100"
                  aria-label="Hapus">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <div class="flex items-center justify-between mt-2">
                <div class="flex items-center rounded-lg border border-gray-200 overflow-hidden text-sm">
                  <button on:click={() => cart.updateQty(item.productId, item.quantity - 1)}
                    class="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition font-bold">−</button>
                  <input type="number" min="1" max={item.stock} value={item.quantity}
                    on:change={(e) => cart.updateQty(item.productId, parseInt((e.target as HTMLInputElement).value) || 1)}
                    class="w-9 h-7 text-center text-xs border-x border-gray-200 focus:outline-none bg-white font-semibold" />
                  <button on:click={() => cart.updateQty(item.productId, item.quantity + 1)}
                    class="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition font-bold">+</button>
                </div>
                <span class="text-sm font-bold text-gray-800">{formatRp(lineTotal)}</span>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Totals -->
    <div class="border-t border-gray-100 px-4 pt-3 pb-2 space-y-2 bg-gray-50">
      <div class="flex justify-between text-sm text-gray-500">
        <span>Subtotal</span>
        <span class="font-medium text-gray-700">{formatRp(itemSubtotal)}</span>
      </div>
      <div class="flex items-center justify-between text-sm text-gray-500">
        <span>Diskon (Rp)</span>
        <input type="number" min="0" max={itemSubtotal} bind:value={cartDiscount}
          class="w-28 text-right text-sm border border-gray-200 rounded-lg px-2 py-1
                 focus:outline-none focus:ring-1 focus:ring-primary-400 bg-white font-medium text-gray-700" />
      </div>
      {#if data.taxPercentage > 0}
        <div class="flex justify-between text-sm text-gray-500">
          <span>PPN {data.taxPercentage}%</span>
          <span class="font-medium text-gray-700">{formatRp(tax)}</span>
        </div>
      {/if}
      <div class="flex justify-between items-center pt-2 border-t border-gray-200">
        <span class="text-sm font-bold text-gray-800">Total</span>
        <span class="text-xl font-bold text-primary-700">{formatRp(total)}</span>
      </div>
    </div>

    <!-- Action buttons -->
    <div class="px-4 pb-4 pt-3 flex gap-2 bg-gray-50 border-t border-gray-100">
      <button on:click={() => submitSale('HOLD')} disabled={$cart.length === 0 || submitting}
        class="flex-1 py-2.5 text-sm font-semibold text-amber-700 border-2 border-amber-300
               bg-white hover:bg-amber-50 rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed">
        Hold
      </button>
      <button on:click={openPayment} disabled={$cart.length === 0 || submitting}
        class="flex-[2] py-2.5 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700
               rounded-xl transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
        {submitting ? 'Memproses...' : 'Bayar ' + formatRp(total)}
      </button>
    </div>
  </div>
</div>

<!-- ── Mobile: Bottom cart bar (lg:hidden) ────────────────────────────────── -->
<div class="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-lg px-4 py-3">
  {#if $cart.length === 0}
    <div class="flex items-center justify-between">
      <a href="/sales/history"
        class="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
        Riwayat
      </a>
      <p class="text-sm text-gray-400">Keranjang kosong</p>
    </div>
  {:else}
    <button on:click={() => showMobileCart = true}
      class="w-full flex items-center justify-between bg-primary-600 text-white rounded-xl px-4 py-3 active:bg-primary-700 transition">
      <div class="flex items-center gap-2.5">
        <div class="relative">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
          <span class="absolute -top-2 -right-2 bg-white text-primary-700 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {$cart.length}
          </span>
        </div>
        <div class="text-left">
          <p class="text-xs opacity-80">{totalQty} item</p>
          <p class="text-sm font-bold">{formatRp(total)}</p>
        </div>
      </div>
      <div class="flex items-center gap-1.5 text-sm font-semibold">
        <span>Lihat Keranjang</span>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
        </svg>
      </div>
    </button>
  {/if}
</div>

<!-- ── Mobile: Cart drawer (slide up) ────────────────────────────────────── -->
{#if showMobileCart}
  <button class="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
    on:click={() => showMobileCart = false} aria-label="Tutup"></button>
{/if}
<div class="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl
            flex flex-col max-h-[85vh] transition-transform duration-300
            {showMobileCart ? 'translate-y-0' : 'translate-y-full'}"
  style="will-change: transform;">

  <!-- Drawer handle + header -->
  <div class="flex flex-col">
    <div class="flex justify-center pt-3 pb-1">
      <div class="w-10 h-1 bg-gray-300 rounded-full"></div>
    </div>
    <div class="px-4 py-3 flex items-center justify-between border-b border-gray-100">
      <div class="flex items-center gap-2">
        <h2 class="text-sm font-bold text-gray-900">Keranjang</h2>
        {#if $cart.length > 0}
          <span class="text-xs bg-primary-100 text-primary-700 font-semibold px-1.5 py-0.5 rounded-full">
            {totalQty} item
          </span>
        {/if}
      </div>
      <div class="flex items-center gap-3">
        {#if $cart.length > 0}
          <button on:click={() => showCancelCartConfirm = true}
            class="text-xs text-red-400 hover:text-red-600 transition">Kosongkan</button>
        {/if}
        <button on:click={() => showMobileCart = false} aria-label="Tutup"
          class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  </div>

  <!-- Cart items -->
  <div class="flex-1 overflow-y-auto">
    {#if $cart.length === 0}
      <div class="flex flex-col items-center justify-center py-12 text-gray-300">
        <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>
        <p class="text-sm font-medium text-gray-400">Keranjang kosong</p>
      </div>
    {:else}
      <div class="divide-y divide-gray-50">
        {#each $cart as item (item.productId)}
          {@const lineTotal = item.price * item.quantity}
          <div class="px-4 py-3 flex items-center gap-3">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
              <p class="text-xs text-primary-600 font-bold mt-0.5">{formatRp(item.price)}<span class="text-gray-400 font-normal">/{item.unitSymbol}</span></p>
            </div>
            <div class="flex items-center rounded-lg border border-gray-200 overflow-hidden text-sm shrink-0">
              <button on:click={() => cart.updateQty(item.productId, item.quantity - 1)}
                class="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition font-bold">−</button>
              <span class="w-8 h-8 flex items-center justify-center text-sm font-bold text-gray-800 border-x border-gray-200">
                {item.quantity}
              </span>
              <button on:click={() => cart.updateQty(item.productId, item.quantity + 1)}
                class="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition font-bold">+</button>
            </div>
            <div class="text-right shrink-0 w-20">
              <p class="text-sm font-bold text-gray-800">{formatRp(lineTotal)}</p>
              <button on:click={() => cart.remove(item.productId)}
                class="text-xs text-red-400 hover:text-red-600 transition mt-0.5">Hapus</button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Totals + actions -->
  {#if $cart.length > 0}
    <div class="border-t border-gray-100 px-4 pt-3 pb-2 space-y-2 bg-gray-50">
      <div class="flex justify-between text-sm text-gray-500">
        <span>Subtotal</span>
        <span class="font-medium text-gray-700">{formatRp(itemSubtotal)}</span>
      </div>
      <div class="flex items-center justify-between text-sm text-gray-500">
        <span>Diskon (Rp)</span>
        <input type="number" min="0" max={itemSubtotal} bind:value={cartDiscount}
          class="w-28 text-right text-sm border border-gray-200 rounded-lg px-2 py-1.5
                 focus:outline-none focus:ring-1 focus:ring-primary-400 bg-white font-medium text-gray-700" />
      </div>
      {#if data.taxPercentage > 0}
        <div class="flex justify-between text-sm text-gray-500">
          <span>PPN {data.taxPercentage}%</span>
          <span class="font-medium text-gray-700">{formatRp(tax)}</span>
        </div>
      {/if}
      <div class="flex justify-between items-center pt-2 border-t border-gray-200">
        <span class="text-sm font-bold text-gray-800">Total</span>
        <span class="text-xl font-bold text-primary-700">{formatRp(total)}</span>
      </div>
    </div>
    <div class="px-4 pb-6 pt-3 flex gap-2 bg-gray-50 border-t border-gray-100">
      <button on:click={() => submitSale('HOLD')} disabled={submitting}
        class="flex-1 py-3 text-sm font-semibold text-amber-700 border-2 border-amber-300
               bg-white hover:bg-amber-50 rounded-xl transition disabled:opacity-40">
        Hold
      </button>
      <button on:click={openPayment} disabled={submitting}
        class="flex-[2] py-3 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700
               rounded-xl transition shadow-sm disabled:opacity-40">
        {submitting ? 'Memproses...' : 'Bayar ' + formatRp(total)}
      </button>
    </div>
  {/if}
</div>

<!-- ── Payment Modal ──────────────────────────────────────────────────────── -->
{#if showPayment}
  <button class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" on:click={() => showPayment = false} aria-label="Tutup"></button>
  <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 pointer-events-none">
    <div class="bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl w-full sm:max-w-sm pointer-events-auto">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <h3 class="font-bold text-gray-900">Pembayaran</h3>
        <button on:click={() => showPayment = false}
          class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100" aria-label="Tutup">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
        <!-- Total display -->
        <div class="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-5 text-center text-white">
          <p class="text-xs opacity-80 mb-1 uppercase tracking-wide">Total Pembayaran</p>
          <p class="text-4xl font-bold">{formatRp(total)}</p>
          <p class="text-xs opacity-70 mt-1">{totalQty} item</p>
        </div>

        <!-- Payment method -->
        <div>
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Metode Pembayaran</p>
          <div class="grid grid-cols-2 gap-2">
            {#each [['CASH', 'Tunai', '💵'], ['TRANSFER', 'Transfer', '🏦']] as [method, label, icon]}
              <button on:click={() => paymentMethod = method as 'CASH' | 'TRANSFER'}
                class="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border-2 transition-all
                  {paymentMethod === method
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}">
                <span>{icon}</span> {label}
              </button>
            {/each}
          </div>
        </div>

        <!-- Cash input -->
        {#if paymentMethod === 'CASH'}
          <div>
            <label for="paid-amount" class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Jumlah Bayar
            </label>
            <input id="paid-amount" bind:this={amountInput} type="number" min={total} bind:value={amountPaid}
              placeholder={formatRp(total)}
              class="w-full px-4 py-3 border-2 rounded-xl text-right text-xl font-bold focus:outline-none transition
                     {Number(amountPaid) >= total && amountPaid
                       ? 'border-green-400 bg-green-50 text-green-800'
                       : amountPaid
                         ? 'border-red-300 bg-red-50 text-red-700'
                         : 'border-gray-300 text-gray-900'}" />

            <div class="flex gap-1.5 mt-2 flex-wrap">
              {#each [...new Set([total, Math.ceil(total / 5000) * 5000, Math.ceil(total / 10000) * 10000, Math.ceil(total / 50000) * 50000])] as nominal}
                <button on:click={() => amountPaid = String(nominal)}
                  class="px-2.5 py-1 text-xs font-medium border rounded-lg transition
                         {Number(amountPaid) === nominal
                           ? 'border-primary-400 bg-primary-50 text-primary-700'
                           : 'border-gray-200 text-gray-600 hover:bg-gray-50'}">
                  {formatRp(nominal)}
                </button>
              {/each}
            </div>
          </div>

          {#if Number(amountPaid) >= total && amountPaid}
            <div class="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <span class="text-sm text-green-700 font-medium">Kembalian</span>
              <span class="text-xl font-bold text-green-700">{formatRp(cashChange)}</span>
            </div>
          {:else if amountPaid && Number(amountPaid) < total}
            <div class="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <span class="text-sm text-red-600">Kurang</span>
              <span class="text-lg font-bold text-red-600">{formatRp(total - Number(amountPaid))}</span>
            </div>
          {/if}
        {/if}
      </div>

      <div class="px-5 pb-6 pt-2">
        <button on:click={() => submitSale('COMPLETED')} disabled={submitting || !canPay}
          class="w-full py-3.5 font-bold text-white rounded-xl transition text-base
                 {canPay && !submitting ? 'bg-primary-600 hover:bg-primary-700 shadow-sm' : 'bg-gray-300 cursor-not-allowed'}">
          {submitting ? 'Memproses...' : 'Konfirmasi Pembayaran'}
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- ── Hold List Panel ────────────────────────────────────────────────────── -->
{#if showHoldList}
  <button class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
    on:click={() => showHoldList = false} aria-label="Tutup"></button>
  <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 pointer-events-none">
    <div class="bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl w-full sm:max-w-md pointer-events-auto max-h-[80vh] flex flex-col">
      <div class="px-5 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
        <div>
          <h3 class="font-bold text-gray-900">Transaksi Hold</h3>
          <p class="text-xs text-gray-400 mt-0.5">{heldSales.length} transaksi menunggu</p>
        </div>
        <button on:click={() => showHoldList = false} aria-label="Tutup"
          class="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div class="overflow-y-auto divide-y divide-gray-50">
        {#each heldSales as held}
          <div class="px-5 py-4 flex items-center justify-between gap-3 hover:bg-gray-50 transition">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-mono font-bold text-gray-900">{held.invoiceNumber}</p>
              <p class="text-xs text-gray-400 mt-0.5">
                {held.items?.length ?? 0} produk · {formatDate(held.createdAt)}
              </p>
              <p class="text-base font-bold text-primary-600 mt-1">{formatRp(Number(held.total))}</p>
            </div>
            <div class="flex gap-2 shrink-0">
              <a href="/sales/{held.id}"
                class="px-3 py-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition">
                Detail
              </a>
              <button on:click={() => { cancelHoldId = held.id; showCancelHoldConfirm = true; showHoldList = false }}
                class="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition">
                Batal
              </button>
            </div>
          </div>
        {:else}
          <div class="flex flex-col items-center py-12 text-gray-400">
            <p class="text-sm">Tidak ada transaksi hold</p>
          </div>
        {/each}
      </div>
    </div>
  </div>
{/if}

<!-- ── Receipt Modal ──────────────────────────────────────────────────────── -->
{#if receipt}
  <button class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
    on:click={() => receipt = null} aria-label="Tutup"></button>
  <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 pointer-events-none">
    <div class="bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl w-full sm:max-w-sm pointer-events-auto max-h-[90vh] flex flex-col">
      <!-- Success header -->
      <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <div>
            <p class="text-sm font-bold text-gray-900">Transaksi Berhasil</p>
            <p class="text-xs text-gray-400 font-mono">{receipt.invoiceNumber}</p>
          </div>
        </div>
        <button on:click={printReceipt}
          class="px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
          🖨 Print
        </button>
      </div>

      <div class="overflow-y-auto px-5 py-4 space-y-1">
        {#each receipt.items as item}
          <div class="flex justify-between items-start gap-2 text-sm py-1">
            <div class="flex-1 min-w-0">
              <p class="text-gray-800 font-medium truncate">{item.product.name}</p>
              <p class="text-xs text-gray-400">{item.quantity} × {formatRp(Number(item.price))}</p>
            </div>
            <span class="font-semibold text-gray-900 shrink-0">{formatRp(Number(item.subtotal))}</span>
          </div>
        {/each}
      </div>

      <div class="px-5 py-3 border-t border-dashed border-gray-200 space-y-1.5 bg-gray-50">
        <div class="flex justify-between text-xs text-gray-500">
          <span>Subtotal</span><span>{formatRp(Number(receipt.subtotal))}</span>
        </div>
        {#if Number(receipt.discount) > 0}
          <div class="flex justify-between text-xs text-gray-500">
            <span>Diskon</span><span class="text-red-500">−{formatRp(Number(receipt.discount))}</span>
          </div>
        {/if}
        <div class="flex justify-between text-xs text-gray-500">
          <span>Pajak</span><span>{formatRp(Number(receipt.tax))}</span>
        </div>
        <div class="flex justify-between font-bold text-base border-t border-gray-200 pt-2 text-gray-900">
          <span>Total</span><span>{formatRp(Number(receipt.total))}</span>
        </div>
        {#if receipt.paymentMethod === 'CASH'}
          <div class="flex justify-between text-sm text-gray-500">
            <span>Dibayar</span><span>{formatRp(Number(receipt.amountPaid))}</span>
          </div>
          <div class="flex justify-between text-sm font-bold text-green-700">
            <span>Kembalian</span><span>{formatRp(Number(receipt.change))}</span>
          </div>
        {:else}
          <div class="flex justify-between text-sm text-gray-500">
            <span>Metode</span><span>Transfer</span>
          </div>
        {/if}
      </div>

      <div class="px-5 py-4 border-t border-gray-100">
        <button on:click={() => receipt = null}
          class="w-full py-3 font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition text-sm">
          Transaksi Baru
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Confirm dialogs -->
<ConfirmDialog bind:open={showCancelCartConfirm}
  title="Kosongkan Keranjang?"
  message="Semua item akan dihapus dari keranjang."
  on:confirm={() => { cart.clear(); cartDiscount = 0; showCancelCartConfirm = false }} />

<ConfirmDialog bind:open={showCancelHoldConfirm}
  title="Batalkan Transaksi Hold?"
  message="Transaksi ini akan dibatalkan dan tidak dapat dikembalikan."
  on:confirm={() => { cancelHold(); showCancelHoldConfirm = false }} />
