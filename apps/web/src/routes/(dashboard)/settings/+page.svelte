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

      <!-- Informasi Toko Lanjutan -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <h3 class="text-sm font-semibold text-gray-900 mb-4">Alamat & Struk</h3>
        <div class="space-y-4">
          <div>
            <label for="storeAddress" class="block text-sm font-medium text-gray-700 mb-1">Alamat Toko</label>
            <textarea id="storeAddress" name="storeAddress" rows="2"
              placeholder="Contoh: Jl. Merdeka No. 1, Jakarta"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none">{data.setting?.storeAddress ?? ''}</textarea>
            <p class="mt-1 text-xs text-gray-500">Ditampilkan di bawah nama toko pada struk</p>
          </div>
          <div>
            <label for="receiptFooter" class="block text-sm font-medium text-gray-700 mb-1">Pesan Footer Struk</label>
            <input id="receiptFooter" name="receiptFooter"
              value={data.setting?.receiptFooter ?? 'Terima kasih sudah berbelanja!'}
              placeholder="Contoh: Terima kasih sudah berbelanja!"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            <p class="mt-1 text-xs text-gray-500">Pesan yang tampil di bagian bawah struk</p>
          </div>
        </div>
      </div>

      <!-- Pengaturan Printer -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 class="text-sm font-semibold text-gray-900 mb-1">Pengaturan Printer Thermal</h3>
        <p class="text-xs text-gray-500 mb-4">Konfigurasi printer thermal untuk cetak struk. Pastikan printer sudah diset sebagai printer default di sistem operasi.</p>
        <div class="space-y-4">
          <div>
            <label for="paperWidth" class="block text-sm font-medium text-gray-700 mb-1">Lebar Kertas</label>
            <select id="paperWidth" name="paperWidth"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="58mm" selected={data.setting?.paperWidth === '58mm'}>58mm (Thermal kecil)</option>
              <option value="80mm" selected={!data.setting?.paperWidth || data.setting?.paperWidth === '80mm'}>80mm (Thermal standar)</option>
            </select>
            <p class="mt-1 text-xs text-gray-500">Sesuaikan dengan lebar kertas printer thermal Anda</p>
          </div>
          <div>
            <label for="printerName" class="block text-sm font-medium text-gray-700 mb-1">Nama Printer</label>
            <input id="printerName" name="printerName" value={data.setting?.printerName ?? ''} placeholder="Contoh: POS-80, Thermal Printer"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            <p class="mt-1 text-xs text-gray-500">Nama referensi saja — pastikan set printer ini sebagai default di OS</p>
          </div>
          <label class="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" id="autoPrint" name="autoPrint" value="true"
              checked={data.setting?.autoPrint ?? false}
              class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
            <div>
              <span class="text-sm font-medium text-gray-700">Auto Print Struk</span>
              <p class="text-xs text-gray-500">Cetak struk otomatis setelah transaksi selesai tanpa konfirmasi</p>
            </div>
          </label>
        </div>

        <!-- Print test -->
        <div class="mt-4 pt-4 border-t border-gray-100">
          <p class="text-xs font-medium text-gray-700 mb-2">Tips menggunakan printer thermal:</p>
          <ol class="text-xs text-gray-500 space-y-1 list-decimal list-inside">
            <li>Sambungkan printer thermal ke komputer via USB atau Bluetooth</li>
            <li>Install driver printer (jika diperlukan) dan set sebagai printer default</li>
            <li>Aktifkan "Auto Print Struk" agar struk tercetak otomatis setelah transaksi</li>
            <li>Atau klik tombol "Cetak Struk" di layar penjualan setelah transaksi</li>
          </ol>
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
