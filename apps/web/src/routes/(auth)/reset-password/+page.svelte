<script lang="ts">
  import { enhance } from '$app/forms'
  import type { ActionData, PageData } from './$types'

  export let data: PageData
  export let form: ActionData
  let loading = false
</script>

<svelte:head>
  <title>Reset Password — PharmaPOS</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
  <div class="w-full max-w-md">
    <div class="text-center mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Reset Password</h1>
      <p class="text-gray-500 mt-1">Masukkan password baru Anda</p>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      {#if form?.error}
        <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {form.error}
        </div>
      {/if}

      <form method="POST" use:enhance={() => {
        loading = true
        return async ({ update }) => { await update(); loading = false }
      }}>
        <input type="hidden" name="token" value={data.token} />

        <div class="space-y-4">
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
            <input
              id="password" name="password" type="password" required minlength="8"
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              placeholder="Minimal 8 karakter"
            />
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
            <input
              id="confirmPassword" name="confirmPassword" type="password" required minlength="8"
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              placeholder="Ulangi password baru"
            />
          </div>

          <button
            type="submit" disabled={loading}
            class="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium rounded-lg text-sm transition"
          >
            {loading ? 'Memproses...' : 'Reset Password'}
          </button>
        </div>
      </form>

      <p class="mt-4 text-center text-sm text-gray-500">
        <a href="/login" class="text-primary-600 hover:text-primary-700 font-medium">Kembali ke Login</a>
      </p>
    </div>
  </div>
</div>
