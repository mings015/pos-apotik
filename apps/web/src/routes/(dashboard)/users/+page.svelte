<script lang="ts">
  import { enhance } from '$app/forms'
  import { invalidateAll } from '$app/navigation'
  import PageHeader from '$components/ui/PageHeader.svelte'
  import EmptyState from '$components/ui/EmptyState.svelte'
  import Pagination from '$components/ui/Pagination.svelte'
  import ConfirmDialog from '$components/ui/ConfirmDialog.svelte'
  import { toast } from '$stores/toast'
  import type { PageData, ActionData } from './$types'
  import type { UserDto } from '@pharmapos/types'

  export let data: PageData
  export let form: ActionData

  let showForm = false
  let editItem: UserDto | null = null
  let deleteId = ''
  let showConfirm = false
  let formLoading = false
  let deleteLoading = false
  let search = ''

  type FormResult = { success?: boolean; message?: string; error?: string } | null
  $: f = form as FormResult
  $: if (f?.success) { toast.success(f.message ?? 'Berhasil'); showForm = false; editItem = null }
  $: if (f?.error) toast.error(f.error ?? 'Terjadi kesalahan')

  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Admin',
    CASHIER: 'Kasir',
    WAREHOUSE: 'Gudang',
  }

  const roleBadge: Record<string, string> = {
    SUPER_ADMIN: 'bg-purple-100 text-purple-700',
    ADMIN: 'bg-blue-100 text-blue-700',
    CASHIER: 'bg-green-100 text-green-700',
    WAREHOUSE: 'bg-amber-100 text-amber-700',
  }

  const roleAvatar: Record<string, string> = {
    SUPER_ADMIN: 'from-purple-400 to-purple-600',
    ADMIN: 'from-blue-400 to-blue-600',
    CASHIER: 'from-green-400 to-green-600',
    WAREHOUSE: 'from-amber-400 to-amber-600',
  }
</script>

<svelte:head><title>Pengguna — PharmaPOS</title></svelte:head>

<div class="space-y-6">
  <PageHeader title="Pengguna" description="Kelola akun pengguna sistem">
    <button on:click={() => { editItem = null; showForm = true }}
      class="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition shadow-sm">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
      </svg>
      Tambah Pengguna
    </button>
  </PageHeader>

  <!-- Search + count -->
  <div class="flex items-center gap-3">
    <form method="GET" class="flex-1 max-w-xs relative">
      <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
      </svg>
      <input name="search" bind:value={search} placeholder="Cari nama atau email..."
        class="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
    </form>
    {#if data.users.total > 0}
      <span class="text-sm text-gray-500">{data.users.total} pengguna</span>
    {/if}
  </div>

  <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-gray-100 bg-gray-50/80">
          <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Pengguna</th>
          <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
          <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
          <th class="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-50">
        {#each data.users.data as item}
          {@const avatarGradient = roleAvatar[item.role?.name ?? ''] ?? 'from-gray-400 to-gray-600'}
          {@const badge = roleBadge[item.role?.name ?? ''] ?? 'bg-gray-100 text-gray-700'}
          <tr class="hover:bg-gray-50/60 transition-colors">
            <td class="px-5 py-3.5">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-gradient-to-br {avatarGradient} flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {item.name.charAt(0).toUpperCase()}
                </div>
                <div class="min-w-0">
                  <p class="font-semibold text-gray-900 truncate">{item.name}</p>
                  <p class="text-xs text-gray-400 truncate">{item.email}</p>
                </div>
              </div>
            </td>
            <td class="px-5 py-3.5">
              <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold {badge}">
                {item.role ? (roleLabels[item.role.name] ?? item.role.name) : '—'}
              </span>
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
          <tr><td colspan="4"><EmptyState message="Belum ada pengguna" /></td></tr>
        {/each}
      </tbody>
    </table>
  </div>

  {#if data.users.totalPages > 1}
    <Pagination page={data.users.page} totalPages={data.users.totalPages} total={data.users.total} limit={data.users.limit}
      on:change={(e) => { window.location.href = `?page=${e.detail}${search ? `&search=${search}` : ''}` }} />
  {/if}
</div>

{#if showForm}
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <button class="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-label="Tutup" on:click={() => showForm = false}></button>
    <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
      <!-- Modal Header -->
      <div class="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
        <div class="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
        </div>
        <h3 class="text-base font-semibold text-gray-900">{editItem ? 'Edit Pengguna' : 'Tambah Pengguna'}</h3>
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
            <label for="usr-name" class="block text-sm font-medium text-gray-700 mb-1.5">Nama <span class="text-red-500">*</span></label>
            <input id="usr-name" name="name" value={editItem?.name ?? ''} required minlength="2"
              class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
          </div>
          <div>
            <label for="usr-email" class="block text-sm font-medium text-gray-700 mb-1.5">Email <span class="text-red-500">*</span></label>
            <input id="usr-email" name="email" type="email" value={editItem?.email ?? ''} required
              class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
          </div>
          <div>
            <label for="usr-password" class="block text-sm font-medium text-gray-700 mb-1.5">
              Password {#if !editItem}<span class="text-red-500">*</span>{:else}<span class="text-gray-400 font-normal text-xs">(kosongkan jika tidak diubah)</span>{/if}
            </label>
            <input id="usr-password" name="password" type="password" minlength="8" required={!editItem}
              class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
          </div>
          <div>
            <label for="usr-role" class="block text-sm font-medium text-gray-700 mb-1.5">Role <span class="text-red-500">*</span></label>
            <select id="usr-role" name="roleId" required
              class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent">
              <option value="">Pilih role...</option>
              {#each data.roles as role}
                <option value={role.id} selected={editItem?.roleId === role.id}>
                  {roleLabels[role.name] ?? role.name}
                </option>
              {/each}
            </select>
          </div>
          {#if editItem}
            <label class="flex items-center gap-3 cursor-pointer py-1">
              <div class="relative">
                <input type="checkbox" id="isActive" name="isActive" value="true" checked={editItem.isActive} class="sr-only peer" />
                <div class="w-9 h-5 bg-gray-200 peer-checked:bg-emerald-500 rounded-full transition-colors"></div>
                <div class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4"></div>
              </div>
              <span class="text-sm text-gray-700">Akun aktif</span>
            </label>
          {/if}
        </div>

        <div class="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/60 justify-end">
          <button type="button" on:click={() => showForm = false}
            class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-100 transition">
            Batal
          </button>
          <button type="submit" disabled={formLoading}
            class="px-4 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-60 rounded-xl transition">
            {formLoading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<ConfirmDialog bind:open={showConfirm} title="Hapus Pengguna" message="Apakah Anda yakin ingin menghapus pengguna ini?"
  confirmLabel="Ya, Hapus" loading={deleteLoading}
  on:confirm={async () => {
    deleteLoading = true
    const fd = new FormData(); fd.set('id', deleteId)
    const res = await fetch('?/delete', { method: 'POST', body: fd })
    const result = await res.json()
    deleteLoading = false; showConfirm = false
    if (result.type === 'success') { toast.success('Pengguna berhasil dihapus'); await invalidateAll() }
    else toast.error('Gagal menghapus pengguna')
  }}
/>
