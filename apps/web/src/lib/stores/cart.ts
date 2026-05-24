import { writable } from 'svelte/store'

export interface CartItem {
  productId: string
  name: string
  code: string
  barcode: string | null
  price: number
  stock: number
  quantity: number
  unitSymbol: string
}

function createCart() {
  const { subscribe, set, update } = writable<CartItem[]>([])
  return {
    subscribe,
    add(product: Omit<CartItem, 'quantity'>) {
      update((items) => {
        const existing = items.find((i) => i.productId === product.productId)
        if (existing) {
          if (existing.quantity >= product.stock) return items
          return items.map((i) =>
            i.productId === product.productId ? { ...i, quantity: i.quantity + 1 } : i
          )
        }
        if (product.stock === 0) return items
        return [...items, { ...product, quantity: 1 }]
      })
    },
    updateQty(productId: string, quantity: number) {
      update((items) => {
        if (quantity <= 0) return items.filter((i) => i.productId !== productId)
        return items.map((i) => {
          if (i.productId !== productId) return i
          return { ...i, quantity: Math.min(quantity, i.stock) }
        })
      })
    },
    remove(productId: string) {
      update((items) => items.filter((i) => i.productId !== productId))
    },
    clear() {
      set([])
    },
  }
}

export const cart = createCart()
