<script lang="ts">
  import type { PageData } from './$types'
  export let data: PageData

  $: report = data.report as any
  $: rows = report.data ?? []
  $: meta = report.meta ?? {}
  $: summary = report.summary ?? {}

  function rp(n: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
  }
  function fmtDate(d: string | Date) {
    return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  function buildUrl(extra: Record<string, string>) {
    const f = data.filters as any
    const p = new URLSearchParams({ ...f, ...extra })
    return `/reports/sales?${p}`
  }

  async function exportExcel() {
    const XLSX = await import('xlsx')
    const headers = ['Invoice', 'Kasir', 'Item', 'Subtotal', 'Diskon', 'Pajak', 'Total', 'Metode Bayar', 'Tanggal']
    const dataRows = rows.map((r: any) => [
      r.invoiceNumber, r.cashier, r.itemCount,
      r.subtotal, r.discount, r.tax, r.total,
      r.paymentMethod ?? '-',
      new Date(r.createdAt).toLocaleString('id-ID'),
    ])
    const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows])
    ws['!cols'] = [20, 20, 8, 15, 15, 15, 15, 12, 20].map(w => ({ wch: w }))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Penjualan')
    XLSX.writeFile(wb, `laporan-penjualan-${data.filters.dateFrom ?? 'semua'}-${data.filters.dateTo ?? ''}.xlsx`)
  }
</script>

<svelte:head><title>Laporan Penjualan — PharmaPOS</title></svelte:head>

<!-- Summary -->
<div class="grid grid-cols-3 gap-4 mb-6">
  <div class="bg-white rounded-xl border border-gray-200 p-4">
    <p class="text-xs text-gray-500">Total Transaksi</p>
    <p class="text-xl font-bold text-gray-900 mt-1">{summary.totalTransactions ?? 0}</p>
  </div>
  <div class="bg-white rounded-xl border border-gray-200 p-4">
    <p class="text-xs text-gray-500">Total Pendapatan</p>
    <p class="text-xl font-bold text-sky-600 mt-1">{rp(summary.totalRevenue ?? 0)}</p>
  </div>
  <div class="bg-white rounded-xl border border-gray-200 p-4">
    <p class="text-xs text-gray-500">Rata-rata Transaksi</p>
    <p class="text-xl font-bold text-gray-900 mt-1">{rp(summary.avgTransaction ?? 0)}</p>
  </div>
</div>

<!-- Filters -->
<form method="get" class="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-end no-print">
  <div class="flex flex-col gap-1">
    <label for="rep-date-from" class="text-xs text-gray-500">Dari</label>
    <input id="rep-date-from" type="date" name="dateFrom" value={data.filters.dateFrom} class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
  </div>
  <div class="flex flex-col gap-1">
    <label for="rep-date-to" class="text-xs text-gray-500">Sampai</label>
    <input id="rep-date-to" type="date" name="dateTo" value={data.filters.dateTo} class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
  </div>
  <div class="flex flex-col gap-1">
    <label for="rep-cashier" class="text-xs text-gray-500">Kasir</label>
    <select id="rep-cashier" name="cashierId" class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
      <option value="">Semua</option>
      {#each data.cashiers as c}
        <option value={c.id} selected={data.filters.cashierId === c.id}>{c.name}</option>
      {/each}
    </select>
  </div>
  <div class="flex flex-col gap-1">
    <label for="rep-method" class="text-xs text-gray-500">Metode</label>
    <select id="rep-method" name="paymentMethod" class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
      <option value="">Semua</option>
      <option value="CASH" selected={data.filters.paymentMethod === 'CASH'}>Tunai</option>
      <option value="TRANSFER" selected={data.filters.paymentMethod === 'TRANSFER'}>Transfer</option>
    </select>
  </div>
  <button type="submit" class="bg-sky-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-sky-700">Terapkan</button>
  <button type="button" on:click={exportExcel} class="border border-emerald-500 text-emerald-700 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-50 no-print">Export Excel</button>
  <button type="button" on:click={() => window.print()} class="border border-gray-300 text-gray-700 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-50 no-print">Cetak PDF</button>
</form>

<!-- Table -->
<div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
  <div class="overflow-x-auto">
    <table class="w-full text-sm">
      <thead class="bg-gray-50 border-b border-gray-200">
        <tr>
          <th class="text-left px-4 py-3 text-xs font-semibold text-gray-600">Invoice</th>
          <th class="text-left px-4 py-3 text-xs font-semibold text-gray-600">Kasir</th>
          <th class="text-center px-4 py-3 text-xs font-semibold text-gray-600">Item</th>
          <th class="text-right px-4 py-3 text-xs font-semibold text-gray-600">Subtotal</th>
          <th class="text-right px-4 py-3 text-xs font-semibold text-gray-600">Diskon</th>
          <th class="text-right px-4 py-3 text-xs font-semibold text-gray-600">Total</th>
          <th class="text-left px-4 py-3 text-xs font-semibold text-gray-600">Metode</th>
          <th class="text-left px-4 py-3 text-xs font-semibold text-gray-600">Tanggal</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        {#each rows as r}
          <tr class="hover:bg-gray-50">
            <td class="px-4 py-3 font-mono text-xs text-gray-700">{r.invoiceNumber}</td>
            <td class="px-4 py-3 text-gray-700">{r.cashier}</td>
            <td class="px-4 py-3 text-center text-gray-700">{r.itemCount}</td>
            <td class="px-4 py-3 text-right text-gray-700">{rp(r.subtotal)}</td>
            <td class="px-4 py-3 text-right text-gray-500">{rp(r.discount)}</td>
            <td class="px-4 py-3 text-right font-semibold text-gray-900">{rp(r.total)}</td>
            <td class="px-4 py-3 text-gray-600">{r.paymentMethod ?? '-'}</td>
            <td class="px-4 py-3 text-gray-500 text-xs">{fmtDate(r.createdAt)}</td>
          </tr>
        {:else}
          <tr><td colspan="8" class="px-4 py-10 text-center text-gray-400">Tidak ada data untuk filter ini</td></tr>
        {/each}
      </tbody>
    </table>
  </div>

  <!-- Pagination -->
  {#if meta.totalPages > 1}
    <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <p class="text-xs text-gray-500">Total {meta.total} transaksi</p>
      <div class="flex gap-1">
        {#each Array.from({ length: meta.totalPages }, (_, i) => i + 1) as p}
          <a href={buildUrl({ page: String(p) })}
             class="w-7 h-7 flex items-center justify-center rounded text-xs {p === meta.page ? 'bg-sky-600 text-white' : 'text-gray-600 hover:bg-gray-100'}">{p}</a>
        {/each}
      </div>
    </div>
  {/if}
</div>
