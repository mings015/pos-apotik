import type { UserDto } from '@pharmapos/types'

declare global {
  namespace App {
    interface Locals {
      user: UserDto | null
      accessToken: string | null
    }
    interface PageData {
      user?: UserDto | null
    }
  }
}

export {}
