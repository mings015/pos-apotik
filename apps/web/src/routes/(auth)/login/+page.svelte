<script lang="ts">
  import { enhance } from '$app/forms'
  import type { ActionData } from './$types'

  export let form: ActionData
  let loading = false
</script>

<svelte:head>
  <title>Login — PharmaPOS</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
  <div class="w-full max-w-md">
    <!-- Logo & Heading -->
    <div class="text-center mb-8">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <h1 class="text-2xl font-bold text-gray-900">PharmaPOS</h1>
      <p class="text-gray-500 mt-1">Sistem Kasir & Inventory Apotik</p>
    </div>

    <!-- Card -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <h2 class="text-xl font-semibold text-gray-900 mb-6">Masuk ke akun Anda</h2>

      {#if form?.error}
        <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {form.error}
        </div>
      {/if}

      <form method="POST" use:enhance={() => {
        loading = true
        return async ({ update }) => {
          await update()
          loading = false
        }
      }}>
        <div class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              placeholder="admin@pharmapos.com"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>

          <div class="flex items-center justify-end">
            <a href="/forgot-password" class="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Lupa password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            class="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium rounded-lg text-sm transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
