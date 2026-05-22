import { writable } from 'svelte/store'
import type { UserDto } from '@pharmapos/types'

export const currentUser = writable<UserDto | null>(null)
