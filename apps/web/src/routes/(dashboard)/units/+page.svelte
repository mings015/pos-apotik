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

  type FormResult = { success?: boolean; message?: string; error?: string } | null
  $: f = form as FormResult
  $: if (f?.success) { toast.success(f.message ?? 'Berhasil'); showForm = false; editItem = null }
  $: if (f?.error) toast.error(f.error ?? 'Terjadi kesalahan')

  function openCreate() { editItem = null; showForm = true }
  function openEdit(item: UnitDto) { editItem = item; showForm = true }
</script>

<svelte:head><title>Satuan — PharmaPOS</title></svelte:head>

<div class="space-y-6">
  <PageHeader title="Satuan" description="Kelola satuan produk (Tablet, Strip, Botol, dll)">
    <button on:click={openCreate}
      class="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition shadow-sm">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      Tambah Satuan
    </button>
  </PageHeader>

  {#if data.units.total > 0}
    <p class="text-sm text-gray-500">{data.units.total} satuan terdaftar</p>
  {/if}

  {#if data.units.data.length === 0}
    <EmptyState message="Belum ada satuan" />
  {:else}
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {#each data.units.data as item}
        <div class="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-md transition-all group text-center">
          <div class="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-2.5">
            <span class="text-lg font-bold text-emerald-600 font-mono leading-none">{item.symbol}</span>
          </div>
          <p class="font-semibold text-gray-900 text-sm truncate">{item.name}</p>
          <div class="flex justify-center gap-1 mt-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button on:click={() => openEdit(item)}
              class="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition" title="Edit">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>
            <button on:click={() => { deleteId = item.id; showConfirm = true }}
              class="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition" title="Hapus">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  {#if data.units.totalPages > 1}
    <Pagination page={data.units.page} totalPages={data.units.totalPages} total={data.units.total} limit={data.units.limit}
      on:change={(e) => { window.location.href = `?page=${e.detail}` }} />
  {/if}
</div>

{#if showForm}
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <button class="absolute inset-0 bg-black/40 backdrop-blur-sm" on:click={() => showForm = false} aria-label="Tutup"></button>
    <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
      <!-- Modal Header -->
      <div class="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
        <div class="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/>
          </svg>
        </div>
        <h3 class="text-base font-semibold text-gray-900">{editItem ? 'Edit Satuan' : 'Tambah Satuan'}</h3>
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
            <label for="unit-name" class="block text-sm font-medium text-gray-700 mb-1.5">Nama <span class="text-red-500">*</span></label>
            <input id="unit-name" name="name" value={editItem?.name ?? ''} required
              class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
          </div>
          <div>
            <label for="unit-symbol" class="block text-sm font-medium text-gray-700 mb-1.5">Simbol <span class="text-red-500">*</span></label>
            <input id="unit-symbol" name="symbol" value={editItem?.symbol ?? ''} required placeholder="Contoh: tab, strip, btl"
              class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono" />
            <p class="mt-1 text-xs text-gray-400">Singkatan yang ditampilkan di tabel dan struk</p>
          </div>
        </div>

        <div class="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/60 justify-end">
          <button type="button" on:click={() => showForm = false}
            class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-100 transition">
            Batal
          </button>
          <button type="submit" disabled={formLoading}
            class="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 rounded-xl transition">
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
