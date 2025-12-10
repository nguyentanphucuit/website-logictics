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


