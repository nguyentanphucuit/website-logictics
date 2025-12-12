import { create } from 'zustand'
import { Product, InventoryItem, SupplyChainStatus, WarehouseReport, DashboardStats } from '@/types'

interface DataStore {
  products: Product[]
  inventory: InventoryItem[]
  supplyChain: SupplyChainStatus[]
  
  // Actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateProduct: (id: string, product: Partial<Product>) => void
  deleteProduct: (id: string) => void
  
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => void
  updateInventoryItem: (id: string, item: Partial<InventoryItem>) => void
  
  addSupplyChainStatus: (status: Omit<SupplyChainStatus, 'id'>) => void
  updateSupplyChainStatus: (id: string, status: Partial<SupplyChainStatus>) => void
  
  getWarehouseReports: () => WarehouseReport[]
  getDashboardStats: () => DashboardStats
}

// Mock data
const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Laptop Dell XPS 15',
    sku: 'LAP-DELL-XPS15-001',
    category: 'Điện tử',
    unit: 'cái',
    description: 'Laptop hiệu năng cao cho công việc văn phòng',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Ghế văn phòng Ergonomic',
    sku: 'FUR-CHAIR-ERG-001',
    category: 'Nội thất',
    unit: 'cái',
    description: 'Ghế văn phòng ergonomic thoải mái',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Giấy in A4',
    sku: 'SUP-PAPER-A4-001',
    category: 'Văn phòng phẩm',
    unit: 'ram',
    description: 'Giấy in A4 tiêu chuẩn',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const initialInventory: InventoryItem[] = [
  {
    id: '1',
    productId: '1',
    product: initialProducts[0],
    quantity: 25,
    location: 'Kho A - Khu vực 1',
    minStock: 10,
    maxStock: 100,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '2',
    productId: '2',
    product: initialProducts[1],
    quantity: 5,
    location: 'Kho A - Khu vực 2',
    minStock: 10,
    maxStock: 50,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '3',
    productId: '3',
    product: initialProducts[2],
    quantity: 150,
    location: 'Kho B - Khu vực 1',
    minStock: 50,
    maxStock: 500,
    lastUpdated: new Date().toISOString(),
  },
]

const initialSupplyChain: SupplyChainStatus[] = [
  {
    id: '1',
    orderId: 'ORD-001',
    productId: '1',
    product: initialProducts[0],
    status: 'in_transit',
    supplier: 'Dell Technologies',
    quantity: 50,
    orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    expectedDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Dự kiến giao hàng trong 2 ngày',
    originLocation: {
      lat: 10.8231,
      lng: 106.6297,
      address: 'TP. Hồ Chí Minh',
    },
    destinationLocation: {
      lat: 21.0285,
      lng: 105.8542,
      address: 'Hà Nội',
    },
    currentLocation: {
      lat: 15.9265,
      lng: 108.2307,
      address: 'Đang vận chuyển',
    },
    progress: 45,
    estimatedTimeRemaining: 36,
  },
  {
    id: '2',
    orderId: 'ORD-002',
    productId: '2',
    product: initialProducts[1],
    status: 'delivered',
    supplier: 'Công ty Nội thất Văn phòng',
    quantity: 20,
    orderDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    expectedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    actualDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Giao hàng đúng hạn',
    originLocation: {
      lat: 10.8231,
      lng: 106.6297,
      address: 'TP. Hồ Chí Minh',
    },
    destinationLocation: {
      lat: 20.8449,
      lng: 106.6881,
      address: 'Hải Phòng',
    },
    progress: 100,
  },
  {
    id: '3',
    orderId: 'ORD-003',
    productId: '3',
    product: initialProducts[2],
    status: 'pending',
    supplier: 'Công ty Văn phòng phẩm',
    quantity: 200,
    orderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Đang chờ xác nhận',
    originLocation: {
      lat: 16.0544,
      lng: 108.2022,
      address: 'Đà Nẵng',
    },
    destinationLocation: {
      lat: 10.8231,
      lng: 106.6297,
      address: 'TP. Hồ Chí Minh',
    },
    progress: 0,
    estimatedTimeRemaining: 168,
  },
]

export const useDataStore = create<DataStore>((set, get) => ({
  products: initialProducts,
  inventory: initialInventory,
  supplyChain: initialSupplyChain,
  
  addProduct: (productData) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    set((state) => ({
      products: [...state.products, newProduct],
    }))
  },
  
  updateProduct: (id, productData) => {
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, ...productData, updatedAt: new Date().toISOString() } : p
      ),
    }))
  },
  
  deleteProduct: (id) => {
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
      inventory: state.inventory.filter((i) => i.productId !== id),
      supplyChain: state.supplyChain.filter((s) => s.productId !== id),
    }))
  },
  
  addInventoryItem: (itemData) => {
    const product = get().products.find((p) => p.id === itemData.productId)
    if (!product) return
    
    const newItem: InventoryItem = {
      ...itemData,
      id: Date.now().toString(),
      product,
      lastUpdated: new Date().toISOString(),
    }
    set((state) => ({
      inventory: [...state.inventory, newItem],
    }))
  },
  
  updateInventoryItem: (id, itemData) => {
    set((state) => ({
      inventory: state.inventory.map((i) =>
        i.id === id
          ? {
              ...i,
              ...itemData,
              lastUpdated: new Date().toISOString(),
            }
          : i
      ),
    }))
  },
  
  addSupplyChainStatus: (statusData) => {
    const product = get().products.find((p) => p.id === statusData.productId)
    if (!product) return
    
    const newStatus: SupplyChainStatus = {
      ...statusData,
      id: Date.now().toString(),
      product,
    }
    set((state) => ({
      supplyChain: [...state.supplyChain, newStatus],
    }))
  },
  
  updateSupplyChainStatus: (id, statusData) => {
    set((state) => ({
      supplyChain: state.supplyChain.map((s) =>
        s.id === id ? { ...s, ...statusData } : s
      ),
    }))
  },
  
  getWarehouseReports: () => {
    const state = get()
    return state.inventory.map((item) => {
      let status: WarehouseReport['status']
      if (item.quantity === 0) {
        status = 'out_of_stock'
      } else if (item.quantity < item.minStock) {
        status = 'low_stock'
      } else if (item.quantity > item.maxStock) {
        status = 'overstock'
      } else {
        status = 'in_stock'
      }
      
      return {
        id: item.id,
        productId: item.productId,
        product: item.product,
        currentStock: item.quantity,
        minStock: item.minStock,
        maxStock: item.maxStock,
        status,
        location: item.location,
        lastMovement: item.lastUpdated,
      }
    })
  },
  
  getDashboardStats: () => {
    const state = get()
    const reports = state.getWarehouseReports()
    
    return {
      totalProducts: state.products.length,
      totalInventoryValue: state.inventory.reduce((sum, item) => sum + item.quantity, 0),
      lowStockItems: reports.filter((r) => r.status === 'low_stock' || r.status === 'out_of_stock').length,
      pendingOrders: state.supplyChain.filter((s) => s.status === 'pending').length,
      inTransitOrders: state.supplyChain.filter((s) => s.status === 'in_transit').length,
      deliveredOrders: state.supplyChain.filter((s) => s.status === 'delivered').length,
    }
  },
}))


