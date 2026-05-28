<script lang="ts">
  import '../app.css'
  import { currentUser } from '$lib/stores/auth'
  import { navigating } from '$app/stores'
  import type { LayoutData } from './$types'

  export let data: LayoutData

  $: currentUser.set(data.user ?? null)

  const loadingFavicon =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cstyle%3E%40keyframes s%7Bto%7Bstroke-dashoffset%3A0%7D%7Dpath%7Bstroke-dasharray%3A60%3Bstroke-dashoffset%3A60%3Banimation%3As 1s linear infinite%7D%3C%2Fstyle%3E%3Cpath fill='none' stroke='%234f46e5' stroke-width='3' stroke-linecap='round' d='M12 3a9 9 0 1 0 9 9'/%3E%3C%2Fsvg%3E"
</script>

<svelte:head>
  <link rel="icon" href={$navigating ? loadingFavicon : '/favicon.png'} />
</svelte:head>

{#if $navigating}
  <div class="loading-bar" aria-hidden="true"></div>
{/if}

<slot />

<style>
  .loading-bar {
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    width: 30%;
    background: #4f46e5;
    border-radius: 0 2px 2px 0;
    z-index: 9999;
    animation: slide 1.2s ease-in-out infinite;
  }

  @keyframes slide {
    0%   { left: -30%; width: 30%; }
    50%  { left: 40%; width: 40%; }
    100% { left: 110%; width: 30%; }
  }
</style>
