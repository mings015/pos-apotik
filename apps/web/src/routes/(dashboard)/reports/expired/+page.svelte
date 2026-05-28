<script lang="ts">
  import type { PageData } from './$types'
  export let data: PageData

  $: report = data.report as any
  $: rows = report.data ?? []
  $: meta = report.meta ?? {}

  function fmtDate(d: string | Date) {
    return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  function buildUrl(extra: Record<string, string>) {
    const f = data.filters as any
    return `/reports/expired?${new URLSearchParams({ ...f, ...extra })}`
  }

  async function exportExcel() {
    const XLSX = await import('xlsx')
    const headers = ['Produk', 'Kode', 'Kategori', 'Batch', 'Tgl Expired', 'Qty', 'Status', 'Sisa Hari']
    const dataRows = rows.map((r: any) => [
      r.productName, r.code, r.category, r.batchNumber,
      fmtDate(r.expiredDate), r.quantity,
      r.status === 'expired' ? 'Sudah Expired' : 'Hampir Expired',
      r.daysUntilExpiry,
    ])
    const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows])
    ws['!cols'] = [25, 12, 15, 15, 14, 8, 15, 10].map(w => ({ wch: w }))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Expired')
    XLSX.writeFile(wb, `laporan-expired-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }
</script>

<svelte:head><title>Laporan Expired — PharmaPOS</title></svelte:head>

<form method="get" class="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-end no-print">
  <div class="flex flex-col gap-1">
    <label class="text-xs text-gray-500">Status</label>
    <select name="status" class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
      <option value="">Semua (expired + hampir)</option>
      <option value="expired" selected={data.filters.status === 'expired'}>Sudah Expired</option>
      <option value="near_expired" selected={data.filters.status === 'near_expired'}>Hampir Expired (≤30 hari)</option>
    </select>
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
  <div class="flex flex-col gap-1">
    <label class="text-xs text-gray-500">Supplier</label>
    <select name="supplierId" class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
      <option value="">Semua</option>
      {#each data.suppliers as s}
        <option value={s.id} selected={data.filters.supplierId === s.id}>{s.name}</option>
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
          <th class="text-left px-4 py-3 text-xs font-semibold text-gray-600">Batch</th>
          <th class="text-left px-4 py-3 text-xs font-semibold text-gray-600">Expired</th>
          <th class="text-right px-4 py-3 text-xs font-semibold text-gray-600">Qty</th>
          <th class="text-center px-4 py-3 text-xs font-semibold text-gray-600">Status</th>
          <th class="text-right px-4 py-3 text-xs font-semibold text-gray-600">Hari</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        {#each rows as r}
          <tr class="hover:bg-gray-50 {r.status === 'expired' ? 'bg-red-50/30' : ''}">
            <td class="px-4 py-3 font-medium text-gray-900">{r.productName}</td>
            <td class="px-4 py-3 font-mono text-xs text-gray-500">{r.code}</td>
            <td class="px-4 py-3 text-gray-600">{r.category}</td>
            <td class="px-4 py-3 font-mono text-xs text-gray-700">{r.batchNumber}</td>
            <td class="px-4 py-3 text-gray-700">{fmtDate(r.expiredDate)}</td>
            <td class="px-4 py-3 text-right text-gray-900 font-semibold">{r.quantity}</td>
            <td class="px-4 py-3 text-center">
              {#if r.status === 'expired'}
                <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">Expired</span>
              {:else}
                <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">Hampir Expired</span>
              {/if}
            </td>
            <td class="px-4 py-3 text-right {r.daysUntilExpiry < 0 ? 'text-red-600 font-semibold' : 'text-amber-600'}">
              {r.daysUntilExpiry < 0 ? Math.abs(r.daysUntilExpiry) + ' hari lalu' : r.daysUntilExpiry + ' hari'}
            </td>
          </tr>
        {:else}
          <tr><td colspan="8" class="px-4 py-10 text-center text-gray-400">Tidak ada data expired/hampir expired</td></tr>
        {/each}
      </tbody>
    </table>
  </div>
  {#if meta.totalPages > 1}
    <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <p class="text-xs text-gray-500">Total {meta.total} batch</p>
      <div class="flex gap-1">
        {#each Array.from({ length: meta.totalPages }, (_, i) => i + 1) as p}
          <a href={buildUrl({ page: String(p) })}
             class="w-7 h-7 flex items-center justify-center rounded text-xs {p === meta.page ? 'bg-sky-600 text-white' : 'text-gray-600 hover:bg-gray-100'}">{p}</a>
        {/each}
      </div>
    </div>
  {/if}
</div>
