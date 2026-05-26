<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  export let page: number
  export let totalPages: number
  export let total: number
  export let limit: number

  const dispatch = createEventDispatcher<{ change: number }>()

  $: from = total === 0 ? 0 : (page - 1) * limit + 1
  $: to = Math.min(page * limit, total)
  $: pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
</script>

<div class="flex items-center justify-between text-sm">
  <p class="text-gray-500">
    Menampilkan <span class="font-medium text-gray-700">{from}–{to}</span> dari
    <span class="font-medium text-gray-700">{total}</span> data
  </p>

  {#if totalPages > 1}
    <div class="flex items-center gap-1">
      <button
        disabled={page <= 1}
        on:click={() => dispatch('change', page - 1)}
        aria-label="Halaman sebelumnya"
        class="px-2 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {#each pages as p, i}
        {#if i > 0 && p - pages[i - 1] > 1}
          <span class="px-1 text-gray-400">...</span>
        {/if}
        <button
          on:click={() => dispatch('change', p)}
          class="w-8 h-8 rounded-lg text-xs font-medium transition {p === page
            ? 'bg-primary-600 text-white'
            : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}"
        >
          {p}
        </button>
      {/each}

      <button
        disabled={page >= totalPages}
        on:click={() => dispatch('change', page + 1)}
        aria-label="Halaman berikutnya"
        class="px-2 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  {/if}
</div>
