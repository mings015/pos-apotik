import { fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import type { ApiResponse, SettingDto } from '@pharmapos/types'
import { serverFetch } from '$api/server'

export const load: PageServerLoad = async ({ locals }) => {
  const data = await serverFetch<ApiResponse<SettingDto>>('/settings', locals.accessToken)
  return { setting: data.data ?? null }
}

export const actions: Actions = {
  update: async ({ request, locals }) => {
    const form = await request.formData()
    const body = {
      storeName: form.get('storeName'),
      taxPercentage: Number(form.get('taxPercentage')),
      printerName: form.get('printerName') || undefined,
      autoPrint: form.get('autoPrint') === 'true',
    }

    const res = await serverFetch<ApiResponse>('/settings', locals.accessToken, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })

    if (!res.success) return fail(400, { error: res.message })
    return { success: true, message: res.message }
  },
}
