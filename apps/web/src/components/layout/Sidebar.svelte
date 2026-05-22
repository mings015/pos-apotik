<script lang="ts">
  import { page } from '$app/stores'
  import { currentUser } from '$lib/stores/auth'

  export let collapsed = false

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: 'grid' },
    { href: '/products', label: 'Produk', icon: 'package', roles: ['SUPER_ADMIN', 'ADMIN'] },
    { href: '/inventory', label: 'Inventori', icon: 'archive', roles: ['SUPER_ADMIN', 'ADMIN', 'WAREHOUSE'] },
    { href: '/sales', label: 'Penjualan', icon: 'shopping-cart', roles: ['SUPER_ADMIN', 'ADMIN', 'CASHIER'] },
    { href: '/purchases', label: 'Pembelian', icon: 'truck', roles: ['SUPER_ADMIN', 'ADMIN', 'WAREHOUSE'] },
    { href: '/reports', label: 'Laporan', icon: 'bar-chart', roles: ['SUPER_ADMIN', 'ADMIN'] },
    { href: '/settings', label: 'Pengaturan', icon: 'settings', roles: ['SUPER_ADMIN'] },
  ]

  $: userRole = $currentUser?.role?.name
  $: filteredMenu = menuItems.filter(
    (item) => !item.roles || (userRole && item.roles.includes(userRole)),
  )

  const icons: Record<string, string> = {
    grid: 'M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z',
    package: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    archive: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
    'shopping-cart': 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
    truck: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0',
    'bar-chart': 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  }
</script>

<aside
  class="flex flex-col bg-white border-r border-gray-200 transition-all duration-200 {collapsed ? 'w-16' : 'w-60'}"
>
  <!-- Logo -->
  <div class="flex items-center gap-3 px-4 h-16 border-b border-gray-200 shrink-0">
    <div class="flex items-center justify-center w-8 h-8 bg-primary-600 rounded-lg shrink-0">
      <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    </div>
    {#if !collapsed}
      <span class="font-bold text-gray-900 text-sm">PharmaPOS</span>
    {/if}
  </div>

  <!-- Nav -->
  <nav class="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
    {#each filteredMenu as item}
      {@const active = $page.url.pathname.startsWith(item.href)}
      <a
        href={item.href}
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors {active
          ? 'bg-primary-50 text-primary-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}"
        title={collapsed ? item.label : undefined}
      >
        <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d={icons[item.icon]} />
        </svg>
        {#if !collapsed}
          <span>{item.label}</span>
        {/if}
      </a>
    {/each}
  </nav>
</aside>
