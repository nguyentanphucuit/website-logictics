import { create } from 'zustand'
import {
  Customer,
  Order,
  OrderItem,
  Product,
  ProductPrediction,
  FutureProductPrediction,
  DemandForecast,
  CustomerSegment,
  CustomerType,
} from '@/types'
import { useDataStore } from './dataStore'

interface DemandForecastStore {
  customers: Customer[]
  orders: Order[]
  
  // Actions
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'segment' | 'totalOrders' | 'totalSpent' | 'averageOrderValue' | 'firstPurchaseDate' | 'lastPurchaseDate'>) => Customer
  updateCustomer: (id: string, customer: Partial<Customer>) => void
  deleteCustomer: (id: string) => void
  
  addOrder: (order: Omit<Order, 'id'>) => Order
  updateOrder: (id: string, order: Partial<Order>) => void
  deleteOrder: (id: string) => void
  
  // Prediction functions
  classifyCustomer: (customerId: string) => CustomerSegment
  predictFutureProducts: (customerId: string) => ProductPrediction[]
  predictFutureServices: (customerId: string) => string[]
  getDemandForecast: (customerId: string) => DemandForecast | null
  getAllDemandForecasts: () => DemandForecast[]
  
  // Customer segmentation
  getPotentialCustomers: () => Customer[]
  getShortTermCustomers: () => Customer[]
  getLongTermCustomers: () => Customer[]
  
  // Future product predictions
  predictNewProductTypes: () => FutureProductPrediction[]
  
  // Auto-trigger prediction when order is created
  onOrderCreated: (order: Order) => void
}

// Helper function to calculate days between dates
const daysBetween = (date1: string, date2: string): number => {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24))
}

// Helper function to calculate customer lifetime
const calculateCustomerLifetime = (firstPurchase: string, lastPurchase: string): number => {
  return daysBetween(firstPurchase, lastPurchase)
}

// Initial mock data
const initialCustomers: Customer[] = [
  {
    id: '1',
    name: 'Công ty ABC',
    email: 'contact@abc.com',
    phone: '0123456789',
    company: 'Công ty ABC',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    customerType: 'vip',
    segment: 'long_term',
    firstPurchaseDate: new Date(Date.now() - 365 * 2 * 24 * 60 * 60 * 1000).toISOString(),
    lastPurchaseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    totalOrders: 45,
    totalSpent: 50000000,
    averageOrderValue: 1111111,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Công ty XYZ',
    email: 'info@xyz.com',
    phone: '0987654321',
    company: 'Công ty XYZ',
    address: '456 Đường XYZ, Quận 3, TP.HCM',
    customerType: 'regular',
    segment: 'short_term',
    firstPurchaseDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    lastPurchaseDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    totalOrders: 3,
    totalSpent: 5000000,
    averageOrderValue: 1666667,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@email.com',
    phone: '0912345678',
    customerType: 'potential',
    segment: 'new',
    firstPurchaseDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    lastPurchaseDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    totalOrders: 1,
    totalSpent: 2000000,
    averageOrderValue: 2000000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// Initial mock orders
const initialOrders: Order[] = [
  {
    id: '1',
    customerId: '1',
    orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    totalAmount: 5000000,
    status: 'completed',
    items: [
      {
        id: '1',
        orderId: '1',
        productId: '1',
        quantity: 2,
        unitPrice: 2500000,
        totalPrice: 5000000,
      },
    ],
  },
  {
    id: '2',
    customerId: '2',
    orderDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    totalAmount: 3000000,
    status: 'completed',
    items: [
      {
        id: '2',
        orderId: '2',
        productId: '2',
        quantity: 1,
        unitPrice: 3000000,
        totalPrice: 3000000,
      },
    ],
  },
  {
    id: '3',
    customerId: '3',
    orderDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    totalAmount: 2000000,
    status: 'completed',
    items: [
      {
        id: '3',
        orderId: '3',
        productId: '3',
        quantity: 10,
        unitPrice: 200000,
        totalPrice: 2000000,
      },
    ],
  },
]

export const useDemandForecastStore = create<DemandForecastStore>((set, get) => ({
  customers: initialCustomers,
  orders: initialOrders,
  
  addCustomer: (customerData) => {
    const newCustomer: Customer = {
      ...customerData,
      id: Date.now().toString(),
      segment: 'new',
      totalOrders: 0,
      totalSpent: 0,
      averageOrderValue: 0,
      firstPurchaseDate: new Date().toISOString(),
      lastPurchaseDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    set((state) => ({
      customers: [...state.customers, newCustomer],
    }))
    return newCustomer
  },
  
  updateCustomer: (id, customerData) => {
    set((state) => ({
      customers: state.customers.map((c) =>
        c.id === id ? { ...c, ...customerData, updatedAt: new Date().toISOString() } : c
      ),
    }))
    // Reclassify customer after update
    get().classifyCustomer(id)
  },
  
  deleteCustomer: (id) => {
    set((state) => ({
      customers: state.customers.filter((c) => c.id !== id),
      orders: state.orders.filter((o) => o.customerId !== id),
    }))
  },
  
  addOrder: (orderData) => {
    const newOrder: Order = {
      ...orderData,
      id: Date.now().toString(),
    }
    
    set((state) => ({
      orders: [...state.orders, newOrder],
    }))
    
    // Auto-trigger prediction and customer update
    get().onOrderCreated(newOrder)
    
    return newOrder
  },
  
  updateOrder: (id, orderData) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === id ? { ...o, ...orderData } : o
      ),
    }))
  },
  
  deleteOrder: (id) => {
    const order = get().orders.find((o) => o.id === id)
    if (order) {
      const customer = get().customers.find((c) => c.id === order.customerId)
      if (customer) {
        // Recalculate customer stats
        const customerOrders = get().orders.filter((o) => o.customerId === order.customerId && o.id !== id)
        const totalSpent = customerOrders.reduce((sum, o) => sum + o.totalAmount, 0)
        const totalOrders = customerOrders.length
        const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0
        
        const firstPurchase = customerOrders.length > 0
          ? customerOrders.reduce((earliest, o) => 
              new Date(o.orderDate) < new Date(earliest.orderDate) ? o : earliest
            ).orderDate
          : customer.firstPurchaseDate
        
        const lastPurchase = customerOrders.length > 0
          ? customerOrders.reduce((latest, o) => 
              new Date(o.orderDate) > new Date(latest.orderDate) ? o : latest
            ).orderDate
          : customer.lastPurchaseDate
        
        get().updateCustomer(order.customerId, {
          totalOrders,
          totalSpent,
          averageOrderValue: avgOrderValue,
          firstPurchaseDate: firstPurchase,
          lastPurchaseDate: lastPurchase,
        })
      }
    }
    
    set((state) => ({
      orders: state.orders.filter((o) => o.id !== id),
    }))
  },
  
  classifyCustomer: (customerId) => {
    const customer = get().customers.find((c) => c.id === customerId)
    if (!customer) return 'new'
    
    const lifetime = calculateCustomerLifetime(
      customer.firstPurchaseDate,
      customer.lastPurchaseDate
    )
    const daysSinceLastPurchase = daysBetween(customer.lastPurchaseDate, new Date().toISOString())
    
    let segment: CustomerSegment = 'new'
    
    if (customer.totalOrders === 1 && daysSinceLastPurchase < 30) {
      segment = 'new'
    } else if (lifetime > 365 && customer.totalOrders > 10) {
      segment = 'long_term' // Khách hàng dài hạn
    } else if (daysSinceLastPurchase < 90 && customer.totalOrders > 3) {
      segment = 'short_term' // Khách hàng ngắn hạn nhưng đang tích cực
    } else if (daysSinceLastPurchase < 180) {
      segment = 'short_term' // Khách hàng ngắn hạn
    } else {
      segment = customer.totalOrders > 5 ? 'long_term' : 'short_term'
    }
    
    get().updateCustomer(customerId, { segment })
    return segment
  },
  
  predictFutureProducts: (customerId) => {
    const customer = get().customers.find((c) => c.id === customerId)
    if (!customer) return []
    
    const customerOrders = get().orders.filter((o) => o.customerId === customerId)
    const products = useDataStore.getState().products
    
    // Analyze purchase patterns
    const productFrequency: Record<string, number> = {}
    const categoryFrequency: Record<string, number> = {}
    
    customerOrders.forEach((order) => {
      order.items.forEach((item) => {
        const productId = item.productId
        const product = products.find((p) => p.id === productId)
        
        if (product) {
          productFrequency[productId] = (productFrequency[productId] || 0) + item.quantity
          categoryFrequency[product.category] = (categoryFrequency[product.category] || 0) + 1
        }
      })
    })
    
    // Find most frequent category
    const topCategory = Object.entries(categoryFrequency).sort((a, b) => b[1] - a[1])[0]?.[0]
    
    // Predict products in same category that customer hasn't bought
    const purchasedProductIds = Object.keys(productFrequency)
    const predictedProducts: ProductPrediction[] = []
    
    products
      .filter((p) => !purchasedProductIds.includes(p.id) && p.category === topCategory)
      .slice(0, 5)
      .forEach((product) => {
        const confidence = topCategory ? 0.7 : 0.4
        predictedProducts.push({
          productId: product.id,
          product,
          predictedDemand: customer.averageOrderValue > 0 
            ? Math.ceil(customer.averageOrderValue / 1000000) // Simplified prediction
            : 1,
          confidence,
          predictedCategories: [product.category],
          predictedNextPurchase: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
      })
    
    // Also predict based on complementary products
    if (customerOrders.length > 0) {
      const lastOrder = customerOrders.sort((a, b) => 
        new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
      )[0]
      
      lastOrder.items.forEach((item) => {
        const product = products.find((p) => p.id === item.productId)
        if (product && product.category) {
          // Find complementary products
          const complementary = products.filter((p) => 
            p.id !== item.productId && 
            !purchasedProductIds.includes(p.id) &&
            (p.category === product.category || 
             (product.category === 'Điện tử' && p.category === 'Phụ kiện') ||
             (product.category === 'Nội thất' && p.category === 'Văn phòng phẩm'))
          ).slice(0, 2)
          
          complementary.forEach((compProduct) => {
            if (!predictedProducts.find((pp) => pp.productId === compProduct.id)) {
              predictedProducts.push({
                productId: compProduct.id,
                product: compProduct,
                predictedDemand: 1,
                confidence: 0.5,
                predictedCategories: [compProduct.category],
              })
            }
          })
        }
      })
    }
    
    return predictedProducts.slice(0, 10)
  },
  
  predictFutureServices: (customerId) => {
    const customer = get().customers.find((c) => c.id === customerId)
    if (!customer) return []
    
    const customerOrders = get().orders.filter((o) => o.customerId === customerId)
    const services: string[] = []
    
    // Analyze customer behavior to predict services
    if (customer.totalOrders > 10) {
      services.push('Dịch vụ bảo hành mở rộng')
      services.push('Dịch vụ tư vấn chuyên sâu')
    }
    
    if (customer.averageOrderValue > 5000000) {
      services.push('Dịch vụ giao hàng nhanh')
      services.push('Dịch vụ lắp đặt chuyên nghiệp')
    }
    
    const lastOrder = customerOrders.sort((a, b) => 
      new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
    )[0]
    
    if (lastOrder) {
      const daysSinceLastOrder = daysBetween(lastOrder.orderDate, new Date().toISOString())
      if (daysSinceLastOrder > 60) {
        services.push('Dịch vụ bảo trì định kỳ')
      }
    }
    
    // Add category-based services
    customerOrders.forEach((order) => {
      order.items.forEach((item) => {
        const product = useDataStore.getState().products.find((p) => p.id === item.productId)
        if (product) {
          if (product.category === 'Điện tử' && !services.includes('Dịch vụ sửa chữa')) {
            services.push('Dịch vụ sửa chữa')
          }
          if (product.category === 'Nội thất' && !services.includes('Dịch vụ lắp đặt')) {
            services.push('Dịch vụ lắp đặt')
          }
        }
      })
    })
    
    return services
  },
  
  getDemandForecast: (customerId) => {
    const customer = get().customers.find((c) => c.id === customerId)
    if (!customer) return null
    
    const predictedProducts = get().predictFutureProducts(customerId)
    const predictedServices = get().predictFutureServices(customerId)
    
    const avgConfidence = predictedProducts.length > 0
      ? predictedProducts.reduce((sum, p) => sum + p.confidence, 0) / predictedProducts.length
      : 0
    
    const daysSinceLastPurchase = daysBetween(customer.lastPurchaseDate, new Date().toISOString())
    const avgPurchaseInterval = customer.totalOrders > 1
      ? calculateCustomerLifetime(customer.firstPurchaseDate, customer.lastPurchaseDate) / customer.totalOrders
      : 30
    
    const nextPurchaseProbability = daysSinceLastPurchase < avgPurchaseInterval * 2 ? 0.7 : 0.3
    
    const predictedPurchaseDate = new Date(
      Date.now() + avgPurchaseInterval * 24 * 60 * 60 * 1000
    ).toISOString()
    
    return {
      customerId,
      customer,
      predictedProducts,
      predictedServices,
      confidenceScore: avgConfidence,
      nextPurchaseProbability,
      predictedPurchaseDate,
      lastUpdated: new Date().toISOString(),
    }
  },
  
  getAllDemandForecasts: () => {
    return get().customers.map((customer) => get().getDemandForecast(customer.id)!).filter(Boolean)
  },
  
  getPotentialCustomers: () => {
    return get().customers.filter((c) => 
      c.segment === 'new' || 
      (c.totalOrders >= 1 && c.totalOrders <= 3) ||
      c.customerType === 'potential'
    )
  },
  
  getShortTermCustomers: () => {
    return get().customers.filter((c) => c.segment === 'short_term')
  },
  
  getLongTermCustomers: () => {
    return get().customers.filter((c) => c.segment === 'long_term')
  },
  
  predictNewProductTypes: (): FutureProductPrediction[] => {
    const orders = get().orders
    const products = useDataStore.getState().products
    const customers = get().customers
    
    // Analyze trends
    const categoryTrends: Record<string, number> = {}
    const emergingCategories: Record<string, number> = {}
    
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const product = products.find((p) => p.id === item.productId)
        if (product) {
          categoryTrends[product.category] = (categoryTrends[product.category] || 0) + item.quantity
        }
      })
    })
    
    // Find popular categories
    const popularCategories = Object.entries(categoryTrends)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat)
    
    const predictions: FutureProductPrediction[] = []
    
    // Predict new product types based on trends
    popularCategories.forEach((category) => {
      const relatedCategories: Record<string, string[]> = {
        'Điện tử': ['Phụ kiện điện tử', 'Thiết bị IoT', 'Smart Home'],
        'Nội thất': ['Nội thất thông minh', 'Nội thất bền vững', 'Thiết bị văn phòng hiện đại'],
        'Văn phòng phẩm': ['Văn phòng phẩm thông minh', 'Vật dụng tái chế', 'Công cụ số hóa'],
        'Thực phẩm & Đồ uống': ['Thực phẩm hữu cơ', 'Đồ uống lành mạnh', 'Snack tốt cho sức khỏe'],
      }
      
      const suggestedProducts = relatedCategories[category] || []
      
      if (suggestedProducts.length > 0) {
        predictions.push({
          category,
          predictedProducts: suggestedProducts,
          confidence: 0.75,
          timeframe: 'medium_term',
          reasoning: `Dựa trên xu hướng mua hàng của danh mục ${category}`,
        })
      }
    })
    
    // Predict based on customer segments
    const longTermCustomers = get().getLongTermCustomers()
    if (longTermCustomers.length > 0) {
      const avgOrderValue = longTermCustomers.reduce((sum, c) => sum + c.averageOrderValue, 0) / longTermCustomers.length
      
      if (avgOrderValue > 5000000) {
        predictions.push({
          category: 'Dịch vụ cao cấp',
          predictedProducts: [
            'Dịch vụ tư vấn chuyên sâu',
            'Gói dịch vụ premium',
            'Hỗ trợ 24/7',
          ],
          confidence: 0.8,
          timeframe: 'short_term',
          reasoning: 'Nhu cầu từ khách hàng dài hạn có giá trị đơn hàng cao',
        })
      }
    }
    
    // Predict emerging trends
    const newCustomers = get().getPotentialCustomers()
    if (newCustomers.length > 5) {
      predictions.push({
        category: 'Sản phẩm cho khách hàng mới',
        predictedProducts: [
          'Gói khởi đầu',
          'Sản phẩm giới thiệu',
          'Chương trình ưu đãi',
        ],
        confidence: 0.7,
        timeframe: 'short_term',
        reasoning: 'Số lượng khách hàng mới đang tăng',
      })
    }
    
    return predictions
  },
  
  onOrderCreated: (order) => {
    const customer = get().customers.find((c) => c.id === order.customerId)
    if (!customer) return
    
    // Update customer statistics
    // Note: order has already been added to state, so we use all customer orders
    const customerOrders = get().orders.filter((o) => o.customerId === order.customerId)
    const totalOrders = customerOrders.length
    const totalSpent = customerOrders.reduce((sum, o) => sum + o.totalAmount, 0)
    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0
    
    const firstPurchase = customer.firstPurchaseDate && customer.totalOrders > 0
      ? customer.firstPurchaseDate
      : order.orderDate
    
    get().updateCustomer(order.customerId, {
      totalOrders,
      totalSpent,
      averageOrderValue: avgOrderValue,
      firstPurchaseDate: firstPurchase,
      lastPurchaseDate: order.orderDate,
    })
    
    // Reclassify customer
    get().classifyCustomer(order.customerId)
  },
}))
