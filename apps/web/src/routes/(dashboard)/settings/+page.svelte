<script lang="ts">
  import { enhance } from '$app/forms'
  import PageHeader from '$components/ui/PageHeader.svelte'
  import { toast } from '$stores/toast'
  import type { PageData, ActionData } from './$types'

  export let data: PageData
  export let form: ActionData

  let formLoading = false

  type FormResult = { success?: boolean; message?: string; error?: string } | null
  $: f = form as FormResult
  $: if (f?.success) toast.success(f.message ?? 'Pengaturan disimpan')
  $: if (f?.error) toast.error(f.error ?? 'Terjadi kesalahan')
</script>

<svelte:head><title>Pengaturan — PharmaPOS</title></svelte:head>

<div class="space-y-6">
  <PageHeader title="Pengaturan" description="Konfigurasi sistem toko" />

  <div class="max-w-xl mx-auto">
    <form method="POST" action="?/update"
      use:enhance={() => { formLoading = true; return async ({ update }) => { await update(); formLoading = false } }}>

      <!-- Informasi Toko -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <h3 class="text-sm font-semibold text-gray-900 mb-4">Informasi Toko</h3>
        <div class="space-y-4">
          <div>
            <label for="storeName" class="block text-sm font-medium text-gray-700 mb-1">Nama Toko <span class="text-red-500">*</span></label>
            <input id="storeName" name="storeName" value={data.setting?.storeName ?? ''} required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label for="taxPercentage" class="block text-sm font-medium text-gray-700 mb-1">Pajak (%)</label>
            <input id="taxPercentage" name="taxPercentage" type="number" min="0" max="100" step="0.01"
              value={data.setting?.taxPercentage ?? 11}
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            <p class="mt-1 text-xs text-gray-500">Persentase pajak yang dikenakan pada setiap transaksi</p>
          </div>
        </div>
      </div>

      <!-- Pengaturan Printer -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 class="text-sm font-semibold text-gray-900 mb-4">Pengaturan Printer</h3>
        <div class="space-y-4">
          <div>
            <label for="printerName" class="block text-sm font-medium text-gray-700 mb-1">Nama Printer</label>
            <input id="printerName" name="printerName" value={data.setting?.printerName ?? ''} placeholder="Contoh: POS-80"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <label class="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" id="autoPrint" name="autoPrint" value="true"
              checked={data.setting?.autoPrint ?? false}
              class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
            <div>
              <span class="text-sm font-medium text-gray-700">Auto Print Struk</span>
              <p class="text-xs text-gray-500">Cetak struk otomatis setelah transaksi selesai</p>
            </div>
          </label>
        </div>
      </div>

      <div class="flex justify-end">
        <button type="submit" disabled={formLoading}
          class="px-5 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 rounded-lg transition">
          {formLoading ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </button>
      </div>
    </form>
  </div>
</div>
