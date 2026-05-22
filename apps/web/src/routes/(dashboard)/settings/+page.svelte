<script lang="ts">
  import { enhance } from '$app/forms'
  import PageHeader from '$components/ui/PageHeader.svelte'
  import { toast } from '$stores/toast'
  import type { PageData, ActionData } from './$types'

  export let data: PageData
  export let form: ActionData

  let formLoading = false

  $: if (form?.success) toast.success(form.message ?? 'Pengaturan disimpan')
  $: if (form?.error) toast.error(form.error)
</script>

<svelte:head><title>Pengaturan — PharmaPOS</title></svelte:head>

<div class="space-y-6">
  <PageHeader title="Pengaturan" description="Konfigurasi sistem toko" />

  <div class="bg-white rounded-xl border border-gray-200 p-6 max-w-lg">
    <form method="POST" action="?/update"
      use:enhance={() => { formLoading = true; return async ({ update }) => { await update(); formLoading = false } }}>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nama Toko <span class="text-red-500">*</span></label>
          <input name="storeName" value={data.setting?.storeName ?? ''} required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Pajak (%)</label>
          <input name="taxPercentage" type="number" min="0" max="100" step="0.01"
            value={data.setting?.taxPercentage ?? 11}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nama Printer</label>
          <input name="printerName" value={data.setting?.printerName ?? ''} placeholder="Contoh: POS-80"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div class="flex items-center gap-3 py-2">
          <input type="checkbox" id="autoPrint" name="autoPrint" value="true"
            checked={data.setting?.autoPrint ?? false} class="rounded" />
          <label for="autoPrint" class="text-sm text-gray-700">Auto Print Struk</label>
        </div>
      </div>
      <div class="mt-6">
        <button type="submit" disabled={formLoading}
          class="px-5 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 rounded-lg transition">
          {formLoading ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </button>
      </div>
    </form>
  </div>
</div>
