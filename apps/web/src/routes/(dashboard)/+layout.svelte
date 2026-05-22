<script lang="ts">
  import Sidebar from '$components/layout/Sidebar.svelte'
  import Header from '$components/layout/Header.svelte'

  let collapsed = false

  function toggleSidebar() {
    collapsed = !collapsed
  }
</script>

<div class="flex h-screen bg-gray-50 overflow-hidden">
  <Sidebar {collapsed} />

  <div class="flex flex-col flex-1 min-w-0">
    <Header onToggleSidebar={toggleSidebar} />

    <main class="flex-1 overflow-y-auto p-6">
      <slot />
    </main>
  </div>
</div>
