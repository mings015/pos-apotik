<script lang="ts">
  import { enhance } from '$app/forms'
  import { currentUser } from '$lib/stores/auth'

  export let onToggleSidebar: () => void

  let dropdownOpen = false

  function toggleDropdown() {
    dropdownOpen = !dropdownOpen
  }

  function closeDropdown() {
    dropdownOpen = false
  }

  $: user = $currentUser
</script>

<svelte:window on:click={closeDropdown} />

<header class="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 shrink-0">
  <!-- Toggle Sidebar -->
  <button
    on:click|stopPropagation={onToggleSidebar}
    class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition"
    aria-label="Toggle sidebar"
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  </button>

  <!-- Right side -->
  <div class="relative">
    <button
      on:click|stopPropagation={toggleDropdown}
      class="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
    >
      <div class="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-semibold">
        {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
      </div>
      <div class="text-left hidden sm:block">
        <p class="text-sm font-medium text-gray-900 leading-none">{user?.name ?? '-'}</p>
        <p class="text-xs text-gray-500 mt-0.5">{user?.role?.name ?? '-'}</p>
      </div>
      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    {#if dropdownOpen}
      <div
        class="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-gray-200 shadow-lg py-1 z-50"
        on:click|stopPropagation
      >
        <div class="px-4 py-2 border-b border-gray-100">
          <p class="text-sm font-medium text-gray-900">{user?.name}</p>
          <p class="text-xs text-gray-500">{user?.email}</p>
        </div>

        <form method="POST" action="/logout" use:enhance>
          <button
            type="submit"
            class="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </form>
      </div>
    {/if}
  </div>
</header>
