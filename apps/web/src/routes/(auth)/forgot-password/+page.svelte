<script lang="ts">
  import { enhance } from '$app/forms'
  import type { ActionData } from './$types'

  export let form: ActionData
  let loading = false
</script>

<svelte:head>
  <title>Lupa Password — PharmaPOS</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
  <div class="w-full max-w-md">
    <div class="text-center mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Lupa Password</h1>
      <p class="text-gray-500 mt-1">Masukkan email untuk menerima token reset</p>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      {#if form?.success}
        <div class="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p class="text-green-700 text-sm font-medium">Token reset berhasil dibuat.</p>
          {#if form.token}
            <p class="text-green-600 text-xs mt-1 break-all">Token: {form.token}</p>
            <p class="text-green-600 text-xs mt-1">
              <a href="/reset-password?token={form.token}" class="underline font-medium">
                Klik di sini untuk reset password
              </a>
            </p>
          {/if}
        </div>
      {/if}

      {#if form?.error}
        <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {form.error}
        </div>
      {/if}

      <form method="POST" use:enhance={() => {
        loading = true
        return async ({ update }) => { await update(); loading = false }
      }}>
        <div class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email" name="email" type="email" required
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              placeholder="email@contoh.com"
            />
          </div>

          <button
            type="submit" disabled={loading}
            class="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium rounded-lg text-sm transition"
          >
            {loading ? 'Memproses...' : 'Kirim Token Reset'}
          </button>
        </div>
      </form>

      <p class="mt-4 text-center text-sm text-gray-500">
        <a href="/login" class="text-primary-600 hover:text-primary-700 font-medium">Kembali ke Login</a>
      </p>
    </div>
  </div>
</div>
