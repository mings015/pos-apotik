<script lang="ts">
  import { currentUser } from '$lib/stores/auth'
  import type { PageData } from './$types'

  export let data: PageData

  $: stats = data.stats as any
  $: role = (data as any).role as string

  function rp(n: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
  }

  function shortRp(n: number) {
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}M`
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}Jt`
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}Rb`
    return String(n)
  }

  // ── SVG line chart ──────────────────────────────────────────────────────────
  const W = 560, H = 180
  const PAD = { top: 16, right: 16, bottom: 32, left: 60 }
  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top - PAD.bottom

  $: trend = (stats?.salesTrend ?? []) as Array<{ date: string; revenue: number; transactions: number }>
  $: maxRev = Math.max(...trend.map((d: any) => d.revenue), 1)
  $: pts = trend.map((d: any, i: number) => ({
    x: PAD.left + (trend.length > 1 ? (i / (trend.length - 1)) * chartW : chartW / 2),
    y: PAD.top + chartH - (d.revenue / maxRev) * chartH,
    ...d,
  }))
  $: polyline = pts.map((p: any) => `${p.x},${p.y}`).join(' ')
  $: areaPoints = pts.length
    ? `${pts[0].x},${PAD.top + chartH} ${polyline} ${pts[pts.length - 1].x},${PAD.top + chartH}`
    : ''

  $: topProducts = (stats?.topProducts ?? []) as Array<{ name: string; quantitySold: number; revenue: number }>
  $: maxQty = Math.max(...topProducts.map((p: any) => p.quantitySold), 1)

  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
</script>

<svelte:head>
  <title>Dashboard — PharmaPOS</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-start justify-between">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p class="text-sm text-gray-500 mt-0.5">{today}</p>
    </div>
    <div class="text-right hidden sm:block">
      <p class="text-sm font-medium text-gray-700">{$currentUser?.name ?? ''}</p>
      <span class="inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-700">{$currentUser?.role?.name ?? ''}</span>
    </div>
  </div>

  {#if stats && (role === 'SUPER_ADMIN' || role === 'ADMIN')}
    <!-- ── Admin / Super Admin Dashboard ──────────────────────────────────────── -->

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-gradient-to-br from-sky-500 to-sky-600 rounded-2xl p-5 text-white shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <p class="text-sky-100 text-xs font-medium">Penjualan Hari Ini</p>
          <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
          </div>
        </div>
        <p class="text-2xl font-bold">{shortRp(stats.todaySales)}</p>
        <p class="text-sky-200 text-xs mt-1">{stats.todayTransactions} transaksi</p>
      </div>

      <div class="bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl p-5 text-white shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <p class="text-violet-100 text-xs font-medium">Penjualan Bulan Ini</p>
          <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
          </div>
        </div>
        <p class="text-2xl font-bold">{shortRp(stats.monthSales)}</p>
        <p class="text-violet-200 text-xs mt-1">{stats.monthTransactions} transaksi</p>
      </div>

      <div class="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <p class="text-emerald-100 text-xs font-medium">Profit Bulan Ini</p>
          <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
          </div>
        </div>
        <p class="text-2xl font-bold {stats.monthProfit < 0 ? 'text-red-200' : ''}">{shortRp(stats.monthProfit)}</p>
        <p class="text-emerald-200 text-xs mt-1">Estimasi HPP produk</p>
      </div>

      <div class="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <p class="text-gray-500 text-xs font-medium">Stok & Produk</p>
          <div class="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
            <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          </div>
        </div>
        <p class="text-2xl font-bold text-gray-900">{stats.activeProducts}</p>
        <p class="text-xs mt-1 {stats.lowStockProducts > 0 ? 'text-amber-600 font-medium' : 'text-gray-400'}">{stats.lowStockProducts} stok menipis</p>
      </div>
    </div>

    <!-- Alerts -->
    {#if stats.expiredProducts > 0 || stats.nearExpiredProducts > 0 || stats.lowStockProducts > 0}
      <div class="flex gap-2 flex-wrap">
        {#if stats.expiredProducts > 0}
          <a href="/expired?status=expired" class="inline-flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-xl px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors">
            <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
            {stats.expiredProducts} batch expired
          </a>
        {/if}
        {#if stats.nearExpiredProducts > 0}
          <a href="/expired?status=near_expired" class="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 transition-colors">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            {stats.nearExpiredProducts} hampir expired (≤30 hari)
          </a>
        {/if}
        {#if stats.lowStockProducts > 0}
          <a href="/inventory" class="inline-flex items-center gap-1.5 bg-sky-50 border border-sky-200 rounded-xl px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-100 transition-colors">
            <span class="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
            {stats.lowStockProducts} stok menipis
          </a>
        {/if}
      </div>
    {/if}

    <!-- Chart + Top Products -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <!-- Sales Trend Chart -->
      <div class="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-sm font-semibold text-gray-800">Tren Penjualan 7 Hari Terakhir</h2>
          {#if trend.length > 0}
            <span class="text-xs text-gray-400">Total: {shortRp(trend.reduce((s: number, d: any) => s + d.revenue, 0))}</span>
          {/if}
        </div>
        {#if trend.length === 0}
          <div class="flex flex-col items-center justify-center h-36 text-gray-300">
            <svg class="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            <p class="text-sm">Belum ada data penjualan</p>
          </div>
        {:else}
          <svg viewBox="0 0 {W} {H}" class="w-full" style="height:180px">
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#6366f1" stop-opacity="0.2" />
                <stop offset="100%" stop-color="#6366f1" stop-opacity="0" />
              </linearGradient>
            </defs>
            {#each [0, 0.25, 0.5, 0.75, 1] as t}
              {@const y = PAD.top + chartH * (1 - t)}
              <line x1={PAD.left} y1={y} x2={PAD.left + chartW} y2={y} stroke="#f1f5f9" stroke-width="1" />
              <text x={PAD.left - 6} y={y + 4} text-anchor="end" font-size="9" fill="#94a3b8">{shortRp(maxRev * t)}</text>
            {/each}
            {#if areaPoints}
              <polygon points={areaPoints} fill="url(#areaGrad)" />
            {/if}
            {#if pts.length > 1}
              <polyline points={polyline} fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
            {/if}
            {#each pts as p}
              <circle cx={p.x} cy={p.y} r="4" fill="white" stroke="#6366f1" stroke-width="2.5" />
              <text x={p.x} y={H - 2} text-anchor="middle" font-size="9" fill="#94a3b8">{String(p.date).slice(5)}</text>
            {/each}
          </svg>
        {/if}
      </div>

      <!-- Top Products -->
      <div class="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <h2 class="text-sm font-semibold text-gray-800 mb-4">Produk Terlaris Bulan Ini</h2>
        {#if topProducts.length === 0}
          <div class="flex flex-col items-center justify-center h-32 text-gray-300">
            <svg class="w-8 h-8 mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
            <p class="text-xs">Belum ada data</p>
          </div>
        {:else}
          <div class="space-y-3">
            {#each topProducts as p, i}
              <div>
                <div class="flex justify-between text-xs mb-1">
                  <span class="text-gray-700 font-medium truncate pr-2 flex items-center gap-1">
                    <span class="shrink-0 w-4 h-4 rounded-full bg-violet-100 text-violet-600 text-[10px] flex items-center justify-center font-bold">{i + 1}</span>
                    {p.name}
                  </span>
                  <span class="text-gray-400 shrink-0">{p.quantitySold}</span>
                </div>
                <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div class="h-full bg-violet-400 rounded-full transition-all" style="width: {(p.quantitySold / maxQty) * 100}%"></div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <!-- Payment Methods -->
    {#if stats.paymentBreakdown?.length > 0}
      <div class="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <h2 class="text-sm font-semibold text-gray-800 mb-4">Metode Pembayaran Bulan Ini</h2>
        <div class="flex gap-8 flex-wrap">
          {#each stats.paymentBreakdown as pb}
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
                {#if pb.method === 'CASH'}
                  <svg class="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                {:else}
                  <svg class="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
                {/if}
              </div>
              <div>
                <p class="text-base font-bold text-gray-900">{shortRp(Number(pb.total))}</p>
                <p class="text-xs text-gray-400">{pb.method === 'CASH' ? 'Tunai' : 'Transfer'} · {pb.count}x</p>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

  {:else if stats && role === 'WAREHOUSE'}
    <!-- ── Warehouse Dashboard ─────────────────────────────────────────────────── -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div class="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center mb-3">
          <svg class="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
        </div>
        <p class="text-2xl font-bold text-gray-900">{stats.activeProducts}</p>
        <p class="text-xs text-gray-500 mt-0.5">Produk Aktif</p>
      </div>

      <div class="rounded-2xl p-5 shadow-sm {stats.lowStockProducts > 0 ? 'bg-amber-50 border border-amber-200' : 'bg-white border border-gray-200'}">
        <div class="w-9 h-9 rounded-xl {stats.lowStockProducts > 0 ? 'bg-amber-100' : 'bg-gray-100'} flex items-center justify-center mb-3">
          <svg class="w-5 h-5 {stats.lowStockProducts > 0 ? 'text-amber-600' : 'text-gray-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>
        </div>
        <p class="text-2xl font-bold {stats.lowStockProducts > 0 ? 'text-amber-700' : 'text-gray-900'}">{stats.lowStockProducts}</p>
        <p class="text-xs {stats.lowStockProducts > 0 ? 'text-amber-600' : 'text-gray-500'} mt-0.5">Stok Menipis</p>
      </div>

      <div class="rounded-2xl p-5 shadow-sm {stats.expiredProducts > 0 ? 'bg-red-50 border border-red-200' : 'bg-white border border-gray-200'}">
        <div class="w-9 h-9 rounded-xl {stats.expiredProducts > 0 ? 'bg-red-100' : 'bg-gray-100'} flex items-center justify-center mb-3">
          <svg class="w-5 h-5 {stats.expiredProducts > 0 ? 'text-red-600' : 'text-gray-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </div>
        <p class="text-2xl font-bold {stats.expiredProducts > 0 ? 'text-red-700' : 'text-gray-900'}">{stats.expiredProducts}</p>
        <p class="text-xs {stats.expiredProducts > 0 ? 'text-red-600' : 'text-gray-500'} mt-0.5">Batch Expired</p>
      </div>

      <div class="rounded-2xl p-5 shadow-sm {stats.nearExpiredProducts > 0 ? 'bg-orange-50 border border-orange-200' : 'bg-white border border-gray-200'}">
        <div class="w-9 h-9 rounded-xl {stats.nearExpiredProducts > 0 ? 'bg-orange-100' : 'bg-gray-100'} flex items-center justify-center mb-3">
          <svg class="w-5 h-5 {stats.nearExpiredProducts > 0 ? 'text-orange-600' : 'text-gray-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <p class="text-2xl font-bold {stats.nearExpiredProducts > 0 ? 'text-orange-700' : 'text-gray-900'}">{stats.nearExpiredProducts}</p>
        <p class="text-xs {stats.nearExpiredProducts > 0 ? 'text-orange-600' : 'text-gray-500'} mt-0.5">Hampir Expired (≤30hr)</p>
      </div>
    </div>

    {#if stats.expiredProducts > 0 || stats.nearExpiredProducts > 0 || stats.lowStockProducts > 0}
      <div class="flex gap-2 flex-wrap">
        {#if stats.expiredProducts > 0}
          <a href="/expired?status=expired" class="inline-flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-xl px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors">
            <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
            Lihat {stats.expiredProducts} batch expired →
          </a>
        {/if}
        {#if stats.nearExpiredProducts > 0}
          <a href="/expired?status=near_expired" class="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 transition-colors">
            Lihat {stats.nearExpiredProducts} hampir expired →
          </a>
        {/if}
        {#if stats.lowStockProducts > 0}
          <a href="/inventory" class="inline-flex items-center gap-1.5 bg-sky-50 border border-sky-200 rounded-xl px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-100 transition-colors">
            Lihat {stats.lowStockProducts} stok menipis →
          </a>
        {/if}
      </div>
    {/if}

    <!-- Quick access + top products -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {#each [
        { href: '/purchases', label: 'Pembelian', color: 'sky', icon: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0' },
        { href: '/inventory', label: 'Stok', color: 'emerald', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
        { href: '/expired', label: 'Expired', color: 'red', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
        { href: '/batches', label: 'Batch', color: 'violet', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
      ] as item}
        <a href={item.href} class="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all text-center group">
          <div class="w-10 h-10 rounded-xl bg-{item.color}-100 flex items-center justify-center mx-auto mb-2 group-hover:bg-{item.color}-200 transition-colors">
            <svg class="w-5 h-5 text-{item.color}-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d={item.icon}/></svg>
          </div>
          <p class="text-sm font-semibold text-gray-800">{item.label}</p>
        </a>
      {/each}
    </div>

    {#if topProducts.length > 0}
      <div class="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <h2 class="text-sm font-semibold text-gray-800 mb-4">Produk Terlaris Bulan Ini <span class="text-gray-400 font-normal">(referensi restok)</span></h2>
        <div class="space-y-3">
          {#each topProducts as p, i}
            <div class="flex items-center gap-3">
              <span class="shrink-0 w-6 h-6 rounded-full bg-violet-100 text-violet-600 text-[11px] flex items-center justify-center font-bold">{i + 1}</span>
              <div class="flex-1 min-w-0">
                <div class="flex justify-between text-xs mb-1">
                  <span class="text-gray-700 font-medium truncate">{p.name}</span>
                  <span class="text-gray-400 shrink-0 ml-2">{p.quantitySold} terjual</span>
                </div>
                <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div class="h-full bg-violet-400 rounded-full" style="width: {(p.quantitySold / maxQty) * 100}%"></div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

  {:else}
    <!-- ── Cashier Dashboard ───────────────────────────────────────────────────── -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <a href="/sales" class="group bg-gradient-to-br from-sky-500 to-sky-600 rounded-2xl p-6 text-white hover:shadow-lg hover:-translate-y-0.5 transition-all">
        <div class="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
        </div>
        <p class="text-lg font-bold">Kasir POS</p>
        <p class="text-sky-200 text-sm mt-0.5">Buat transaksi penjualan</p>
        <div class="mt-4 flex items-center gap-1 text-sky-200 text-xs">
          <span>Mulai kasir</span>
          <svg class="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        </div>
      </a>

      <a href="/products" class="group bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all">
        <div class="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4 group-hover:bg-emerald-200 transition-colors">
          <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
        </div>
        <p class="text-lg font-bold text-gray-900">Daftar Produk</p>
        <p class="text-gray-500 text-sm mt-0.5">Lihat informasi produk</p>
        <div class="mt-4 flex items-center gap-1 text-gray-400 text-xs">
          <span>Lihat produk</span>
          <svg class="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        </div>
      </a>
    </div>

    <!-- Account Info -->
    <div class="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <h2 class="text-sm font-semibold text-gray-800 mb-3">Informasi Akun</h2>
      <div class="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p class="text-xs text-gray-400 mb-0.5">Nama</p>
          <p class="font-semibold text-gray-900">{$currentUser?.name ?? '-'}</p>
        </div>
        <div>
          <p class="text-xs text-gray-400 mb-0.5">Email</p>
          <p class="font-semibold text-gray-900 truncate">{$currentUser?.email ?? '-'}</p>
        </div>
        <div>
          <p class="text-xs text-gray-400 mb-0.5">Role</p>
          <span class="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-700">{$currentUser?.role?.name ?? '-'}</span>
        </div>
      </div>
    </div>
  {/if}
</div>
