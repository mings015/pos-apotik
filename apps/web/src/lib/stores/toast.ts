import { writable } from 'svelte/store'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
}

export const toasts = writable<Toast[]>([])

export function addToast(type: ToastType, message: string, duration = 4000) {
  const id = crypto.randomUUID()
  toasts.update((all) => [...all, { id, type, message }])
  setTimeout(() => removeToast(id), duration)
}

export function removeToast(id: string) {
  toasts.update((all) => all.filter((t) => t.id !== id))
}

export const toast = {
  success: (msg: string) => addToast('success', msg),
  error: (msg: string) => addToast('error', msg),
  warning: (msg: string) => addToast('warning', msg),
  info: (msg: string) => addToast('info', msg),
}
