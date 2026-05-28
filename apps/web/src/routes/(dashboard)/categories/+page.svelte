<script lang="ts">
  import { enhance } from '$app/forms'
  import { invalidateAll } from '$app/navigation'
  import PageHeader from '$components/ui/PageHeader.svelte'
  import EmptyState from '$components/ui/EmptyState.svelte'
  import Pagination from '$components/ui/Pagination.svelte'
  import ConfirmDialog from '$components/ui/ConfirmDialog.svelte'
  import { toast } from '$stores/toast'
  import type { PageData, ActionData } from './$types'
  import type { CategoryDto } from '@pharmapos/types'

  export let data: PageData
  export let form: ActionData

  let showForm = false
  let editItem: CategoryDto | null = null
  let deleteId = ''
  let showConfirm = false
  let formLoading = false
  let deleteLoading = false
  let search = ''

  type FormResult = { success?: boolean; message?: string; error?: string } | null
  $: f = form as FormResult
  $: if (f?.success) { toast.success(f.message ?? 'Berhasil'); showForm = false; editItem = null }
  $: if (f?.error) toast.error(f.error ?? 'Terjadi kesalahan')

  function openCreate() { editItem = null; showForm = true }
  function openEdit(item: CategoryDto) { editItem = item; showForm = true }
  function openDelete(id: string) { deleteId = id; showConfirm = true }

  function handleSearch(e: Event) {
    const target = e.target as HTMLInputElement
    search = target.value
  }
</script>

<svelte:head><title>Kategori — PharmaPOS</title></svelte:head>

<div class="space-y-6">
  <PageHeader title="Kategori" description="Kelola kategori produk obat">
    <button on:click={openCreate}
      class="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-xl transition shadow-sm">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      Tambah Kategori
    </button>
  </PageHeader>

  <!-- Search + count -->
  <div class="flex items-center gap-3">
    <form method="GET" class="flex-1 max-w-xs relative">
      <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
      </svg>
      <input name="search" value={search} on:input={handleSearch} placeholder="Cari kategori..."
        class="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
    </form>
    {#if data.categories.total > 0}
      <span class="text-sm text-gray-500">{data.categories.total} kategori</span>
    {/if}
  </div>

  <!-- Card Grid -->
  {#if data.categories.data.length === 0}
    <EmptyState message="Belum ada kategori" />
  {:else}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {#each data.categories.data as item}
        <div class="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-all group">
          <div class="flex items-start justify-between mb-3">
            <div class="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button on:click={() => openEdit(item)}
                class="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition" title="Edit">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </button>
              <button on:click={() => openDelete(item.id)}
                class="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition" title="Hapus">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
          <p class="font-semibold text-gray-900 truncate">{item.name}</p>
          <p class="text-sm text-gray-400 mt-0.5 truncate">{item.description ?? 'Tidak ada deskripsi'}</p>
        </div>
      {/each}
    </div>
  {/if}

  {#if data.categories.totalPages > 1}
    <Pagination
      page={data.categories.page}
      totalPages={data.categories.totalPages}
      total={data.categories.total}
      limit={data.categories.limit}
      on:change={(e) => { window.location.href = `?page=${e.detail}${search ? `&search=${search}` : ''}` }}
    />
  {/if}
</div>

<!-- Form Modal -->
{#if showForm}
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <button class="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-label="Tutup" on:click={() => showForm = false}></button>
    <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
      <!-- Modal Header -->
      <div class="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
        <div class="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
          </svg>
        </div>
        <h3 class="text-base font-semibold text-gray-900">
          {editItem ? 'Edit Kategori' : 'Tambah Kategori'}
        </h3>
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

        <div class="px-6 py-5 space-y-4">
          <div>
            <label for="cat-name" class="block text-sm font-medium text-gray-700 mb-1.5">Nama <span class="text-red-500">*</span></label>
            <input id="cat-name" name="name" value={editItem?.name ?? ''} required
              class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
          </div>
          <div>
            <label for="cat-desc" class="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi</label>
            <textarea id="cat-desc" name="description" rows="3"
              class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none">{editItem?.description ?? ''}</textarea>
          </div>
        </div>

        <div class="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/60 justify-end">
          <button type="button" on:click={() => showForm = false}
            class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-100 transition">
            Batal
          </button>
          <button type="submit" disabled={formLoading}
            class="px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-60 rounded-xl transition">
            {formLoading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<ConfirmDialog
  bind:open={showConfirm}
  title="Hapus Kategori"
  message="Apakah Anda yakin ingin menghapus kategori ini?"
  confirmLabel="Ya, Hapus"
  loading={deleteLoading}
  on:confirm={async () => {
    deleteLoading = true
    const fd = new FormData()
    fd.set('id', deleteId)
    const res = await fetch('?/delete', { method: 'POST', body: fd })
    const result = await res.json()
    deleteLoading = false
    showConfirm = false
    if (result.type === 'success') { toast.success('Kategori berhasil dihapus'); await invalidateAll() }
    else toast.error('Gagal menghapus kategori')
  }}
/>
