import { fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import type { AuthResponse, ApiResponse } from '@pharmapos/types'

const API_URL = process.env.API_URL || 'http://localhost:3000/api'

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user) redirect(302, '/dashboard')
}

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const form = await request.formData()
    const email = form.get('email') as string
    const password = form.get('password') as string

    if (!email || !password) {
      return fail(400, { error: 'Email dan password wajib diisi' })
    }

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = (await res.json()) as ApiResponse<AuthResponse>

      if (!res.ok || !data.data) {
        return fail(res.status, { error: data.message || 'Login gagal' })
      }

      cookies.set('accessToken', data.data.accessToken, {
        path: '/',
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge: 60 * 15, // 15 menit
      })
    } catch {
      return fail(500, { error: 'Gagal terhubung ke server' })
    }

    redirect(302, '/dashboard')
  },
}
