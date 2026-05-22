<script lang="ts">
  import '../app.css'
  import { currentUser } from '$lib/stores/auth'
  import type { LayoutData } from './$types'

  export let data: LayoutData

  $: currentUser.set(data.user ?? null)
</script>

<slot />
