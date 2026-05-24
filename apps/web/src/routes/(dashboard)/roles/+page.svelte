<script lang="ts">
  import PageHeader from '$components/ui/PageHeader.svelte'
  import EmptyState from '$components/ui/EmptyState.svelte'
  import type { PageData } from './$types'

  export let data: PageData

  const roleMeta: Record<string, { label: string; description: string; permissions: string[]; color: string; icon: string }> = {
    SUPER_ADMIN: {
      label: 'Super Admin',
      description: 'Akses penuh ke seluruh sistem tanpa batasan',
      permissions: ['Semua modul', 'Manajemen pengguna & role', 'Pengaturan sistem', 'Laporan lengkap'],
      color: 'purple',
      icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    },
    ADMIN: {
      label: 'Admin',
      description: 'Kelola operasional harian, produk, supplier, dan pengguna',
      permissions: ['Produk & kategori', 'Supplier & satuan', 'Pengguna', 'Laporan & inventory'],
      color: 'blue',
      icon: 'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    CASHIER: {
      label: 'Kasir',
      description: 'Proses transaksi penjualan dan kelola POS harian',
      permissions: ['Transaksi POS', 'Riwayat penjualan', 'Cetak struk', 'Lihat produk & stok'],
      color: 'green',
      icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
    },
    WAREHOUSE: {
      label: 'Gudang',
      description: 'Kelola stok, pembelian, dan pergerakan barang',
      permissions: ['Stock in & opname', 'Penyesuaian stok', 'Monitoring batch', 'Produk expired'],
      color: 'amber',
      icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
    },
  }

  const colorMap: Record<string, { badge: string; icon: string; perm: string }> = {
    purple: { badge: 'bg-purple-100 text-purple-700', icon: 'bg-purple-100 text-purple-600', perm: 'bg-purple-50 text-purple-700' },
    blue:   { badge: 'bg-blue-100 text-blue-700',     icon: 'bg-blue-100 text-blue-600',     perm: 'bg-blue-50 text-blue-700'   },
    green:  { badge: 'bg-green-100 text-green-700',   icon: 'bg-green-100 text-green-600',   perm: 'bg-green-50 text-green-700' },
    amber:  { badge: 'bg-amber-100 text-amber-700',   icon: 'bg-amber-100 text-amber-600',   perm: 'bg-amber-50 text-amber-700' },
  }
</script>

<svelte:head><title>Role — PharmaPOS</title></svelte:head>

<div class="space-y-6">
  <PageHeader title="Role & Akses" description="Daftar peran pengguna beserta hak akses dalam sistem" />

  {#if data.roles.length === 0}
    <EmptyState message="Belum ada role terdaftar" />
  {:else}
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {#each data.roles as role}
        {@const meta = roleMeta[role.name]}
        {@const colors = colorMap[meta?.color ?? 'blue']}
        <div class="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">

          <!-- Header -->
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 {colors.icon}">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d={meta?.icon ?? ''} />
              </svg>
            </div>
            <div class="min-w-0">
              <span class="inline-block text-xs font-semibold px-2 py-0.5 rounded-full {colors.badge}">
                {role.name}
              </span>
              <p class="mt-1 text-base font-bold text-gray-900">{meta?.label ?? role.name}</p>
            </div>
          </div>

          <!-- Description -->
          <p class="text-sm text-gray-500 leading-relaxed">{meta?.description ?? '—'}</p>

          <!-- Permissions -->
          {#if meta?.permissions?.length}
            <div class="flex flex-col gap-1.5 mt-auto">
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Hak Akses</p>
              <div class="flex flex-wrap gap-1.5">
                {#each meta.permissions as perm}
                  <span class="text-xs px-2 py-0.5 rounded-lg font-medium {colors.perm}">{perm}</span>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      {/each}
    </div>

    <!-- Info note -->
    <p class="text-xs text-gray-400 text-center">
      Role tidak dapat diubah — akses dikonfigurasi di level sistem.
    </p>
  {/if}
</div>
