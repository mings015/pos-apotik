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

  function buildUrl(extra: Record<string, string>) {
    const f = data.filters as any
    return `/reports/stocks?${new URLSearchParams({ ...f, ...extra })}`
  }

  const statusLabel: Record<string, string> = { normal: 'Normal', low: 'Menipis', out: 'Habis' }
  const statusClass: Record<string, string> = {
    normal: 'bg-emerald-50 text-emerald-700',
    low: 'bg-amber-50 text-amber-700',
    out: 'bg-red-50 text-red-700',
  }

  async function exportExcel() {
    const XLSX = await import('xlsx')
    const headers = ['Produk', 'Kode', 'Kategori', 'Stok', 'Min. Stok', 'Status', 'HPP', 'Nilai Stok']
    const dataRows = rows.map((r: any) => [
      r.name, r.code, r.category, r.stock, r.minimumStock,
      statusLabel[r.status] ?? r.status, r.purchasePrice, r.stockValue,
    ])
    const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows])
    ws['!cols'] = [25, 12, 15, 10, 10, 10, 15, 15].map(w => ({ wch: w }))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Stok')
    XLSX.writeFile(wb, `laporan-stok-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }
</script>

<svelte:head><title>Laporan Stok — PharmaPOS</title></svelte:head>

<div class="grid grid-cols-3 gap-4 mb-6">
  <div class="bg-white rounded-xl border border-gray-200 p-4">
    <p class="text-xs text-gray-500">Total Nilai Stok</p>
    <p class="text-xl font-bold text-sky-600 mt-1">{rp(summary.totalValue ?? 0)}</p>
  </div>
  <div class="bg-white rounded-xl border border-gray-200 p-4">
    <p class="text-xs text-gray-500">Stok Menipis</p>
    <p class="text-xl font-bold text-amber-600 mt-1">{summary.lowStock ?? 0} produk</p>
  </div>
  <div class="bg-white rounded-xl border border-gray-200 p-4">
    <p class="text-xs text-gray-500">Stok Habis</p>
    <p class="text-xl font-bold text-red-600 mt-1">{summary.outOfStock ?? 0} produk</p>
  </div>
</div>

<form method="get" class="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-end no-print">
  <div class="flex flex-col gap-1">
    <label class="text-xs text-gray-500">Kategori</label>
    <select name="categoryId" class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
      <option value="">Semua</option>
      {#each data.categories as c}
        <option value={c.id} selected={data.filters.categoryId === c.id}>{c.name}</option>
      {/each}
    </select>
  </div>
  <div class="flex flex-col gap-1">
    <label class="text-xs text-gray-500">Supplier</label>
    <select name="supplierId" class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
      <option value="">Semua</option>
      {#each data.suppliers as s}
        <option value={s.id} selected={data.filters.supplierId === s.id}>{s.name}</option>
      {/each}
    </select>
  </div>
  <div class="flex flex-col gap-1">
    <label class="text-xs text-gray-500">Status Stok</label>
    <select name="stockStatus" class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
      <option value="">Semua</option>
      <option value="normal" selected={data.filters.stockStatus === 'normal'}>Normal</option>
      <option value="low" selected={data.filters.stockStatus === 'low'}>Menipis</option>
      <option value="out" selected={data.filters.stockStatus === 'out'}>Habis</option>
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
          <th class="text-right px-4 py-3 text-xs font-semibold text-gray-600">Stok</th>
          <th class="text-right px-4 py-3 text-xs font-semibold text-gray-600">Min.</th>
          <th class="text-center px-4 py-3 text-xs font-semibold text-gray-600">Status</th>
          <th class="text-right px-4 py-3 text-xs font-semibold text-gray-600">HPP</th>
          <th class="text-right px-4 py-3 text-xs font-semibold text-gray-600">Nilai Stok</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        {#each rows as r}
          <tr class="hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-900">{r.name}</td>
            <td class="px-4 py-3 font-mono text-xs text-gray-500">{r.code}</td>
            <td class="px-4 py-3 text-gray-600">{r.category}</td>
            <td class="px-4 py-3 text-right font-semibold text-gray-900">{r.stock}</td>
            <td class="px-4 py-3 text-right text-gray-500">{r.minimumStock}</td>
            <td class="px-4 py-3 text-center">
              <span class="px-2 py-0.5 rounded-full text-xs font-medium {statusClass[r.status] ?? ''}">{statusLabel[r.status] ?? r.status}</span>
            </td>
            <td class="px-4 py-3 text-right text-gray-600">{rp(r.purchasePrice)}</td>
            <td class="px-4 py-3 text-right font-semibold text-gray-900">{rp(r.stockValue)}</td>
          </tr>
        {:else}
          <tr><td colspan="8" class="px-4 py-10 text-center text-gray-400">Tidak ada data</td></tr>
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
