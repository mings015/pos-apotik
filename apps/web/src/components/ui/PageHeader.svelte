<script lang="ts">
  export let title: string
  export let description: string = ''
</script>

<div class="flex items-start justify-between">
  <div>
    <h1 class="text-2xl font-bold text-gray-900">{title}</h1>
    {#if description}
      <p class="text-gray-500 mt-1 text-sm">{description}</p>
    {/if}
  </div>
  <slot />
</div>
