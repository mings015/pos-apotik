import adapter from '@sveltejs/adapter-node'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    alias: {
      $components: 'src/components',
      $stores: 'src/lib/stores',
      $api: 'src/lib/api',
      '@pharmapos/types': '../../packages/types/src/index.ts',
    },
  },
}
