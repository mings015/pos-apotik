<script lang="ts">
  import { enhance } from '$app/forms'
  import { invalidateAll } from '$app/navigation'
  import PageHeader from '$components/ui/PageHeader.svelte'
  import Badge from '$components/ui/Badge.svelte'
  import ConfirmDialog from '$components/ui/ConfirmDialog.svelte'
  import { toast } from '$stores/toast'
  import type { PageData, ActionData } from './$types'
  import type { PurchaseOrderStatus, InvoicePaymentStatus } from '@pharmapos/types'

  export let data: PageData
  export let form: ActionData

  $: po = data.po
  $: invoice = (po as any).invoice

  type FormResult = { success?: boolean; message?: string; error?: string } | null
  $: f = form as FormResult
  $: if (f?.success) { toast.success(f.message ?? 'Berhasil'); invalidateAll() }
  $: if (f?.error) toast.error(f.error ?? 'Terjadi kesalahan')

  let showStatusConfirm = false
  let pendingStatus = ''
  let statusLoading = false
  let statusFormEl: HTMLFormElement
  let receiveLoading = false
  let paymentLoading = false
  let returnLoading = false
  let showPaymentForm = false
  let showReturnForm = false

  // Receive goods state — non-reactive so user edits aren't reset
  type ReceiveItem = { productId: string; quantity: number; purchasePrice: number; batchNumber: string; expiredDate: string }
  let receiveItems: ReceiveItem[] = (data.po.items ?? []).map((item: any): ReceiveItem => ({
    productId: item.productId,
    quantity: item.quantity,
    purchasePrice: Number(item.purchasePrice),
    batchNumber: '',
    expiredDate: '',
  }))

  // Payment form state
  let paymentAmount = 0
  let paymentMethod = 'CASH'
  let paymentDate = new Date().toISOString().slice(0, 10)
  let paymentNotes = ''

  // Return form state
  type ReturnItem = { productId: string; batchId: string; productName: string; batchNumber: string; quantity: number; maxQuantity: number }
  let returnItems: ReturnItem[] = []
  let returnReason = ''
  let returnNotes = ''

  $: if (hasReceiving && !returnItems.length) {
    const gr = (po as any).receivings?.[0]
    returnItems = (gr?.items ?? []).map((gri: any): ReturnItem => ({
      productId: gri.productId,
      batchId: gri.batch?.id ?? gri.batchId,
      productName: gri.product?.name ?? '—',
      batchNumber: gri.batch?.batchNumber ?? '—',
      quantity: 0,
      maxQuantity: gri.quantity,
    }))
  }

  function statusVariant(s: PurchaseOrderStatus) {
    if (s === 'RECEIVED') return 'success' as const
    if (s === 'APPROVED') return 'info' as const
    if (s === 'PENDING') return 'warning' as const
    if (s === 'CANCELLED') return 'danger' as const
    return 'gray' as const
  }

  function statusLabel(s: PurchaseOrderStatus) {
    const map: Record<PurchaseOrderStatus, string> = { DRAFT: 'Draft', PENDING: 'Menunggu', APPROVED: 'Disetujui', RECEIVED: 'Diterima', CANCELLED: 'Dibatalkan' }
    return map[s] ?? s
  }

  function invoiceStatusVariant(s: InvoicePaymentStatus) {
    if (s === 'PAID') return 'success' as const
    if (s === 'PARTIAL') return 'warning' as const
    return 'danger' as const
  }

  function invoiceStatusLabel(s: InvoicePaymentStatus) {
    if (s === 'PAID') return 'Lunas'
    if (s === 'PARTIAL') return 'Sebagian'
    return 'Belum Bayar'
  }

  function formatRp(n: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
  }

  function formatDate(d: string) {
    return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d))
  }

  function formatDateShort(d: string) {
    return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d))
  }

  function requestStatus(s: string) {
    pendingStatus = s
    showStatusConfirm = true
  }

  $: canReceive = po.status === 'APPROVED' && !(po as any).receivings?.length
  $: hasReceiving = (po as any).receivings?.length > 0

  let receiveFormEl: HTMLFormElement
  let returnFormEl: HTMLFormElement

  function submitReceive() {
    if (receiveItems.some((i: ReceiveItem) => !i.batchNumber.trim())) { toast.error('Isi nomor batch untuk semua produk'); return }
    if (receiveItems.some((i: ReceiveItem) => !i.expiredDate)) { toast.error('Isi tanggal kadaluarsa untuk semua produk'); return }
    if (receiveItems.some((i: ReceiveItem) => i.quantity < 1)) { toast.error('Jumlah terima minimal 1 untuk setiap produk'); return }
    receiveFormEl.requestSubmit()
  }

  $: remaining = invoice ? Number(invoice.totalAmount) - Number(invoice.paidAmount) : 0

  $: activeReturnItems = returnItems.filter(i => i.quantity > 0)

  function submitReturn() {
    if (activeReturnItems.length === 0) { toast.error('Pilih minimal satu item untuk diretur'); return }
    if (!returnReason.trim()) { toast.error('Isi alasan retur'); return }
    returnFormEl.requestSubmit()
  }
</script>

<svelte:head><title>PO {po.poNumber} — PharmaPOS</title></svelte:head>

<div class="space-y-6">
  <PageHeader title="Purchase Order: {po.poNumber}" description="Detail pesanan pembelian">
    <a href="/purchases" class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
      Kembali
    </a>
  </PageHeader>

  <!-- PO Header Info -->
  <div class="bg-white rounded-xl border border-gray-200 p-6">
    <div class="flex items-start justify-between mb-4">
      <div>
        <p class="text-xs text-gray-500 mb-1">Nomor PO</p>
        <p class="font-mono font-semibold text-gray-900">{po.poNumber}</p>
      </div>
      <Badge variant={statusVariant(po.status as PurchaseOrderStatus)}>
        {statusLabel(po.status as PurchaseOrderStatus)}
      </Badge>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
      <div>
        <p class="text-xs text-gray-500 mb-0.5">Supplier</p>
        <p class="font-medium text-gray-900">{(po as any).supplier?.name ?? '—'}</p>
      </div>
      <div>
        <p class="text-xs text-gray-500 mb-0.5">Dibuat oleh</p>
        <p class="font-medium text-gray-900">{(po as any).createdBy?.name ?? '—'}</p>
      </div>
      <div>
        <p class="text-xs text-gray-500 mb-0.5">Tanggal</p>
        <p class="font-medium text-gray-900">{formatDate(String(po.createdAt))}</p>
      </div>
      <div>
        <p class="text-xs text-gray-500 mb-0.5">Total</p>
        <p class="font-semibold text-primary-700">{formatRp(Number(po.total))}</p>
      </div>
    </div>
    {#if po.notes}
      <p class="mt-3 text-sm text-gray-600 border-t border-gray-100 pt-3">{po.notes}</p>
    {/if}

    <!-- Status Actions -->
    {#if po.status === 'DRAFT'}
      <div class="mt-4 flex gap-2">
        <button on:click={() => requestStatus('PENDING')}
          class="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition">
          Submit PO
        </button>
        <button on:click={() => requestStatus('CANCELLED')}
          class="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition">
          Batalkan
        </button>
      </div>
    {:else if po.status === 'PENDING'}
      <div class="mt-4 flex gap-2">
        <button on:click={() => requestStatus('APPROVED')}
          class="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition">
          Setujui PO
        </button>
        <button on:click={() => requestStatus('CANCELLED')}
          class="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition">
          Batalkan
        </button>
      </div>
    {:else if po.status === 'APPROVED' && !hasReceiving}
      <div class="mt-4">
        <button on:click={() => requestStatus('CANCELLED')}
          class="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition">
          Batalkan PO
        </button>
      </div>
    {/if}
  </div>

  <!-- PO Items -->
  <div class="bg-white rounded-xl border border-gray-200 overflow-x-auto">
    <div class="px-5 py-4 border-b border-gray-200">
      <h3 class="text-sm font-semibold text-gray-900">Daftar Item Pesanan</h3>
    </div>
    <table class="w-full text-sm">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Produk</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Satuan</th>
          <th class="px-4 py-3 text-right font-medium text-gray-600">Jumlah</th>
          <th class="px-4 py-3 text-right font-medium text-gray-600">Harga Beli</th>
          <th class="px-4 py-3 text-right font-medium text-gray-600">Subtotal</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        {#each (po.items ?? []) as item}
          <tr>
            <td class="px-4 py-3 text-gray-900 font-medium">{(item as any).product?.name ?? '—'}</td>
            <td class="px-4 py-3 text-gray-500 text-xs">{(item as any).product?.unit?.symbol ?? '—'}</td>
            <td class="px-4 py-3 text-right text-gray-700">{item.quantity}</td>
            <td class="px-4 py-3 text-right text-gray-700">{formatRp(Number(item.purchasePrice))}</td>
            <td class="px-4 py-3 text-right font-medium text-gray-900">{formatRp(Number(item.subtotal))}</td>
          </tr>
        {/each}
      </tbody>
      <tfoot class="bg-gray-50 border-t border-gray-200">
        <tr>
          <td colspan="4" class="px-4 py-2 text-right text-sm font-medium text-gray-600">Subtotal</td>
          <td class="px-4 py-2 text-right text-sm font-medium">{formatRp(Number(po.subtotal))}</td>
        </tr>
        {#if Number(po.tax) > 0}
          <tr>
            <td colspan="4" class="px-4 py-2 text-right text-sm text-gray-600">Pajak</td>
            <td class="px-4 py-2 text-right text-sm">{formatRp(Number(po.tax))}</td>
          </tr>
        {/if}
        {#if Number(po.discount) > 0}
          <tr>
            <td colspan="4" class="px-4 py-2 text-right text-sm text-gray-600">Diskon</td>
            <td class="px-4 py-2 text-right text-sm text-red-600">-{formatRp(Number(po.discount))}</td>
          </tr>
        {/if}
        <tr class="border-t border-gray-200">
          <td colspan="4" class="px-4 py-2 text-right font-semibold text-gray-900">Total</td>
          <td class="px-4 py-2 text-right font-bold text-primary-700">{formatRp(Number(po.total))}</td>
        </tr>
      </tfoot>
    </table>
  </div>

  <!-- Goods Receiving Form (saat APPROVED & belum terima) -->
  {#if canReceive}
    <div class="bg-white rounded-xl border border-primary-200 p-6">
      <h3 class="text-sm font-semibold text-gray-900 mb-1">Terima Barang</h3>
      <p class="text-xs text-gray-500 mb-4">Isi nomor batch, tanggal kadaluarsa, dan jumlah barang yang diterima untuk setiap produk.</p>

      <form bind:this={receiveFormEl} method="POST" action="?/receiveGoods"
        use:enhance={() => { receiveLoading = true; return async ({ update }) => { await update(); receiveLoading = false } }}>
        <input type="hidden" name="items" value={JSON.stringify(receiveItems)} />
        <input type="hidden" name="notes" value="" />

        <div class="space-y-3 mb-4">
          {#each receiveItems as rItem, i}
            {@const poItem = (po.items ?? [])[i]}
            <div class="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div class="text-sm font-semibold text-gray-800 mb-3">
                {(poItem as any)?.product?.name ?? '—'}
                <span class="text-xs font-normal text-gray-500 ml-1">({(poItem as any)?.product?.unit?.symbol ?? ''})</span>
              </div>
              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label for="recv-qty-{i}" class="text-xs text-gray-500 mb-1 block">Jumlah Diterima <span class="text-red-400">*</span></label>
                  <input id="recv-qty-{i}" type="number" bind:value={rItem.quantity}
                    min="1" max={(poItem as any)?.quantity ?? 9999}
                    class="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  <p class="text-[10px] text-gray-400 mt-0.5">Maks: {(poItem as any)?.quantity ?? '—'}</p>
                </div>
                <div>
                  <label for="batch-{i}" class="text-xs text-gray-500 mb-1 block">Nomor Batch <span class="text-red-400">*</span></label>
                  <input id="batch-{i}" type="text" bind:value={rItem.batchNumber} placeholder="Contoh: BTH-001"
                    class="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label for="exp-{i}" class="text-xs text-gray-500 mb-1 block">Tanggal Kadaluarsa <span class="text-red-400">*</span></label>
                  <input id="exp-{i}" type="date" bind:value={rItem.expiredDate}
                    class="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
            </div>
          {/each}
        </div>

        <button type="button" on:click={submitReceive} disabled={receiveLoading}
          class="px-5 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 rounded-lg transition">
          {receiveLoading ? 'Memproses...' : 'Konfirmasi Penerimaan Barang'}
        </button>
      </form>
    </div>
  {/if}

  <!-- Receiving History -->
  {#if hasReceiving}
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <h3 class="text-sm font-semibold text-gray-900 mb-3">Riwayat Penerimaan Barang</h3>
      {#each (po as any).receivings as gr}
        <p class="text-xs text-gray-500 mb-2">
          Diterima oleh <span class="font-medium text-gray-700">{gr.receivedBy?.name}</span>
          pada {formatDate(String(gr.createdAt))}
        </p>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-3 py-2 text-left font-medium text-gray-600">Produk</th>
                <th class="px-3 py-2 text-right font-medium text-gray-600">Jumlah</th>
                <th class="px-3 py-2 text-left font-medium text-gray-600">No. Batch</th>
                <th class="px-3 py-2 text-left font-medium text-gray-600">Kadaluarsa</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              {#each gr.items as gri}
                <tr>
                  <td class="px-3 py-2 text-gray-900">{gri.product?.name ?? '—'}</td>
                  <td class="px-3 py-2 text-right text-gray-700">{gri.quantity}</td>
                  <td class="px-3 py-2 text-gray-500 font-mono text-xs">{gri.batch?.batchNumber ?? '—'}</td>
                  <td class="px-3 py-2 text-gray-500 text-xs">{gri.batch?.expiredDate ? formatDateShort(String(gri.batch.expiredDate)) : '—'}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Invoice Section -->
  {#if invoice}
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <div class="flex items-start justify-between mb-4">
        <div>
          <h3 class="text-sm font-semibold text-gray-900">Invoice Supplier</h3>
          <p class="text-xs text-gray-500 mt-0.5 font-mono">{invoice.invoiceNumber}</p>
        </div>
        <Badge variant={invoiceStatusVariant(invoice.paymentStatus as InvoicePaymentStatus)}>
          {invoiceStatusLabel(invoice.paymentStatus as InvoicePaymentStatus)}
        </Badge>
      </div>

      <div class="grid grid-cols-3 gap-4 text-sm mb-4">
        <div>
          <p class="text-xs text-gray-500 mb-0.5">Total Invoice</p>
          <p class="font-semibold text-gray-900">{formatRp(Number(invoice.totalAmount))}</p>
        </div>
        <div>
          <p class="text-xs text-gray-500 mb-0.5">Sudah Dibayar</p>
          <p class="font-semibold text-green-600">{formatRp(Number(invoice.paidAmount))}</p>
        </div>
        <div>
          <p class="text-xs text-gray-500 mb-0.5">Sisa Hutang</p>
          <p class="font-semibold {remaining > 0 ? 'text-red-600' : 'text-gray-400'}">{formatRp(remaining)}</p>
        </div>
      </div>

      {#if invoice.dueDate}
        <p class="text-xs text-gray-500 mb-4">Jatuh tempo: <span class="font-medium text-gray-700">{formatDateShort(String(invoice.dueDate))}</span></p>
      {/if}

      {#if invoice.paymentStatus !== 'PAID' && !showPaymentForm}
        <button on:click={() => { showPaymentForm = true; paymentAmount = remaining }}
          class="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition">
          + Catat Pembayaran
        </button>
      {/if}

      {#if showPaymentForm}
        <form method="POST" action="?/recordPayment"
          use:enhance={() => {
            paymentLoading = true
            return async ({ result, update }) => {
              await update({ reset: false })
              paymentLoading = false
              if (result.type === 'success') showPaymentForm = false
            }
          }}>
          <input type="hidden" name="invoiceId" value={invoice.id} />
          <div class="border border-gray-200 rounded-lg p-4 space-y-3 mt-3">
            <h4 class="text-sm font-medium text-gray-900">Catat Pembayaran</h4>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label for="pay-amount" class="text-xs text-gray-500 mb-1 block">Jumlah (maks: {formatRp(remaining)})</label>
                <input id="pay-amount" name="amount" type="number" bind:value={paymentAmount}
                  min="1" max={remaining} step="1" required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label for="pay-method" class="text-xs text-gray-500 mb-1 block">Metode</label>
                <select id="pay-method" name="paymentMethod" bind:value={paymentMethod}
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="CASH">Tunai</option>
                  <option value="TRANSFER">Transfer</option>
                  <option value="CHECK">Cek</option>
                </select>
              </div>
              <div>
                <label for="pay-date" class="text-xs text-gray-500 mb-1 block">Tanggal Bayar</label>
                <input id="pay-date" name="paymentDate" type="date" bind:value={paymentDate} required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label for="pay-notes" class="text-xs text-gray-500 mb-1 block">Catatan</label>
                <input id="pay-notes" name="notes" type="text" bind:value={paymentNotes}
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
            <div class="flex gap-2">
              <button type="submit" disabled={paymentLoading}
                class="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 rounded-lg transition">
                {paymentLoading ? 'Menyimpan...' : 'Simpan Pembayaran'}
              </button>
              <button type="button" on:click={() => showPaymentForm = false}
                class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                Batal
              </button>
            </div>
          </div>
        </form>
      {/if}

      <!-- Payment History -->
      {#if invoice.payments?.length}
        <div class="mt-4">
          <h4 class="text-xs font-medium text-gray-600 mb-2">Riwayat Pembayaran</h4>
          <div class="space-y-2">
            {#each invoice.payments as pay}
              <div class="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg text-sm">
                <div>
                  <span class="font-medium text-gray-900">{formatRp(Number(pay.amount))}</span>
                  <span class="text-gray-500 ml-2">via {pay.paymentMethod === 'CASH' ? 'Tunai' : pay.paymentMethod === 'TRANSFER' ? 'Transfer' : 'Cek'}</span>
                  {#if pay.notes}<span class="text-gray-400 ml-2">— {pay.notes}</span>{/if}
                </div>
                <div class="text-xs text-gray-400">
                  {formatDateShort(String(pay.paymentDate))} · {pay.createdBy?.name}
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Purchase Return Section -->
  {#if hasReceiving && invoice}
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <div class="flex items-center justify-between mb-1">
        <h3 class="text-sm font-semibold text-gray-900">Retur Pembelian</h3>
        {#if !showReturnForm}
          <button on:click={() => showReturnForm = true}
            class="px-3 py-1.5 text-xs font-medium text-orange-600 border border-orange-200 hover:bg-orange-50 rounded-lg transition">
            + Buat Retur
          </button>
        {/if}
      </div>
      <p class="text-xs text-gray-500 mb-4">Kembalikan barang ke supplier jika ada kerusakan, kadaluarsa, atau ketidaksesuaian.</p>

      {#if showReturnForm}
        <form bind:this={returnFormEl} method="POST" action="?/createReturn"
          use:enhance={() => {
            returnLoading = true
            return async ({ result, update }) => {
              await update({ reset: false })
              returnLoading = false
              if (result.type === 'success') { showReturnForm = false; returnReason = ''; returnNotes = ''; returnItems = [] }
            }
          }}>
          <input type="hidden" name="supplierInvoiceId" value={invoice.id} />
          <input type="hidden" name="reason" value={returnReason} />
          <input type="hidden" name="notes" value={returnNotes} />
          <input type="hidden" name="items" value={JSON.stringify(activeReturnItems.map(i => ({ productId: i.productId, batchId: i.batchId, quantity: i.quantity })))} />

          <div class="border border-orange-100 bg-orange-50 rounded-lg p-4 space-y-4">
            <div>
              <h4 class="text-xs font-semibold text-gray-700 mb-2">Pilih Item yang Diretur</h4>
              <div class="space-y-2">
                {#each returnItems as rItem}
                  <div class="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-800">{rItem.productName}</p>
                      <p class="text-xs text-gray-400 font-mono">Batch: {rItem.batchNumber} · Tersedia: {rItem.maxQuantity}</p>
                    </div>
                    <div class="w-24 shrink-0">
                      <label for="ret-qty-{rItem.batchId}" class="text-[10px] text-gray-400 block mb-0.5">Jumlah Retur</label>
                      <input id="ret-qty-{rItem.batchId}" type="number" bind:value={rItem.quantity}
                        min="0" max={rItem.maxQuantity}
                        class="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-right focus:outline-none focus:ring-2 focus:ring-orange-400" />
                    </div>
                  </div>
                {/each}
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="col-span-2">
                <label for="ret-reason" class="text-xs text-gray-600 mb-1 block font-medium">Alasan Retur <span class="text-red-400">*</span></label>
                <input id="ret-reason" type="text" bind:value={returnReason} placeholder="Contoh: Produk rusak, kemasan cacat, salah kirim..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <div class="col-span-2">
                <label for="ret-notes" class="text-xs text-gray-600 mb-1 block">Catatan Tambahan</label>
                <input id="ret-notes" type="text" bind:value={returnNotes} placeholder="Opsional"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
            </div>

            {#if activeReturnItems.length > 0}
              <div class="text-xs text-orange-700 bg-orange-100 rounded px-3 py-2">
                {activeReturnItems.length} produk akan diretur · Total qty: {activeReturnItems.reduce((s, i) => s + i.quantity, 0)}
              </div>
            {/if}

            <div class="flex gap-2">
              <button type="button" on:click={submitReturn} disabled={returnLoading}
                class="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 rounded-lg transition">
                {returnLoading ? 'Memproses...' : 'Konfirmasi Retur'}
              </button>
              <button type="button" on:click={() => showReturnForm = false}
                class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                Batal
              </button>
            </div>
          </div>
        </form>
      {/if}
    </div>
  {/if}
</div>

<form method="POST" action="?/updateStatus" class="hidden"
  use:enhance={() => {
    statusLoading = true
    return async ({ result, update }) => {
      await update()
      statusLoading = false
    }
  }}
  bind:this={statusFormEl}>
  <input type="hidden" name="status" bind:value={pendingStatus} />
</form>

<ConfirmDialog
  bind:open={showStatusConfirm}
  title="Ubah Status PO"
  message="Ubah status PO {po.poNumber} menjadi {pendingStatus === 'PENDING' ? 'Menunggu' : pendingStatus === 'APPROVED' ? 'Disetujui' : 'Dibatalkan'}?"
  confirmLabel="Ya, Ubah"
  loading={statusLoading}
  on:confirm={() => statusFormEl.requestSubmit()}
/>
