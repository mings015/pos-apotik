<script lang="ts">
  import { page } from '$app/stores'
  import type { LayoutData } from './$types'

  export let data: LayoutData

  $: storeName = (data as any).storeName ?? 'PharmaPOS'

  const tabs = [
    { href: '/reports/sales', label: 'Penjualan' },
    { href: '/reports/profit', label: 'Profit' },
    { href: '/reports/stocks', label: 'Stok' },
    { href: '/reports/expired', label: 'Expired' },
    { href: '/reports/cashiers', label: 'Kasir' },
  ]

  const tabLabel: Record<string, string> = {
    '/reports/sales': 'Laporan Penjualan',
    '/reports/profit': 'Laporan Profit',
    '/reports/stocks': 'Laporan Stok',
    '/reports/expired': 'Laporan Expired',
    '/reports/cashiers': 'Laporan Kasir',
  }

  $: activeLabel = Object.entries(tabLabel).find(([k]) => $page.url.pathname.startsWith(k))?.[1] ?? 'Laporan'
  $: printDate = new Date().toLocaleString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
</script>

<style>
  @media print {
    :global(aside), :global(nav), :global(header), :global(.no-print) { display: none !important; }
    :global(main) { padding: 0 !important; margin: 0 !important; }
    .print-header { display: block !important; }
    :global(.report-nav) { display: none !important; }
  }
</style>

<!-- Print-only header (company branding) -->
<div class="print-header hidden border-b-2 border-gray-800 mb-4 pb-3">
  <div class="flex justify-between items-start">
    <div>
      <h1 class="text-xl font-bold text-gray-900">{storeName}</h1>
      <p class="text-sm text-gray-600 mt-0.5">{activeLabel}</p>
    </div>
    <div class="text-right text-xs text-gray-500">
      <p>Dicetak: {printDate}</p>
    </div>
  </div>
</div>

<div class="space-y-5 no-print-wrapper">
  <div class="no-print">
    <h1 class="text-2xl font-bold text-gray-900">Laporan</h1>
    <p class="text-gray-500 mt-1 text-sm">Laporan dan analitik bisnis</p>
  </div>

  <nav class="report-nav flex gap-1 border-b border-gray-200 overflow-x-auto no-print">
    {#each tabs as tab}
      <a
        href={tab.href}
        class="px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors {$page.url.pathname.startsWith(tab.href)
          ? 'border-sky-600 text-sky-600'
          : 'border-transparent text-gray-500 hover:text-gray-700'}"
      >
        {tab.label}
      </a>
    {/each}
  </nav>

  <slot />
</div>
