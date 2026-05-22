// ─── Auth & User ─────────────────────────────────────────────────────────────

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
  isActive: boolean
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

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface AuthResponse {
  accessToken: string
  user: UserDto
}

export interface LoginRequest {
  email: string
  password: string
}

// ─── Category ────────────────────────────────────────────────────────────────

export interface CategoryDto {
  id: string
  name: string
  description: string | null
  createdAt: Date
  updatedAt: Date
}

// ─── Unit ────────────────────────────────────────────────────────────────────

export interface UnitDto {
  id: string
  name: string
  symbol: string
  createdAt: Date
  updatedAt: Date
}

// ─── Supplier ────────────────────────────────────────────────────────────────

export interface SupplierDto {
  id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// ─── Product ─────────────────────────────────────────────────────────────────

export interface ProductDto {
  id: string
  code: string
  barcode: string | null
  name: string
  categoryId: string
  supplierId: string | null
  unitId: string
  purchasePrice: number
  sellingPrice: number
  stock: number
  minimumStock: number
  productImage: string | null
  description: string | null
  isActive: boolean
  category?: CategoryDto
  supplier?: SupplierDto | null
  unit?: UnitDto
  createdAt: Date
  updatedAt: Date
}

// ─── Inventory / Phase 3 ─────────────────────────────────────────────────────

export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'OPNAME' | 'EXPIRED' | 'RETURN'

export interface ProductBatchDto {
  id: string
  productId: string
  batchNumber: string
  expiredDate: Date
  quantity: number
  product?: ProductDto
  createdAt: Date
}

export interface StockMovementDto {
  id: string
  productId: string
  batchId: string | null
  movementType: MovementType
  quantity: number
  beforeStock: number
  afterStock: number
  referenceType: string | null
  referenceId: string | null
  notes: string | null
  createdById: string
  product?: Pick<ProductDto, 'id' | 'code' | 'name'>
  batch?: Pick<ProductBatchDto, 'id' | 'batchNumber'> | null
  createdBy?: Pick<UserDto, 'id' | 'name'>
  createdAt: Date
}

export interface InventoryOverviewDto {
  totalProducts: number
  lowStockCount: number
  expiredCount: number
  nearExpiredCount: number
}

// ─── Setting ─────────────────────────────────────────────────────────────────

export interface SettingDto {
  id: string
  storeName: string
  storeLogo: string | null
  taxPercentage: number
  printerName: string | null
  autoPrint: boolean
  updatedAt: Date
}
