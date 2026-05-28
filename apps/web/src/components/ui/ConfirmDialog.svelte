<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  export let open = false
  export let title = 'Konfirmasi'
  export let message = 'Apakah Anda yakin ingin melanjutkan aksi ini?'
  export let confirmLabel = 'Ya, Lanjutkan'
  export let cancelLabel = 'Batal'
  export let variant: 'danger' | 'warning' = 'danger'
  export let loading = false

  const dispatch = createEventDispatcher<{ confirm: void; cancel: void }>()

  function confirm() { open = false; dispatch('confirm') }
  function cancel() { open = false; dispatch('cancel') }

  const confirmStyles = {
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-400',
  }
</script>

{#if open}
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Backdrop -->
    <button class="absolute inset-0 bg-black/40" on:click={cancel} aria-label="Tutup"></button>

    <!-- Dialog -->
    <div class="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
      <h3 class="text-base font-semibold text-gray-900">{title}</h3>
      <p class="mt-2 text-sm text-gray-500">{message}</p>

      <div class="flex gap-3 mt-6 justify-end">
        <button
          on:click={cancel}
          disabled={loading}
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          {cancelLabel}
        </button>
        <button
          on:click={confirm}
          disabled={loading}
          class="px-4 py-2 text-sm font-medium text-white rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 {confirmStyles[variant]}"
        >
          {loading ? 'Memproses...' : confirmLabel}
        </button>
      </div>
    </div>
  </div>
{/if}
