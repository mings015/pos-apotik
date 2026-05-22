<script lang="ts">
  import { enhance } from '$app/forms'
  import { invalidateAll } from '$app/navigation'
  import PageHeader from '$components/ui/PageHeader.svelte'
  import EmptyState from '$components/ui/EmptyState.svelte'
  import Pagination from '$components/ui/Pagination.svelte'
  import ConfirmDialog from '$components/ui/ConfirmDialog.svelte'
  import { toast } from '$stores/toast'
  import type { PageData, ActionData } from './$types'
  import type { UnitDto } from '@pharmapos/types'

  export let data: PageData
  export let form: ActionData

  let showForm = false
  let editItem: UnitDto | null = null
  let deleteId = ''
  let showConfirm = false
  let formLoading = false
  let deleteLoading = false

  $: if (form?.success) { toast.success(form.message ?? 'Berhasil'); showForm = false; editItem = null }
  $: if (form?.error) toast.error(form.error)

  function openCreate() { editItem = null; showForm = true }
  function openEdit(item: UnitDto) { editItem = item; showForm = true }
</script>

<svelte:head><title>Satuan — PharmaPOS</title></svelte:head>

<div class="space-y-6">
  <PageHeader title="Satuan" description="Kelola satuan produk (Tablet, Strip, Botol, dll)">
    <button on:click={openCreate}
      class="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      Tambah Satuan
    </button>
  </PageHeader>

  <div class="bg-white rounded-xl border border-gray-200 overflow-x-auto">
    <table class="w-full text-sm">
      <thead class="bg-gray-50 border-b border-gray-200">
        <tr>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Nama</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Simbol</th>
          <th class="px-4 py-3 text-right font-medium text-gray-600">Aksi</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        {#each data.units.data as item}
          <tr class="hover:bg-gray-50 transition">
            <td class="px-4 py-3 font-medium text-gray-900">{item.name}</td>
            <td class="px-4 py-3 text-gray-500">{item.symbol}</td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-2">
                <button on:click={() => openEdit(item)}
                  class="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition">Edit</button>
                <button on:click={() => { deleteId = item.id; showConfirm = true }}
                  class="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition">Hapus</button>
              </div>
            </td>
          </tr>
        {:else}
          <tr><td colspan="3"><EmptyState message="Belum ada satuan" /></td></tr>
        {/each}
      </tbody>
    </table>
  </div>

  {#if data.units.totalPages > 1}
    <Pagination page={data.units.page} totalPages={data.units.totalPages} total={data.units.total} limit={data.units.limit}
      on:change={(e) => { window.location.href = `?page=${e.detail}` }} />
  {/if}
</div>

{#if showForm}
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <button class="absolute inset-0 bg-black/40" on:click={() => showForm = false} aria-label="Tutup"></button>
    <div class="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
      <h3 class="text-base font-semibold text-gray-900 mb-4">{editItem ? 'Edit Satuan' : 'Tambah Satuan'}</h3>
      <form method="POST" action={editItem ? '?/update' : '?/create'}
        use:enhance={() => { formLoading = true; return async ({ update }) => { await update(); formLoading = false } }}>
        {#if editItem}<input type="hidden" name="id" value={editItem.id} />{/if}
        <div class="space-y-4">
          <div>
            <label for="unit-name" class="block text-sm font-medium text-gray-700 mb-1">Nama <span class="text-red-500">*</span></label>
            <input id="unit-name" name="name" value={editItem?.name ?? ''} required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label for="unit-symbol" class="block text-sm font-medium text-gray-700 mb-1">Simbol <span class="text-red-500">*</span></label>
            <input id="unit-symbol" name="symbol" value={editItem?.symbol ?? ''} required placeholder="Contoh: tab, strip, btl"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>
        <div class="flex gap-3 mt-6 justify-end">
          <button type="button" on:click={() => showForm = false}
            class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition">Batal</button>
          <button type="submit" disabled={formLoading}
            class="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 rounded-lg transition">
            {formLoading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<ConfirmDialog bind:open={showConfirm} title="Hapus Satuan" message="Apakah Anda yakin ingin menghapus satuan ini?"
  confirmLabel="Ya, Hapus" loading={deleteLoading}
  on:confirm={async () => {
    deleteLoading = true
    const fd = new FormData(); fd.set('id', deleteId)
    const res = await fetch('?/delete', { method: 'POST', body: fd })
    const result = await res.json()
    deleteLoading = false; showConfirm = false
    if (result.type === 'success') { toast.success('Satuan berhasil dihapus'); await invalidateAll() }
    else toast.error('Gagal menghapus satuan')
  }}
/>
