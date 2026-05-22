export type RoleName = 'SUPER_ADMIN' | 'ADMIN' | 'CASHIER' | 'WAREHOUSE'

export interface RoleDto {
  id: string
  name: RoleName
  createdAt: Date
  updatedAt: Date
}

export interface UserDto {
  id: string
  name: string
  email: string
  roleId: string
  role?: RoleDto
  createdAt: Date
  updatedAt: Date
}

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  errors?: Array<{ field: string; message: string }>
}

export interface AuthResponse {
  accessToken: string
  user: UserDto
}

export interface LoginRequest {
  email: string
  password: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
}
