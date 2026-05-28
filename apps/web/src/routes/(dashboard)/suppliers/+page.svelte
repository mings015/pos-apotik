<script lang="ts">
  import { enhance } from '$app/forms'
  import { invalidateAll } from '$app/navigation'
  import PageHeader from '$components/ui/PageHeader.svelte'
  import EmptyState from '$components/ui/EmptyState.svelte'
  import Pagination from '$components/ui/Pagination.svelte'
  import ConfirmDialog from '$components/ui/ConfirmDialog.svelte'
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
      class="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-xl transition shadow-sm">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      Tambah Supplier
    </button>
  </PageHeader>

  <!-- Search + count -->
  <div class="flex items-center gap-3">
    <form method="GET" class="flex-1 max-w-xs relative">
      <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
      </svg>
      <input name="search" bind:value={search} placeholder="Cari nama atau telepon..."
        class="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
    </form>
    {#if data.suppliers.total > 0}
      <span class="text-sm text-gray-500">{data.suppliers.total} supplier</span>
    {/if}
  </div>

  <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-gray-100 bg-gray-50/80">
          <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama</th>
          <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Kontak</th>
          <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
          <th class="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-50">
        {#each data.suppliers.data as item}
          <tr class="hover:bg-gray-50/60 transition-colors">
            <td class="px-5 py-3.5">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                  <svg class="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                </div>
                <p class="font-semibold text-gray-900">{item.name}</p>
              </div>
            </td>
            <td class="px-5 py-3.5">
              <div class="space-y-0.5">
                {#if item.phone}
                  <p class="text-sm text-gray-700">{item.phone}</p>
                {/if}
                {#if item.email}
                  <p class="text-xs text-gray-400">{item.email}</p>
                {/if}
                {#if !item.phone && !item.email}
                  <p class="text-sm text-gray-300">—</p>
                {/if}
              </div>
            </td>
            <td class="px-5 py-3.5">
              <span class="inline-flex items-center gap-1.5 text-xs font-medium {item.isActive ? 'text-emerald-700' : 'text-gray-400'}">
                <span class="w-1.5 h-1.5 rounded-full {item.isActive ? 'bg-emerald-500' : 'bg-gray-300'}"></span>
                {item.isActive ? 'Aktif' : 'Nonaktif'}
              </span>
            </td>
            <td class="px-5 py-3.5">
              <div class="flex items-center justify-end gap-1">
                <button on:click={() => { editItem = item; showForm = true }}
                  class="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition" title="Edit">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                <button on:click={() => { deleteId = item.id; showConfirm = true }}
                  class="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition" title="Hapus">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        {:else}
          <tr><td colspan="4"><EmptyState message="Belum ada supplier" /></td></tr>
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
    <button class="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-label="Tutup" on:click={() => showForm = false}></button>
    <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
      <!-- Modal Header -->
      <div class="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
        <div class="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
        </div>
        <h3 class="text-base font-semibold text-gray-900">{editItem ? 'Edit Supplier' : 'Tambah Supplier'}</h3>
        <button on:click={() => showForm = false}
          class="ml-auto p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition" aria-label="Tutup">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <form method="POST" action={editItem ? '?/update' : '?/create'}
        use:enhance={() => { formLoading = true; return async ({ update }) => { await update(); formLoading = false } }}>
        {#if editItem}<input type="hidden" name="id" value={editItem.id} />{/if}

        <div class="px-6 py-5 space-y-3">
          <div>
            <label for="sup-name" class="block text-sm font-medium text-gray-700 mb-1.5">Nama <span class="text-red-500">*</span></label>
            <input id="sup-name" name="name" value={editItem?.name ?? ''} required
              class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="sup-phone" class="block text-sm font-medium text-gray-700 mb-1.5">Telepon</label>
              <input id="sup-phone" name="phone" value={editItem?.phone ?? ''}
                class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
            </div>
            <div>
              <label for="sup-email" class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input id="sup-email" name="email" type="email" value={editItem?.email ?? ''}
                class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
            </div>
          </div>
          <div>
            <label for="sup-address" class="block text-sm font-medium text-gray-700 mb-1.5">Alamat</label>
            <textarea id="sup-address" name="address" rows="2"
              class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none">{editItem?.address ?? ''}</textarea>
          </div>
          {#if editItem}
            <label class="flex items-center gap-3 cursor-pointer py-1">
              <div class="relative">
                <input type="checkbox" id="isActive" name="isActive" value="true" checked={editItem.isActive} class="sr-only peer" />
                <div class="w-9 h-5 bg-gray-200 peer-checked:bg-emerald-500 rounded-full transition-colors"></div>
                <div class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4"></div>
              </div>
              <span class="text-sm text-gray-700">Supplier aktif</span>
            </label>
          {/if}
        </div>

        <div class="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/60 justify-end">
          <button type="button" on:click={() => showForm = false}
            class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-100 transition">
            Batal
          </button>
          <button type="submit" disabled={formLoading}
            class="px-4 py-2 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-60 rounded-xl transition">
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
