import { fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import type { ApiResponse } from '@pharmapos/types'

const API_URL = process.env.API_URL || 'http://localhost:3000/api'

export const load: PageServerLoad = async ({ url }) => {
  const token = url.searchParams.get('token') ?? ''
  return { token }
}

export const actions: Actions = {
  default: async ({ request }) => {
    const form = await request.formData()
    const token = form.get('token') as string
    const password = form.get('password') as string
    const confirmPassword = form.get('confirmPassword') as string

    if (!token) return fail(400, { error: 'Token tidak valid' })
    if (!password || password.length < 8)
      return fail(400, { error: 'Password minimal 8 karakter' })
    if (password !== confirmPassword)
      return fail(400, { error: 'Konfirmasi password tidak cocok' })

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = (await res.json()) as ApiResponse

      if (!res.ok) return fail(res.status, { error: data.message || 'Gagal reset password' })
    } catch {
      return fail(500, { error: 'Gagal terhubung ke server' })
    }

    redirect(302, '/login')
  },
}
