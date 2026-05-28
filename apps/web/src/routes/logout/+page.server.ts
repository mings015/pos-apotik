import { redirect } from '@sveltejs/kit'
import type { Actions } from './$types'

const API_URL = process.env.API_URL || 'http://localhost:3000/api'

export const actions: Actions = {
  default: async ({ cookies }) => {
    const token = cookies.get('accessToken')

    if (token) {
      try {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        })
      } catch {
        // Tetap hapus cookie meski server error
      }
    }

    cookies.delete('accessToken', { path: '/', sameSite: 'none', secure: true })
    redirect(302, '/login')
  },
}
