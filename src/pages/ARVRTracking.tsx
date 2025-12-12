import { useState, useEffect } from 'react'
import { useDataStore } from '@/store/dataStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Truck,
  MapPin,
  Package,
  Navigation,
  Eye,
  Maximize2,
  Clock,
  Laptop,
  FileText,
  Sofa,
} from 'lucide-react'
import { format } from 'date-fns'

// Mock locations for Vietnam
const LOCATIONS = {
  hanoi: { lat: 21.0285, lng: 105.8542, address: 'Hà Nội' },
  hoChiMinh: { lat: 10.8231, lng: 106.6297, address: 'TP. Hồ Chí Minh' },
  daNang: { lat: 16.0544, lng: 108.2022, address: 'Đà Nẵng' },
  haiPhong: { lat: 20.8449, lng: 106.6881, address: 'Hải Phòng' },
  canTho: { lat: 10.0452, lng: 105.7469, address: 'Cần Thơ' },
}

export default function ARVRTracking() {
  const supplyChain = useDataStore((state) => state.supplyChain)
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'2d' | '3d' | 'ar'>('3d')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [animatedProgress, setAnimatedProgress] = useState<Record<string, number>>({})

  // Filter orders that are in transit or pending
  const trackableOrders = supplyChain.filter(
    (order) => order.status === 'in_transit' || order.status === 'pending'
  )

  // Calculate progress and location for each order
  const getOrderTrackingData = (orderId: string) => {
    const order = supplyChain.find((o) => o.id === orderId)
    if (!order) return null

    // Mock tracking data - in real app this would come from GPS/API
    const origin = order.originLocation || LOCATIONS.hoChiMinh
    const destination = order.destinationLocation || LOCATIONS.hanoi
    const currentProgress = animatedProgress[orderId] || order.progress || 0

    // Calculate current location based on progress
    const currentLat = origin.lat + (destination.lat - origin.lat) * (currentProgress / 100)
    const currentLng = origin.lng + (destination.lng - origin.lng) * (currentProgress / 100)

    const expectedDate = new Date(order.expectedDate)
    const now = new Date()
    const estimatedHoursRemaining = Math.max(
      0,
      Math.round((expectedDate.getTime() - now.getTime()) / (1000 * 60 * 60))
    )

    return {
      ...order,
      currentLocation: { lat: currentLat, lng: currentLng },
      originLocation: origin,
      destinationLocation: destination,
      progress: currentProgress,
      estimatedTimeRemaining: estimatedHoursRemaining,
    }
  }

  // Animate progress
  useEffect(() => {
    const interval = setInterval(() => {
      trackableOrders.forEach((order) => {
        if (order.status === 'in_transit') {
          const current = animatedProgress[order.id] || order.progress || 0
          if (current < 95) {
            setAnimatedProgress((prev) => ({
              ...prev,
              [order.id]: current + Math.random() * 2,
            }))
          }
        }
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [trackableOrders, animatedProgress])

  const selectedOrderData = selectedOrder ? getOrderTrackingData(selectedOrder) : null

  // Get product emoji/image for 3D view
  const getProductVisual = (product: any) => {
    const category = product?.category?.toLowerCase() || ''
    const name = product?.name?.toLowerCase() || ''
    
    if (category.includes('điện tử') || category.includes('electronics') || name.includes('laptop')) {
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Laptop 3D */}
          <div className="relative" style={{ transform: 'perspective(1000px) rotateY(-15deg) rotateX(5deg)' }}>
            {/* Laptop Screen */}
            <div className="bg-gray-800 rounded-t-lg p-1 border-2 border-gray-600 shadow-xl">
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded w-full h-full flex items-center justify-center text-white">
                <Laptop className="w-full h-full p-1" />
              </div>
            </div>
            {/* Laptop Base */}
            <div className="bg-gray-900 rounded-b-lg h-0.5 border-2 border-gray-600" />
          </div>
        </div>
      )
    }
    
    if (category.includes('giấy') || category.includes('paper') || category.includes('văn phòng phẩm')) {
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Paper Stack 3D */}
          <div className="relative" style={{ transform: 'perspective(1000px) rotateY(-10deg) rotateX(10deg)' }}>
            {/* Paper Stack */}
            <div className="relative">
              {/* Back paper */}
              <div className="absolute bg-blue-100 rounded w-full h-full border-2 border-blue-300 shadow-lg" style={{ transform: 'translateZ(-3px) translateX(-1px) translateY(-1px) scale(0.95)' }} />
              {/* Middle paper */}
              <div className="absolute bg-blue-50 rounded w-full h-full border-2 border-blue-200 shadow-md" style={{ transform: 'translateZ(-1px) translateX(-0.5px) translateY(-0.5px) scale(0.98)' }} />
              {/* Front paper */}
              <div className="relative bg-white rounded w-full h-full border-2 border-gray-300 shadow-xl flex items-center justify-center">
                <FileText className="w-3/4 h-3/4 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      )
    }
    
    if (category.includes('ghế') || category.includes('chair') || category.includes('nội thất')) {
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Chair 3D */}
          <div className="relative" style={{ transform: 'perspective(1000px) rotateY(-10deg)' }}>
            <Sofa className="w-full h-full text-purple-600" />
          </div>
        </div>
      )
    }
    
    // Default package
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <Package className="w-full h-full text-blue-500" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            AR/VR Theo dõi Vận chuyển
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-gray-600">
            Theo dõi quá trình vận chuyển hàng hóa trong thời gian thực với công nghệ AR/VR
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
            <SelectTrigger className="w-full sm:w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2d">Chế độ 2D</SelectItem>
              <SelectItem value="3d">Chế độ 3D</SelectItem>
              <SelectItem value="ar">Chế độ AR</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="w-full sm:w-auto"
          >
            <Maximize2 className="mr-2 h-4 w-4" />
            {isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Main Visualization Area */}
        <div className={`lg:col-span-2 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
          <Card className={`h-full ${isFullscreen ? 'm-0 rounded-none h-screen' : ''}`}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {viewMode === 'ar' && <Eye className="h-5 w-5" />}
                    {viewMode === '3d' && <Navigation className="h-5 w-5" />}
                    {viewMode === '2d' && <MapPin className="h-5 w-5" />}
                    {viewMode === '2d' ? 'Bản đồ 2D' : viewMode === '3d' ? 'Mô phỏng 3D' : 'Chế độ AR'}
                  </CardTitle>
                  <CardDescription>
                    {selectedOrderData
                      ? `Đang theo dõi: ${selectedOrderData.orderId}`
                      : 'Chọn một đơn hàng để theo dõi'}
                  </CardDescription>
                </div>
                {isFullscreen && (
                  <Button variant="ghost" onClick={() => setIsFullscreen(false)}>
                    ✕
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative w-full h-[500px] sm:h-[600px] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-lg overflow-hidden border-2 border-gray-200">
                {/* 3D/AR Visualization */}
                {viewMode === '3d' && (
                  <div className="relative w-full h-full perspective-1000">
                    <div className="absolute inset-0 transform-gpu" style={{ transformStyle: 'preserve-3d' }}>
                      {/* Origin Point */}
                      {selectedOrderData?.originLocation && (
                        <div
                          className="absolute w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg animate-pulse"
                          style={{
                            left: `${20}%`,
                            bottom: `${30}%`,
                            transform: 'translateZ(50px)',
                            zIndex: 10,
                          }}
                        >
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-semibold bg-white px-2 py-1 rounded shadow">
                            {selectedOrderData.originLocation.address || 'Điểm xuất phát'}
                          </div>
                        </div>
                      )}

                      {/* Destination Point */}
                      {selectedOrderData?.destinationLocation && (
                        <div
                          className="absolute w-6 h-6 bg-red-500 rounded-full border-4 border-white shadow-lg"
                          style={{
                            left: `${80}%`,
                            bottom: `${70}%`,
                            transform: 'translateZ(50px)',
                            zIndex: 10,
                          }}
                        >
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-semibold bg-white px-2 py-1 rounded shadow">
                            {selectedOrderData.destinationLocation.address || 'Điểm đến'}
                          </div>
                        </div>
                      )}

                      {/* Route Line */}
                      {selectedOrderData && (
                        <svg
                          className="absolute inset-0 w-full h-full"
                          style={{ zIndex: 5, pointerEvents: 'none' }}
                        >
                          <path
                            d="M 10% 70% Q 50% 45%, 90% 20%"
                            stroke="#3b82f6"
                            strokeWidth="3"
                            strokeDasharray="10,5"
                            fill="none"
                            opacity="0.5"
                          />
                        </svg>
                      )}

                      {/* Moving Truck with Product */}
                      {selectedOrderData && selectedOrderData.status === 'in_transit' && (
                        <div
                          className="absolute transform transition-all duration-1000 ease-linear"
                          style={{
                            left: `${20 + (selectedOrderData.progress / 100) * 60}%`,
                            bottom: `${70 - (selectedOrderData.progress / 100) * 40}%`,
                            transform: `translateZ(100px) translateX(-50%) translateY(50%)`,
                            zIndex: 20,
                          }}
                        >
                          <div className="relative">
                            {/* Product on truck */}
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-8 h-8 z-10">
                              <div className="relative w-full h-full">
                                {getProductVisual(selectedOrderData.product)}
                              </div>
                            </div>
                            <Truck className="w-12 h-12 text-blue-600 drop-shadow-lg animate-bounce" />
                            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg whitespace-nowrap">
                              {Math.round(selectedOrderData.progress)}%
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Grid Background */}
                      <div
                        className="absolute inset-0 opacity-10"
                        style={{
                          backgroundImage: `
                            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                          `,
                          backgroundSize: '50px 50px',
                          transform: 'translateZ(-100px) rotateX(60deg)',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* AR Mode */}
                {viewMode === 'ar' && (
                  <div className="relative w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
                    {/* Camera/AR View Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20">
                      {/* Grid pattern for AR feel */}
                      <div
                        className="absolute inset-0 opacity-20"
                        style={{
                          backgroundImage: `
                            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                          `,
                          backgroundSize: '40px 40px',
                        }}
                      />
                    </div>

                    {/* AR Overlay Content */}
                    <div className="relative z-10 h-full flex flex-col">
                      {/* Top Status Bar */}
                      <div className="absolute top-4 left-4 right-4 z-20">
                        <div className="bg-black/70 backdrop-blur-md rounded-lg p-3 border border-white/20">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Eye className="w-5 h-5 text-blue-400 animate-pulse" />
                              <span className="font-semibold text-sm">AR Tracking Mode</span>
                            </div>
                            {selectedOrderData && (
                              <div className="flex items-center gap-4 text-xs">
                                <span className="text-green-400">● Live</span>
                                <span>{Math.round(selectedOrderData.progress)}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Center AR Object/Product Visualization */}
                      <div className="flex-1 flex items-center justify-center">
                        {selectedOrderData ? (
                          <div className="relative">
                            {/* Product Icon/Image in 3D Space */}
                            <div className="relative transform-gpu" style={{ transform: 'perspective(1000px) rotateY(-15deg) rotateX(10deg)' }}>
                              {/* Product Box/Container */}
                              <div className="relative">
                                {/* Glowing background effect */}
                                <div className="absolute inset-0 bg-blue-500/30 rounded-2xl blur-3xl scale-150 animate-pulse" />
                                
                                {/* Product Container */}
                                <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 border-4 border-white/30 shadow-2xl">
                                  <div className="text-center space-y-4">
                                    {/* Product 3D Visualization */}
                                    <div className="relative h-32 flex items-center justify-center">
                                      <div className="absolute inset-0 bg-white/20 rounded-full blur-xl" />
                                      <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/30 w-28 h-28 flex items-center justify-center">
                                        <div className="w-20 h-20 text-white">
                                          {getProductVisual(selectedOrderData.product)}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Product Info */}
                                    <div className="space-y-2">
                                      <h3 className="text-xl font-bold text-white drop-shadow-lg">
                                        {selectedOrderData.product.name}
                                      </h3>
                                      <div className="text-sm text-white/80">
                                        {selectedOrderData.product.sku}
                                      </div>
                                      <div className="flex items-center justify-center gap-2 text-sm">
                                        <Truck className="w-4 h-4 text-green-300" />
                                        <span className="text-green-300">Đang vận chuyển</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Floating animation rings */}
                                <div className="absolute inset-0 rounded-2xl border-4 border-blue-400/50 animate-ping" />
                                <div className="absolute inset-0 rounded-2xl border-2 border-purple-400/30 animate-pulse" />
                              </div>

                              {/* Tracking Info Cards floating around */}
                              <div className="absolute -left-32 top-1/2 transform -translate-y-1/2">
                                <div className="bg-black/80 backdrop-blur-md rounded-lg p-3 border border-white/20 shadow-xl">
                                  <div className="text-xs text-gray-400 mb-1">Từ</div>
                                  <div className="text-sm font-semibold text-white">
                                    {selectedOrderData.originLocation?.address || 'Điểm xuất phát'}
                                  </div>
                                </div>
                              </div>

                              <div className="absolute -right-32 top-1/2 transform -translate-y-1/2">
                                <div className="bg-black/80 backdrop-blur-md rounded-lg p-3 border border-white/20 shadow-xl">
                                  <div className="text-xs text-gray-400 mb-1">Đến</div>
                                  <div className="text-sm font-semibold text-white">
                                    {selectedOrderData.destinationLocation?.address || 'Điểm đến'}
                                  </div>
                                </div>
                              </div>

                              <div className="absolute left-1/2 -bottom-20 transform -translate-x-1/2">
                                <div className="bg-black/80 backdrop-blur-md rounded-lg p-3 border border-white/20 shadow-xl min-w-[200px]">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-gray-400">Tiến độ</span>
                                    <span className="text-sm font-semibold text-blue-400">
                                      {Math.round(selectedOrderData.progress)}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div
                                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                                      style={{ width: `${selectedOrderData.progress}%` }}
                                    />
                                  </div>
                                  <div className="mt-2 flex items-center justify-between text-xs">
                                    <span className="text-gray-400">
                                      {selectedOrderData.estimatedTimeRemaining || 0}h còn lại
                                    </span>
                                    <span className="text-white/60">
                                      {selectedOrderData.quantity} {selectedOrderData.product.unit}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center space-y-4">
                            <div className="relative">
                              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl scale-150" />
                              <Eye className="relative w-24 h-24 mx-auto text-blue-400 animate-pulse" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Chế độ AR</h3>
                            <p className="text-gray-400 max-w-md">
                              Chọn một đơn hàng để xem trong chế độ AR
                              <br />
                              Hướng camera vào không gian để xem đơn hàng trong thực tế ảo
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Bottom Info Panel */}
                      {selectedOrderData && (
                        <div className="absolute bottom-4 left-4 right-4 z-20">
                          <div className="bg-black/70 backdrop-blur-md rounded-lg p-4 border border-white/20">
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                <div className="text-xs text-gray-400 mb-1">Mã đơn hàng</div>
                                <div className="font-semibold text-sm text-white">
                                  {selectedOrderData.orderId}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-400 mb-1">Nhà cung cấp</div>
                                <div className="font-semibold text-sm text-white truncate">
                                  {selectedOrderData.supplier}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-400 mb-1">Trạng thái</div>
                                <div className="font-semibold text-sm">
                                  {selectedOrderData.status === 'in_transit' ? (
                                    <span className="text-green-400">Đang vận chuyển</span>
                                  ) : (
                                    <span className="text-yellow-400">Chờ xử lý</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* AR Scan Lines Effect */}
                    <div className="absolute inset-0 pointer-events-none z-30">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse" />
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse" style={{ animationDelay: '0.5s' }} />
                    </div>
                  </div>
                )}

                {/* 2D Map Mode */}
                {viewMode === '2d' && (
                  <div className="relative w-full h-full bg-gradient-to-br from-green-100 to-blue-100">
                    {selectedOrderData ? (
                      <>
                        {/* Origin */}
                        <div
                          className="absolute bg-green-500 text-white p-2 rounded-full shadow-lg"
                          style={{
                            left: '10%',
                            top: '70%',
                          }}
                        >
                          <MapPin className="w-6 h-6" />
                        </div>

                        {/* Destination */}
                        <div
                          className="absolute bg-red-500 text-white p-2 rounded-full shadow-lg"
                          style={{
                            left: '90%',
                            top: '20%',
                          }}
                        >
                          <MapPin className="w-6 h-6" />
                        </div>

                        {/* Route */}
                        <svg className="absolute inset-0 w-full h-full">
                          <path
                            d="M 10% 70% Q 50% 45%, 90% 20%"
                            stroke="#3b82f6"
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray="10,5"
                          />
                        </svg>

                        {/* Current Position */}
                        {selectedOrderData.status === 'in_transit' && (
                          <div
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000"
                            style={{
                              left: `${10 + (selectedOrderData.progress / 100) * 80}%`,
                              top: `${70 - (selectedOrderData.progress / 100) * 50}%`,
                            }}
                          >
                            <Truck className="w-10 h-10 text-blue-600 animate-pulse" />
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                          <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p>Chọn một đơn hàng để xem trên bản đồ</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Progress Info */}
              {selectedOrderData && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tiến độ vận chuyển</span>
                    <span className="font-semibold">{Math.round(selectedOrderData.progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${selectedOrderData.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>
                      <Clock className="inline w-3 h-3 mr-1" />
                      Còn lại: ~{selectedOrderData.estimatedTimeRemaining || 0}h
                    </span>
                    <span>
                      {selectedOrderData.status === 'in_transit' ? (
                        <span className="text-blue-600">Đang vận chuyển</span>
                      ) : (
                        <span className="text-yellow-600">Chờ xử lý</span>
                      )}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order List Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Đơn hàng đang vận chuyển</CardTitle>
              <CardDescription>
                {trackableOrders.length} đơn hàng đang được theo dõi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {trackableOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Không có đơn hàng đang vận chuyển</p>
                  </div>
                ) : (
                  trackableOrders.map((order) => {
                    const tracking = getOrderTrackingData(order.id)
                    return (
                      <div
                        key={order.id}
                        onClick={() => setSelectedOrder(order.id)}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedOrder === order.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-semibold text-sm">{order.orderId}</div>
                            <div className="text-xs text-gray-600">{order.product.name}</div>
                          </div>
                          <Badge
                            className={
                              order.status === 'in_transit'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }
                          >
                            {order.status === 'in_transit' ? (
                              <Truck className="w-3 h-3 mr-1" />
                            ) : (
                              <Clock className="w-3 h-3 mr-1" />
                            )}
                            {order.status === 'in_transit' ? 'Đang vận chuyển' : 'Chờ xử lý'}
                          </Badge>
                        </div>
                        {tracking && (
                          <>
                            <div className="text-xs text-gray-500 mb-1">
                              Từ: {tracking.originLocation?.address || 'Điểm xuất phát'}
                            </div>
                            <div className="text-xs text-gray-500 mb-2">
                              Đến: {tracking.destinationLocation?.address || 'Điểm đến'}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-blue-600 h-1.5 rounded-full transition-all"
                                style={{ width: `${tracking.progress}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>{Math.round(tracking.progress)}%</span>
                              <span>
                                {tracking.estimatedTimeRemaining || 0}h còn lại
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          {selectedOrderData && (
            <Card>
              <CardHeader>
                <CardTitle>Chi tiết đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-xs text-gray-500">Mã đơn hàng</div>
                  <div className="font-semibold">{selectedOrderData.orderId}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Sản phẩm</div>
                  <div className="font-semibold">{selectedOrderData.product.name}</div>
                  <div className="text-xs text-gray-600">{selectedOrderData.product.sku}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Nhà cung cấp</div>
                  <div className="font-semibold">{selectedOrderData.supplier}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Số lượng</div>
                  <div className="font-semibold">{selectedOrderData.quantity} {selectedOrderData.product.unit}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Ngày đặt hàng</div>
                  <div className="text-sm">
                    {format(new Date(selectedOrderData.orderDate), 'dd/MM/yyyy HH:mm')}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Ngày dự kiến giao</div>
                  <div className="text-sm">
                    {format(new Date(selectedOrderData.expectedDate), 'dd/MM/yyyy HH:mm')}
                  </div>
                </div>
                {selectedOrderData.notes && (
                  <div>
                    <div className="text-xs text-gray-500">Ghi chú</div>
                    <div className="text-sm">{selectedOrderData.notes}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
