import { fail } from '@sveltejs/kit'
import type { Actions } from './$types'
import type { ApiResponse } from '@pharmapos/types'

const API_URL = process.env.API_URL || 'http://localhost:3000/api'

export const actions: Actions = {
  default: async ({ request }) => {
    const form = await request.formData()
    const email = form.get('email') as string

    if (!email) return fail(400, { error: 'Email wajib diisi' })

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = (await res.json()) as ApiResponse<{ token: string }>

      if (!res.ok) return fail(res.status, { error: data.message || 'Gagal mengirim permintaan' })

      return { success: true, token: data.data?.token }
    } catch {
      return fail(500, { error: 'Gagal terhubung ke server' })
    }
  },
}
