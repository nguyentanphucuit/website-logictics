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



