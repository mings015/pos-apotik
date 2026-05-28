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
  storeAddress: string | null
  paperWidth: string | null
  receiptFooter: string | null
  updatedAt: Date
}

// ─── Sales / Phase 4 ─────────────────────────────────────────────────────────

export type SaleStatus = 'HOLD' | 'COMPLETED' | 'CANCELLED'

export interface SaleItemDto {
  id: string
  saleId: string
  productId: string
  quantity: number
  price: number
  discount: number
  subtotal: number
  product?: Pick<ProductDto, 'id' | 'name' | 'code'> & { unit?: Pick<UnitDto, 'name' | 'symbol'> }
}

export interface SaleDto {
  id: string
  invoiceNumber: string
  cashierId: string
  subtotal: number
  discount: number
  tax: number
  total: number
  paymentMethod: string | null
  amountPaid: number | null
  change: number | null
  status: SaleStatus
  notes: string | null
  cashier?: Pick<UserDto, 'id' | 'name'>
  items?: SaleItemDto[]
  createdAt: Date
  updatedAt: Date
}

// ─── Purchase Management / Phase 5 ───────────────────────────────────────────

export type PurchaseOrderStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'RECEIVED' | 'CANCELLED'
export type InvoicePaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID'

export interface PurchaseOrderItemDto {
  id: string
  purchaseOrderId: string
  productId: string
  quantity: number
  purchasePrice: number
  subtotal: number
  product?: Pick<ProductDto, 'id' | 'name' | 'code'> & { unit?: Pick<UnitDto, 'symbol'> }
}

export interface PurchaseOrderDto {
  id: string
  poNumber: string
  supplierId: string
  subtotal: number
  tax: number
  discount: number
  total: number
  status: PurchaseOrderStatus
  notes: string | null
  createdById: string
  supplier?: Pick<SupplierDto, 'id' | 'name'>
  createdBy?: Pick<UserDto, 'id' | 'name'>
  items?: PurchaseOrderItemDto[]
  invoice?: Pick<SupplierInvoiceDto, 'id' | 'invoiceNumber' | 'paymentStatus' | 'totalAmount' | 'paidAmount'>
  _count?: { items: number }
  createdAt: Date
  updatedAt: Date
}

export interface GoodsReceivingItemDto {
  id: string
  goodsReceivingId: string
  productId: string
  batchId: string
  quantity: number
  purchasePrice: number
  product?: Pick<ProductDto, 'id' | 'name' | 'code'>
  batch?: Pick<ProductBatchDto, 'id' | 'batchNumber' | 'expiredDate'>
}

export interface GoodsReceivingDto {
  id: string
  purchaseOrderId: string
  receivedById: string
  notes: string | null
  items?: GoodsReceivingItemDto[]
  receivedBy?: Pick<UserDto, 'id' | 'name'>
  createdAt: Date
}

export interface SupplierPaymentDto {
  id: string
  supplierInvoiceId: string
  amount: number
  paymentMethod: string
  paymentDate: Date
  notes: string | null
  createdById: string
  createdBy?: Pick<UserDto, 'id' | 'name'>
  createdAt: Date
}

export interface SupplierInvoiceDto {
  id: string
  purchaseOrderId: string
  invoiceNumber: string
  totalAmount: number
  paidAmount: number
  dueDate: Date | null
  paymentStatus: InvoicePaymentStatus
  notes: string | null
  purchaseOrder?: Pick<PurchaseOrderDto, 'id' | 'poNumber'> & { supplier?: Pick<SupplierDto, 'id' | 'name'> }
  payments?: SupplierPaymentDto[]
  createdAt: Date
  updatedAt: Date
}

export interface PurchaseReturnItemDto {
  id: string
  purchaseReturnId: string
  productId: string
  batchId: string
  quantity: number
  product?: Pick<ProductDto, 'id' | 'name' | 'code'>
  batch?: Pick<ProductBatchDto, 'id' | 'batchNumber'>
}

export interface PurchaseReturnDto {
  id: string
  returnNumber: string
  supplierInvoiceId: string
  reason: string
  notes: string | null
  createdById: string
  items?: PurchaseReturnItemDto[]
  supplierInvoice?: Pick<SupplierInvoiceDto, 'id' | 'invoiceNumber'> & {
    purchaseOrder?: Pick<PurchaseOrderDto, 'id' | 'poNumber'> & { supplier?: Pick<SupplierDto, 'id' | 'name'> }
  }
  createdBy?: Pick<UserDto, 'id' | 'name'>
  createdAt: Date
}
