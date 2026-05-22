<script lang="ts">
  import PageHeader from '$components/ui/PageHeader.svelte'
  import EmptyState from '$components/ui/EmptyState.svelte'
  import type { PageData } from './$types'

  export let data: PageData

  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Admin',
    CASHIER: 'Kasir',
    WAREHOUSE: 'Gudang',
  }

  const roleDescriptions: Record<string, string> = {
    SUPER_ADMIN: 'Akses penuh ke seluruh sistem',
    ADMIN: 'Kelola produk, supplier, dan pengguna',
    CASHIER: 'Proses transaksi penjualan',
    WAREHOUSE: 'Kelola stok dan pembelian',
  }
</script>

<svelte:head><title>Role — PharmaPOS</title></svelte:head>

<div class="space-y-6">
  <PageHeader title="Role" description="Daftar peran pengguna dalam sistem" />

  <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <table class="w-full text-sm">
      <thead class="bg-gray-50 border-b border-gray-200">
        <tr>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Nama Role</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Deskripsi</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        {#each data.roles as role}
          <tr class="hover:bg-gray-50 transition">
            <td class="px-4 py-3 font-medium text-gray-900">{roleLabels[role.name] ?? role.name}</td>
            <td class="px-4 py-3 text-gray-500">{roleDescriptions[role.name] ?? '—'}</td>
          </tr>
        {:else}
          <tr><td colspan="2"><EmptyState message="Belum ada role" /></td></tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
