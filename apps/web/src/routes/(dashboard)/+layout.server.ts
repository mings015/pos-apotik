import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'
import { serverFetch } from '$api/server'

export const load: LayoutServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(302, '/login')
  let storeName = 'PharmaPOS'
  let autoPrint = false
  let storeAddress = ''
  let paperWidth = '80mm'
  let receiptFooter = 'Terima kasih sudah berbelanja!'
  try {
    const res = await serverFetch<{
      success: boolean
      data?: {
        storeName?: string
        autoPrint?: boolean
        storeAddress?: string
        paperWidth?: string
        receiptFooter?: string
      }
    }>('/settings', locals.accessToken)
    if (res.data?.storeName) storeName = res.data.storeName
    if (res.data?.autoPrint) autoPrint = res.data.autoPrint
    if (res.data?.storeAddress) storeAddress = res.data.storeAddress
    if (res.data?.paperWidth) paperWidth = res.data.paperWidth
    if (res.data?.receiptFooter) receiptFooter = res.data.receiptFooter
  } catch {
    // keep defaults
  }
  return { user: locals.user, storeName, autoPrint, storeAddress, paperWidth, receiptFooter }
}
