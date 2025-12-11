export interface Product {
  id: string
  name: string
  sku: string
  category: string
  unit: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface InventoryItem {
  id: string
  productId: string
  product: Product
  quantity: number
  location: string
  minStock: number
  maxStock: number
  lastUpdated: string
}

export interface SupplyChainStatus {
  id: string
  orderId: string
  productId: string
  product: Product
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled'
  supplier: string
  quantity: number
  orderDate: string
  expectedDate: string
  actualDate?: string
  notes?: string
}

export interface WarehouseReport {
  id: string
  productId: string
  product: Product
  currentStock: number
  minStock: number
  maxStock: number
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstock'
  location: string
  lastMovement: string
}

export interface DashboardStats {
  totalProducts: number
  totalInventoryValue: number
  lowStockItems: number
  pendingOrders: number
  inTransitOrders: number
  deliveredOrders: number
}

export type Role = 'admin' | 'warehouse_manager' | 'warehouse_staff' | 'accountant'

export interface Permission {
  resource: string
  actions: string[]
}

export interface User {
  id: string
  username: string
  email: string
  fullName: string
  role: Role
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AuditLog {
  id: string
  userId: string
  user?: User
  action: string
  resource: string
  resourceId?: string
  details?: string
  ipAddress?: string
  userAgent?: string
  timestamp: string
}

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    { resource: '*', actions: ['*'] }, // Tất cả quyền
  ],
  warehouse_manager: [
    { resource: 'products', actions: ['read', 'create', 'update'] },
    { resource: 'inventory', actions: ['read', 'create', 'update'] },
    { resource: 'warehouse_reports', actions: ['read', 'export'] },
    { resource: 'supply_chain', actions: ['read', 'update'] },
    { resource: 'reports', actions: ['read', 'export'] },
    { resource: 'demand_forecast', actions: ['read', 'create', 'update'] },
  ],
  warehouse_staff: [
    { resource: 'products', actions: ['read'] },
    { resource: 'inventory', actions: ['read', 'update'] },
    { resource: 'warehouse_reports', actions: ['read'] },
    { resource: 'supply_chain', actions: ['read'] },
  ],
  accountant: [
    { resource: 'products', actions: ['read'] },
    { resource: 'inventory', actions: ['read'] },
    { resource: 'warehouse_reports', actions: ['read', 'export'] },
    { resource: 'supply_chain', actions: ['read'] },
    { resource: 'reports', actions: ['read', 'export'] },
    { resource: 'demand_forecast', actions: ['read'] },
  ],
}

// Thêm quyền audit_log cho admin
export const ROLE_PERMISSIONS_WITH_AUDIT: Record<Role, Permission[]> = {
  ...ROLE_PERMISSIONS,
  admin: [
    ...ROLE_PERMISSIONS.admin,
    { resource: 'audit_log', actions: ['read', 'export'] },
    { resource: 'users', actions: ['*'] },
  ],
  warehouse_manager: [
    ...ROLE_PERMISSIONS.warehouse_manager,
    { resource: 'audit_log', actions: ['read'] },
  ],
}

// Demand Forecasting Types
export type CustomerSegment = 'short_term' | 'long_term' | 'new'
export type CustomerType = 'vip' | 'regular' | 'potential'

export interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  company?: string
  address?: string
  customerType: CustomerType
  segment: CustomerSegment
  firstPurchaseDate: string
  lastPurchaseDate: string
  totalOrders: number
  totalSpent: number
  averageOrderValue: number
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  customerId: string
  customer?: Customer
  orderDate: string
  totalAmount: number
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  items: OrderItem[]
  notes?: string
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  product?: Product
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface ProductPrediction {
  productId: string
  product?: Product
  predictedDemand: number
  confidence: number // 0-1
  predictedCategories?: string[]
  predictedNextPurchase?: string // ISO date
}

export interface FutureProductPrediction {
  category: string
  predictedProducts: string[]
  confidence: number
  timeframe: 'short_term' | 'medium_term' | 'long_term'
  reasoning?: string
}

export interface DemandForecast {
  customerId: string
  customer?: Customer
  predictedProducts: ProductPrediction[]
  predictedServices: string[]
  confidenceScore: number
  nextPurchaseProbability: number
  predictedPurchaseDate?: string
  lastUpdated: string
}



