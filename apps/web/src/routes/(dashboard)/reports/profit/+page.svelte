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
  function pct(n: number) { return n.toFixed(1) + '%' }

  function buildUrl(extra: Record<string, string>) {
    const f = data.filters as any
    return `/reports/profit?${new URLSearchParams({ ...f, ...extra })}`
  }

  async function exportExcel() {
    const XLSX = await import('xlsx')
    const headers = ['Produk', 'Kode', 'Kategori', 'Qty Terjual', 'Pendapatan', 'HPP', 'Profit', 'Margin (%)']
    const dataRows = rows.map((r: any) => [
      r.name, r.code, r.category, r.quantitySold,
      r.revenue, r.purchaseCost, r.profit, Number(r.margin.toFixed(2)),
    ])
    const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows])
    ws['!cols'] = [25, 12, 15, 12, 15, 15, 15, 12].map(w => ({ wch: w }))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Profit')
    XLSX.writeFile(wb, `laporan-profit-${data.filters.dateFrom ?? 'semua'}-${data.filters.dateTo ?? ''}.xlsx`)
  }
</script>

<svelte:head><title>Laporan Profit — PharmaPOS</title></svelte:head>

<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
  <div class="bg-white rounded-xl border border-gray-200 p-4">
    <p class="text-xs text-gray-500">Total Pendapatan</p>
    <p class="text-xl font-bold text-sky-600 mt-1">{rp(summary.totalRevenue ?? 0)}</p>
  </div>
  <div class="bg-white rounded-xl border border-gray-200 p-4">
    <p class="text-xs text-gray-500">Total HPP</p>
    <p class="text-xl font-bold text-gray-900 mt-1">{rp(summary.totalPurchaseCost ?? 0)}</p>
  </div>
  <div class="bg-white rounded-xl border border-gray-200 p-4">
    <p class="text-xs text-gray-500">Total Profit</p>
    <p class="text-xl font-bold mt-1 {(summary.totalProfit ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}">{rp(summary.totalProfit ?? 0)}</p>
  </div>
  <div class="bg-white rounded-xl border border-gray-200 p-4">
    <p class="text-xs text-gray-500">Margin</p>
    <p class="text-xl font-bold text-gray-900 mt-1">{pct(summary.margin ?? 0)}</p>
  </div>
</div>

<form method="get" class="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-end no-print">
  <div class="flex flex-col gap-1">
    <label class="text-xs text-gray-500">Dari</label>
    <input type="date" name="dateFrom" value={data.filters.dateFrom} class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
  </div>
  <div class="flex flex-col gap-1">
    <label class="text-xs text-gray-500">Sampai</label>
    <input type="date" name="dateTo" value={data.filters.dateTo} class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
  </div>
  <div class="flex flex-col gap-1">
    <label class="text-xs text-gray-500">Kategori</label>
    <select name="categoryId" class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
      <option value="">Semua</option>
      {#each data.categories as c}
        <option value={c.id} selected={data.filters.categoryId === c.id}>{c.name}</option>
      {/each}
    </select>
  </div>
  <button type="submit" class="bg-sky-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-sky-700">Terapkan</button>
  <button type="button" on:click={exportExcel} class="border border-emerald-500 text-emerald-700 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-50 no-print">Export Excel</button>
  <button type="button" on:click={() => window.print()} class="border border-gray-300 text-gray-700 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-50 no-print">Cetak PDF</button>
</form>

<div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
  <div class="overflow-x-auto">
    <table class="w-full text-sm">
      <thead class="bg-gray-50 border-b border-gray-200">
        <tr>
          <th class="text-left px-4 py-3 text-xs font-semibold text-gray-600">Produk</th>
          <th class="text-left px-4 py-3 text-xs font-semibold text-gray-600">Kode</th>
          <th class="text-left px-4 py-3 text-xs font-semibold text-gray-600">Kategori</th>
          <th class="text-right px-4 py-3 text-xs font-semibold text-gray-600">Qty</th>
          <th class="text-right px-4 py-3 text-xs font-semibold text-gray-600">Pendapatan</th>
          <th class="text-right px-4 py-3 text-xs font-semibold text-gray-600">HPP</th>
          <th class="text-right px-4 py-3 text-xs font-semibold text-gray-600">Profit</th>
          <th class="text-right px-4 py-3 text-xs font-semibold text-gray-600">Margin</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        {#each rows as r}
          <tr class="hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-900">{r.name}</td>
            <td class="px-4 py-3 font-mono text-xs text-gray-500">{r.code}</td>
            <td class="px-4 py-3 text-gray-600">{r.category}</td>
            <td class="px-4 py-3 text-right text-gray-700">{r.quantitySold}</td>
            <td class="px-4 py-3 text-right text-gray-700">{rp(r.revenue)}</td>
            <td class="px-4 py-3 text-right text-gray-600">{rp(r.purchaseCost)}</td>
            <td class="px-4 py-3 text-right font-semibold {r.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}">{rp(r.profit)}</td>
            <td class="px-4 py-3 text-right text-gray-600">{pct(r.margin)}</td>
          </tr>
        {:else}
          <tr><td colspan="8" class="px-4 py-10 text-center text-gray-400">Tidak ada data untuk filter ini</td></tr>
        {/each}
      </tbody>
    </table>
  </div>
  {#if meta.totalPages > 1}
    <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <p class="text-xs text-gray-500">Total {meta.total} produk</p>
      <div class="flex gap-1">
        {#each Array.from({ length: meta.totalPages }, (_, i) => i + 1) as p}
          <a href={buildUrl({ page: String(p) })}
             class="w-7 h-7 flex items-center justify-center rounded text-xs {p === meta.page ? 'bg-sky-600 text-white' : 'text-gray-600 hover:bg-gray-100'}">{p}</a>
        {/each}
      </div>
    </div>
  {/if}
</div>
