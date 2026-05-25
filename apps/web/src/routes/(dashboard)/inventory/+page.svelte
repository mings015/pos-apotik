<script lang="ts">
  import PageHeader from "$components/ui/PageHeader.svelte";
  import EmptyState from "$components/ui/EmptyState.svelte";
  import Pagination from "$components/ui/Pagination.svelte";
  import Badge from "$components/ui/Badge.svelte";
  import type { PageData } from "./$types";

  export let data: PageData;

  let search = data.filters.search;
  let isActive = data.filters.isActive;

  // Modal state
  let selectedItem: (typeof data.stocks.data)[number] | null = null;

  function buildQuery(page = 1) {
    const p = new URLSearchParams({ page: String(page) });
    if (search) p.set("search", search);
    if (isActive) p.set("isActive", isActive);
    return `?${p}`;
  }

  function daysUntilExpiry(date: string) {
    return Math.ceil(
      (new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
  }

  function expiryBadge(batch: { expiredDate: string; quantity: number }) {
    const days = daysUntilExpiry(batch.expiredDate);
    if (days < 0) return { variant: "danger" as const, label: "Expired" };
    if (days <= 30)
      return { variant: "warning" as const, label: `${days}h lagi` };
    return { variant: "success" as const, label: `${days}h` };
  }

  function formatDate(d: string) {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(d));
  }
</script>

<svelte:head><title>Inventory — PharmaPOS</title></svelte:head>

<div class="space-y-6">
  <PageHeader
    title="Inventory"
    description="Monitor stok dan pergerakan barang"
  >
    <div class="flex gap-2">
      <a
        href="/inventory/stock-in"
        class="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition"
      >
        + Stock In
      </a>
      <a
        href="/inventory/adjustment"
        class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
      >
        Adjustment
      </a>
      <a
        href="/inventory/opname"
        class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
      >
        Stock Opname
      </a>
    </div>
  </PageHeader>

  <!-- Alert Cards -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <div class="bg-white rounded-xl border border-gray-200 p-4">
      <p class="text-xs text-gray-500 mb-1">Total Produk Aktif</p>
      <p class="text-2xl font-bold text-gray-900">
        {data.overview.totalProducts}
      </p>
    </div>
    <div
      class="bg-white rounded-xl border border-gray-200 p-4 {data.overview
        .lowStockCount > 0
        ? 'border-l-4 border-l-yellow-400'
        : ''}"
    >
      <p class="text-xs text-gray-500 mb-1">Stok Rendah</p>
      <p
        class="text-2xl font-bold {data.overview.lowStockCount > 0
          ? 'text-yellow-600'
          : 'text-gray-900'}"
      >
        {data.overview.lowStockCount}
      </p>
    </div>
    <div
      class="bg-white rounded-xl border border-gray-200 p-4 {data.overview
        .nearExpiredCount > 0
        ? 'border-l-4 border-l-orange-400'
        : ''}"
    >
      <p class="text-xs text-gray-500 mb-1">Mendekati Expired</p>
      <p
        class="text-2xl font-bold {data.overview.nearExpiredCount > 0
          ? 'text-orange-600'
          : 'text-gray-900'}"
      >
        {data.overview.nearExpiredCount}
      </p>
    </div>
    <div
      class="bg-white rounded-xl border border-gray-200 p-4 {data.overview
        .expiredCount > 0
        ? 'border-l-4 border-l-red-500'
        : ''}"
    >
      <p class="text-xs text-gray-500 mb-1">Sudah Expired</p>
      <p
        class="text-2xl font-bold {data.overview.expiredCount > 0
          ? 'text-red-600'
          : 'text-gray-900'}"
      >
        {data.overview.expiredCount}
      </p>
    </div>
  </div>

  <!-- Filter -->
  <form method="GET" class="flex flex-wrap gap-2">
    <input
      name="search"
      bind:value={search}
      placeholder="Cari produk..."
      class="flex-1 min-w-[200px] max-w-xs px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
    />
    <select
      name="isActive"
      bind:value={isActive}
      class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
    >
      <option value="">Semua Status</option>
      <option value="true">Aktif</option>
      <option value="false">Nonaktif</option>
    </select>
    <button
      type="submit"
      class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm font-medium rounded-lg transition"
      >Cari</button
    >
  </form>

  <!-- Stock Table -->
  <div class="bg-white rounded-xl border border-gray-200 overflow-x-auto">
    <table class="w-full text-sm">
      <thead class="bg-gray-50 border-b border-gray-200">
        <tr>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Produk</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Satuan</th>
          <th class="px-4 py-3 text-right font-medium text-gray-600">Stok</th>
          <th class="px-4 py-3 text-right font-medium text-gray-600"
            >Min. Stok</th
          >
          <th class="px-4 py-3 text-left font-medium text-gray-600"
            >Batch Aktif</th
          >
          <th class="px-4 py-3 text-left font-medium text-gray-600">Status</th>
          <th class="px-4 py-3 text-right font-medium text-gray-600">Aksi</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        {#each data.stocks.data as item}
          {@const isLow = item.stock <= item.minimumStock && item.isActive}
          <tr
            class="hover:bg-gray-50 transition cursor-pointer"
            class:opacity-60={!item.isActive}
            on:click={() => (selectedItem = item)}
          >
            <td class="px-4 py-3">
              <p class="font-medium text-gray-900">{item.name}</p>
              <p class="text-xs text-gray-400 font-mono">{item.code}</p>
            </td>
            <td class="px-4 py-3 text-gray-500">{item.unit?.symbol ?? "—"}</td>
            <td
              class="px-4 py-3 text-right font-semibold"
              class:text-red-600={isLow}
            >
              {item.stock}
              {#if isLow}<span class="ml-1 text-xs">⚠</span>{/if}
            </td>
            <td class="px-4 py-3 text-right text-gray-500"
              >{item.minimumStock}</td
            >
            <td class="px-4 py-3">
              {#if (item.batches?.length ?? 0) > 0}
                <div class="flex flex-wrap gap-1">
                  {#each (item.batches ?? []).slice(0, 2) as batch}
                    {@const exp = expiryBadge(batch)}
                    <Badge variant={exp.variant}
                      >{batch.batchNumber} · {exp.label}</Badge
                    >
                  {/each}
                  {#if (item.batches?.length ?? 0) > 2}
                    <span class="text-xs text-gray-400"
                      >+{(item.batches?.length ?? 0) - 2} lagi</span
                    >
                  {/if}
                </div>
              {:else}
                <span class="text-xs text-gray-400">—</span>
              {/if}
            </td>
            <td class="px-4 py-3">
              <Badge variant={item.isActive ? "success" : "danger"}>
                {item.isActive ? "Aktif" : "Nonaktif"}
              </Badge>
            </td>
            <td class="px-4 py-3">
              <div
                class="flex justify-end gap-2"
                role="none"
                on:click|stopPropagation
              >
                <a
                  href="/inventory/stock-in?productId={item.id}"
                  class="px-3 py-1.5 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition"
                >
                  Stock In
                </a>
                <a
                  href="/inventory/adjustment?productId={item.id}"
                  class="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Adjust
                </a>
              </div>
            </td>
          </tr>
        {:else}
          <tr
            ><td colspan="7"><EmptyState message="Belum ada data stok" /></td
            ></tr
          >
        {/each}
      </tbody>
    </table>
  </div>

  {#if data.stocks.totalPages > 1}
    <Pagination
      page={data.stocks.page}
      totalPages={data.stocks.totalPages}
      total={data.stocks.total}
      limit={data.stocks.limit}
      on:change={(e) => {
        window.location.href = buildQuery(e.detail);
      }}
    />
  {/if}
</div>

<!-- Detail Modal -->
{#if selectedItem}
  {@const item = selectedItem}
  {@const isLow = item.stock <= item.minimumStock && item.isActive}

  <button
    class="fixed inset-0 z-40 bg-black/40"
    on:click={() => (selectedItem = null)}
    aria-label="Tutup modal"
  ></button>

  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
  >
    <div
      class="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col pointer-events-auto"
    >
      <!-- Header -->
      <div
        class="flex items-start justify-between p-6 border-b border-gray-100"
      >
        <div>
          <h2 class="text-base font-semibold text-gray-900">{item.name}</h2>
          <p class="text-xs text-gray-400 font-mono mt-0.5">{item.code}</p>
        </div>
        <button
          on:click={() => (selectedItem = null)}
          class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition"
          aria-label="Tutup"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="overflow-y-auto p-6 space-y-6">
        <!-- Info Grid -->
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-gray-50 rounded-xl p-4">
            <p class="text-xs text-gray-500 mb-1">Stok Saat Ini</p>
            <p
              class="text-2xl font-bold {isLow
                ? 'text-red-600'
                : 'text-gray-900'}"
            >
              {item.stock}
              <span class="text-sm font-normal text-gray-500"
                >{item.unit?.symbol ?? ""}</span
              >
            </p>
            {#if isLow}
              <p class="text-xs text-red-500 mt-1">⚠ Di bawah minimum</p>
            {/if}
          </div>
          <div class="bg-gray-50 rounded-xl p-4">
            <p class="text-xs text-gray-500 mb-1">Minimum Stok</p>
            <p class="text-2xl font-bold text-gray-900">
              {item.minimumStock}
              <span class="text-sm font-normal text-gray-500"
                >{item.unit?.symbol ?? ""}</span
              >
            </p>
          </div>
        </div>

        <!-- Info Rows -->
        <div class="space-y-2 text-sm">
          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-gray-500">Kategori</span>
            <span class="font-medium text-gray-900"
              >{item.category?.name ?? "—"}</span
            >
          </div>
          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-gray-500">Satuan</span>
            <span class="font-medium text-gray-900"
              >{item.unit?.name ?? "—"}</span
            >
          </div>
          <div class="flex justify-between py-2">
            <span class="text-gray-500">Status</span>
            <Badge variant={item.isActive ? "success" : "danger"}>
              {item.isActive ? "Aktif" : "Nonaktif"}
            </Badge>
          </div>
        </div>

        <!-- Batch List -->
        <div>
          <h3 class="text-sm font-semibold text-gray-700 mb-3">
            Batch Aktif
            <span class="ml-1 text-xs font-normal text-gray-400"
              >({item.batches?.length ?? 0} batch)</span
            >
          </h3>
          {#if (item.batches?.length ?? 0) > 0}
            <div class="space-y-2">
              {#each (item.batches ?? []) as batch}
                {@const days = daysUntilExpiry(batch.expiredDate)}
                {@const exp = expiryBadge(batch)}
                <div
                  class="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 bg-gray-50"
                >
                  <div>
                    <p class="text-sm font-mono font-medium text-gray-900">
                      {batch.batchNumber}
                    </p>
                    <p class="text-xs text-gray-500 mt-0.5">
                      Expired: {formatDate(String(batch.expiredDate))}
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-semibold text-gray-900">
                      {batch.quantity}
                      {item.unit?.symbol ?? ""}
                    </p>
                    <div class="mt-1">
                      <Badge variant={exp.variant}>
                        {#if days < 0}{Math.abs(days)} hari lalu{:else if days === 0}Hari
                          ini{:else}{days} hari lagi{/if}
                      </Badge>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <p class="text-sm text-gray-400 text-center py-4">
              Tidak ada batch aktif
            </p>
          {/if}
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="flex gap-2 p-6 border-t border-gray-100">
        <a
          href="/inventory/stock-in?productId={item.id}"
          class="flex-1 text-center px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition"
        >
          + Stock In
        </a>
        <a
          href="/inventory/adjustment?productId={item.id}"
          class="flex-1 text-center px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Adjustment
        </a>
        <a
          href="/inventory/movements?productId={item.id}"
          class="flex-1 text-center px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Riwayat
        </a>
      </div>
    </div>
  </div>
{/if}
