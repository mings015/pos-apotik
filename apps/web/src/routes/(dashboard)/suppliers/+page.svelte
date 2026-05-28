<script lang="ts">
  import { enhance } from '$app/forms'
  import { invalidateAll } from '$app/navigation'
  import PageHeader from '$components/ui/PageHeader.svelte'
  import EmptyState from '$components/ui/EmptyState.svelte'
  import Pagination from '$components/ui/Pagination.svelte'
  import ConfirmDialog from '$components/ui/ConfirmDialog.svelte'
  import Badge from '$components/ui/Badge.svelte'
  import { toast } from '$stores/toast'
  import type { PageData, ActionData } from './$types'
  import type { SupplierDto } from '@pharmapos/types'

  export let data: PageData
  export let form: ActionData

  let showForm = false
  let editItem: SupplierDto | null = null
  let deleteId = ''
  let showConfirm = false
  let formLoading = false
  let deleteLoading = false
  let deleteForm: HTMLFormElement
  let search = ''

  type FormResult = { success?: boolean; message?: string; error?: string } | null
  $: f = form as FormResult
  $: if (f?.success) { toast.success(f.message ?? 'Berhasil'); showForm = false; editItem = null }
  $: if (f?.error) toast.error(f.error ?? 'Terjadi kesalahan')

  function handleDeleteEnhance() {
    deleteLoading = true
    return async ({ result }: { result: import('@sveltejs/kit').ActionResult }) => {
      deleteLoading = false
      showConfirm = false
      if (result.type === 'success') {
        toast.success('Supplier berhasil dihapus')
        await invalidateAll()
      } else if (result.type === 'failure') {
        const data = result.data as Record<string, string> | undefined
        toast.error(data?.error ?? 'Gagal menghapus supplier')
      } else {
        toast.error('Gagal menghapus supplier')
      }
    }
  }
</script>

<svelte:head><title>Supplier — PharmaPOS</title></svelte:head>

<div class="space-y-6">
  <PageHeader title="Supplier" description="Kelola data pemasok produk">
    <button on:click={() => { editItem = null; showForm = true }}
      class="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      Tambah Supplier
    </button>
  </PageHeader>

  <form method="GET" class="flex gap-2">
    <input name="search" bind:value={search} placeholder="Cari nama atau telepon..."
      class="flex-1 max-w-xs px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
    <button type="submit" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm font-medium rounded-lg transition">Cari</button>
  </form>

  <div class="bg-white rounded-xl border border-gray-200 overflow-x-auto">
    <table class="w-full text-sm">
      <thead class="bg-gray-50 border-b border-gray-200">
        <tr>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Nama</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Telepon</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Email</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Status</th>
          <th class="px-4 py-3 text-right font-medium text-gray-600">Aksi</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        {#each data.suppliers.data as item}
          <tr class="hover:bg-gray-50 transition">
            <td class="px-4 py-3 font-medium text-gray-900">{item.name}</td>
            <td class="px-4 py-3 text-gray-500">{item.phone ?? '—'}</td>
            <td class="px-4 py-3 text-gray-500">{item.email ?? '—'}</td>
            <td class="px-4 py-3">
              <Badge variant={item.isActive ? 'success' : 'danger'}>
                {item.isActive ? 'Aktif' : 'Nonaktif'}
              </Badge>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-2">
                <button on:click={() => { editItem = item; showForm = true }}
                  class="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition">Edit</button>
                <button on:click={() => { deleteId = item.id; showConfirm = true }}
                  class="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition">Hapus</button>
              </div>
            </td>
          </tr>
        {:else}
          <tr><td colspan="5"><EmptyState message="Belum ada supplier" /></td></tr>
        {/each}
      </tbody>
    </table>
  </div>

  {#if data.suppliers.totalPages > 1}
    <Pagination page={data.suppliers.page} totalPages={data.suppliers.totalPages} total={data.suppliers.total} limit={data.suppliers.limit}
      on:change={(e) => { window.location.href = `?page=${e.detail}${search ? `&search=${search}` : ''}` }} />
  {/if}
</div>

{#if showForm}
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <button class="absolute inset-0 bg-black/40" aria-label="Tutup" on:click={() => showForm = false}></button>
    <div class="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
      <h3 class="text-base font-semibold text-gray-900 mb-4">{editItem ? 'Edit Supplier' : 'Tambah Supplier'}</h3>
      <form method="POST" action={editItem ? '?/update' : '?/create'}
        use:enhance={() => { formLoading = true; return async ({ update }) => { await update(); formLoading = false } }}>
        {#if editItem}<input type="hidden" name="id" value={editItem.id} />{/if}
        <div class="space-y-3">
          <div>
            <label for="sup-name" class="block text-sm font-medium text-gray-700 mb-1">Nama <span class="text-red-500">*</span></label>
            <input id="sup-name" name="name" value={editItem?.name ?? ''} required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label for="sup-phone" class="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
            <input id="sup-phone" name="phone" value={editItem?.phone ?? ''}
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label for="sup-email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input id="sup-email" name="email" type="email" value={editItem?.email ?? ''}
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label for="sup-address" class="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
            <textarea id="sup-address" name="address" rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">{editItem?.address ?? ''}</textarea>
          </div>
          {#if editItem}
            <div class="flex items-center gap-2">
              <input type="checkbox" id="isActive" name="isActive" value="true" checked={editItem.isActive} class="rounded" />
              <label for="isActive" class="text-sm text-gray-700">Aktif</label>
            </div>
          {/if}
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

<form method="POST" action="?/delete" use:enhance={handleDeleteEnhance} bind:this={deleteForm} class="hidden">
  <input type="hidden" name="id" bind:value={deleteId} />
</form>

<ConfirmDialog bind:open={showConfirm} title="Hapus Supplier" message="Apakah Anda yakin ingin menghapus supplier ini?"
  confirmLabel="Ya, Hapus" loading={deleteLoading}
  on:confirm={() => deleteForm.requestSubmit()}
/>
