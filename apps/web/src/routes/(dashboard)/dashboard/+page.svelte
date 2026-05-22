<script lang="ts">
  import { currentUser } from '$lib/stores/auth'
</script>

<svelte:head>
  <title>Dashboard — PharmaPOS</title>
</svelte:head>

<div class="space-y-6">
  <!-- Page Header -->
  <div>
    <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
    <p class="text-gray-500 mt-1">Selamat datang, {$currentUser?.name ?? ''}!</p>
  </div>

  <!-- Stats Placeholder -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {#each [
      { label: 'Penjualan Hari Ini', value: 'Rp 0', icon: '💰', color: 'green' },
      { label: 'Transaksi', value: '0', icon: '🧾', color: 'blue' },
      { label: 'Produk Aktif', value: '0', icon: '📦', color: 'purple' },
      { label: 'Stok Menipis', value: '0', icon: '⚠️', color: 'orange' },
    ] as stat}
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">{stat.label}</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </div>
          <span class="text-3xl">{stat.icon}</span>
        </div>
      </div>
    {/each}
  </div>

  <!-- Role info -->
  <div class="bg-white rounded-xl border border-gray-200 p-5">
    <h2 class="text-sm font-semibold text-gray-700 mb-3">Informasi Akun</h2>
    <dl class="grid grid-cols-2 gap-3 text-sm">
      <div>
        <dt class="text-gray-500">Nama</dt>
        <dd class="font-medium text-gray-900">{$currentUser?.name ?? '-'}</dd>
      </div>
      <div>
        <dt class="text-gray-500">Email</dt>
        <dd class="font-medium text-gray-900">{$currentUser?.email ?? '-'}</dd>
      </div>
      <div>
        <dt class="text-gray-500">Role</dt>
        <dd class="font-medium text-gray-900">{$currentUser?.role?.name ?? '-'}</dd>
      </div>
    </dl>
  </div>
</div>
