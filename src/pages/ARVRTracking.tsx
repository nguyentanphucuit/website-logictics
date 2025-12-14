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
  Package,
  Eye,
  Maximize2,
  Tag,
  CheckCircle,
  Box,
  Play,
  Pause,
  Plus,
  Youtube,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface BoxItem {
  id: string
  orderId: string
  productId: string
  product: any
  hasLabel: boolean
  labelData?: {
    orderId: string
    productName: string
    sku: string
    quantity: number
    date: string
  }
}

export default function ARVRTracking() {
  const supplyChain = useDataStore((state) => state.supplyChain)
  const products = useDataStore((state) => state.products)
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'3d' | 'ar'>('3d')
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  // Tạo danh sách thùng hàng từ đơn hàng
  const [boxes, setBoxes] = useState<BoxItem[]>([])
  const [currentBoxIndex, setCurrentBoxIndex] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isAutoPlay, setIsAutoPlay] = useState(false)
  const [isSliding, setIsSliding] = useState(false)
  
  // Dialog thêm sản phẩm
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false)
  const [addProductForm, setAddProductForm] = useState({
    productId: '',
    quantity: '1',
  })
  
  // Dialog YouTube videos
  const [openVideo1, setOpenVideo1] = useState(false)
  const [openVideo2, setOpenVideo2] = useState(false)

  // Filter orders that are pending or in_transit
  const trackableOrders = supplyChain.filter(
    (order) => order.status === 'pending' || order.status === 'in_transit'
  )

  // Khởi tạo danh sách thùng hàng khi chọn đơn hàng
  useEffect(() => {
    if (selectedOrder) {
      const order = supplyChain.find((o) => o.id === selectedOrder)
      if (order) {
        // Tạo số thùng hàng = số lượng đơn hàng
        const newBoxes: BoxItem[] = []
        for (let i = 0; i < order.quantity; i++) {
          newBoxes.push({
            id: `${order.id}-box-${i + 1}`,
            orderId: order.id,
            productId: order.product.id,
            product: order.product,
            hasLabel: false,
          })
        }
        // Giữ lại các sản phẩm thêm thủ công (orderId === 'MANUAL')
        const manualBoxes = boxes.filter((b) => b.orderId === 'MANUAL')
        setBoxes([...newBoxes, ...manualBoxes])
        setCurrentBoxIndex(0)
      }
    } else {
      // Chỉ xóa các box từ đơn hàng, giữ lại sản phẩm thêm thủ công
      const manualBoxes = boxes.filter((b) => b.orderId === 'MANUAL')
      if (manualBoxes.length > 0) {
        setBoxes(manualBoxes)
      } else {
        setBoxes([])
      }
      setCurrentBoxIndex(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOrder, supplyChain])

  // Lấy thùng hàng hiện tại
  const currentBox = boxes[currentBoxIndex]
  const processedCount = boxes.filter((b) => b.hasLabel).length
  const totalBoxes = boxes.length
  const progress = totalBoxes > 0 ? Math.round((processedCount / totalBoxes) * 100) : 0
  const selectedOrderData = selectedOrder ? supplyChain.find((o) => o.id === selectedOrder) : null

  // Xử lý thêm nhãn/tem cho thùng hàng hiện tại
  const handleAddLabel = (boxIndex: number, autoMove: boolean = true) => {
    const box = boxes[boxIndex]
    if (!box || box.hasLabel || isProcessing) return

    setIsProcessing(true)
    
    // Thêm nhãn với hiệu ứng delay
    setTimeout(() => {
      setBoxes((prevBoxes) =>
        prevBoxes.map((b, index) =>
          index === boxIndex
            ? {
                ...b,
                hasLabel: true,
                labelData: {
                  orderId: selectedOrderData?.orderId || '',
                  productName: b.product.name,
                  sku: b.product.sku,
                  quantity: selectedOrderData?.quantity || 0,
                  date: new Date().toISOString(),
                },
              }
            : b
        )
      )

      // Nếu dán nhãn cho thùng hiện tại và có thùng tiếp theo, tự động chuyển sang
      if (boxIndex === currentBoxIndex && currentBoxIndex < boxes.length - 1 && autoMove) {
        setTimeout(() => {
          // Bắt đầu animation sliding
          setIsSliding(true)
          
          // Sau khi animation bắt đầu, chuyển sang thùng tiếp theo
          setTimeout(() => {
            setCurrentBoxIndex(currentBoxIndex + 1)
            setIsSliding(false)
            setIsProcessing(false)
          }, 600) // Thời gian animation sliding
        }, 1000) // Đợi hiệu ứng dán nhãn xong
      } else {
        setIsProcessing(false)
      }
    }, 500)
  }

  // Auto-play: Tự động dán nhãn
  useEffect(() => {
    if (!isAutoPlay || !currentBox || currentBox.hasLabel || isProcessing || !selectedOrderData) {
      return
    }

    // Tự động dán nhãn sau 1.5 giây
    const timer = setTimeout(() => {
      if (currentBox && !currentBox.hasLabel && !isProcessing) {
        handleAddLabel(currentBoxIndex, true)
      }
    }, 1500)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAutoPlay, currentBoxIndex, isProcessing, selectedOrderData])

  // Chuyển sang thùng hàng trước/tiếp theo
  const handleNextBox = () => {
    if (currentBoxIndex < boxes.length - 1) {
      setCurrentBoxIndex(currentBoxIndex + 1)
    }
  }

  const handlePrevBox = () => {
    if (currentBoxIndex > 0) {
      setCurrentBoxIndex(currentBoxIndex - 1)
    }
  }

  // Xử lý thêm sản phẩm mới
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault()
    const product = products.find((p) => p.id === addProductForm.productId)
    if (!product) return

    const quantity = parseInt(addProductForm.quantity) || 1
    const newBoxes: BoxItem[] = []
    
    // Tạo thùng hàng mới
    for (let i = 0; i < quantity; i++) {
      newBoxes.push({
        id: `manual-box-${Date.now()}-${i + 1}`,
        orderId: 'MANUAL',
        productId: product.id,
        product: product,
        hasLabel: false,
      })
    }

    // Thêm vào danh sách boxes
    setBoxes((prevBoxes) => [...prevBoxes, ...newBoxes])
    
    // Nếu chưa có box nào, chuyển đến box đầu tiên
    if (boxes.length === 0) {
      setCurrentBoxIndex(0)
    }
    
    // Reset form và đóng dialog
    setAddProductForm({ productId: '', quantity: '1' })
    setIsAddProductDialogOpen(false)
  }

  return (
    <div>
      <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            AR/VR Đóng Gói & Dán Nhãn
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-gray-600">
            Quy trình đóng gói và dán nhãn thùng hàng với công nghệ AR/VR
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* YouTube Video Dialogs */}
          <Dialog open={openVideo1} onOpenChange={setOpenVideo1}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                title="Xem video hướng dẫn AR/VR"
              >
                <Youtube className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Video 1</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl w-full">
              <DialogHeader>
                <DialogTitle>Video hướng dẫn AR/VR</DialogTitle>
              </DialogHeader>
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  src="https://www.youtube.com/embed/hXGvS9-GlfM"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={openVideo2} onOpenChange={setOpenVideo2}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                title="Xem video demo AR/VR"
              >
                <Youtube className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Video 2</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl w-full">
              <DialogHeader>
                <DialogTitle>Video demo AR/VR</DialogTitle>
              </DialogHeader>
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  src="https://www.youtube.com/embed/kKgt_azwT0M"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Thêm sản phẩm
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm sản phẩm vào quy trình đóng gói</DialogTitle>
                <DialogDescription>
                  Chọn sản phẩm và số lượng để thêm vào danh sách đóng gói
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddProduct}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="productId">Sản phẩm *</Label>
                    <Select
                      value={addProductForm.productId}
                      onValueChange={(value) =>
                        setAddProductForm({ ...addProductForm, productId: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn sản phẩm" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} ({product.sku})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="quantity">Số lượng *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={addProductForm.quantity}
                      onChange={(e) =>
                        setAddProductForm({ ...addProductForm, quantity: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddProductDialogOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button type="submit">Thêm</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
            <SelectTrigger className="w-full sm:w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
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
                    {viewMode === '3d' && <Box className="h-5 w-5" />}
                    {viewMode === '3d' ? 'Mô phỏng 3D' : 'Chế độ AR'}
                  </CardTitle>
                  <CardDescription>
                    {boxes.length > 0
                      ? `Thùng ${currentBoxIndex + 1}/${totalBoxes}${selectedOrderData ? ` | Đơn hàng: ${selectedOrderData.orderId}` : ''}`
                      : 'Chọn một đơn hàng hoặc thêm sản phẩm để bắt đầu'}
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
                {boxes.length > 0 && currentBox ? (
                  <div className="relative w-full h-full">
                    {/* 3D/AR Visualization - Slider Carousel */}
                    {viewMode === '3d' && (
                      <div className="relative w-full h-full overflow-hidden">
                        {/* Slider Container - trượt từ phải sang trái */}
                        <div 
                          className="relative w-full h-full flex items-center"
                          style={{
                            transform: `translateX(calc(50% - ${currentBoxIndex * 400}px - ${currentBoxIndex * 2}rem))`,
                            transition: isSliding ? 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)' : 'transform 0.3s ease-out',
                          }}
                        >
                          {/* Render tất cả các thùng hàng trong một hàng */}
                          <div 
                            className="flex items-center gap-8 px-8 h-full"
                            style={{ 
                              width: 'max-content',
                              minWidth: '100%'
                            }}
                          >
                            {boxes.length > 0 ? (
                              boxes.map((box, index) => {
                                const isCurrent = index === currentBoxIndex
                                const distance = Math.abs(index - currentBoxIndex)
                                
                                // Tính toán scale và opacity dựa trên khoảng cách
                                let scale = 1
                                let opacity = 1
                                let rotateY = -15
                                
                                if (distance === 0) {
                                  // Thùng hàng hiện tại (center)
                                  scale = 1
                                  opacity = 1
                                  rotateY = -15
                                } else if (distance === 1) {
                                  // Thùng hàng kế bên
                                  scale = 0.85
                                  opacity = 0.8
                                  rotateY = index > currentBoxIndex ? 15 : -30
                                } else {
                                  // Thùng hàng xa hơn
                                  scale = 0.7
                                  opacity = 0.5
                                  rotateY = index > currentBoxIndex ? 20 : -35
                                }

                                return (
                                  <div
                                    key={box.id}
                                    className="flex-shrink-0 flex items-center justify-center h-full"
                                    style={{
                                      width: '400px',
                                      opacity: opacity,
                                      transform: `scale(${scale})`,
                                      transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                                    }}
                                  >
                                    <div
                                      className="relative transform-gpu"
                                      style={{
                                        transform: `perspective(1000px) rotateY(${rotateY}deg) rotateX(5deg)`,
                                        transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                                      }}
                                    >
                                      <div className="relative">
                                        {/* Shadow */}
                                        <div className="absolute inset-0 bg-gray-800/30 rounded-lg blur-xl transform translate-y-4 scale-95" />
                                        
                                        {/* Thùng hàng */}
                                        <div className={`relative bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border-4 border-amber-300 shadow-2xl p-8 w-64 h-64 flex flex-col items-center justify-center transition-all duration-500 ${
                                          box.hasLabel ? 'border-green-500 scale-105' : ''
                                        }`}>
                                          {/* Icon sản phẩm */}
                                          <div className="mb-4 transition-all duration-500">
                                            <Package className={`w-16 h-16 transition-all duration-500 ${
                                              box.hasLabel ? 'text-green-700 scale-110' : 'text-amber-700'
                                            }`} />
                                          </div>

                                          {/* Nhãn/Tem */}
                                          {box.hasLabel && box.labelData && (
                                            <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-md shadow-lg transform rotate-12 animate-pulse border-2 border-white z-20">
                                              <div className="text-xs font-bold">TEM</div>
                                            </div>
                                          )}

                                          {/* Thông tin */}
                                          <div className="text-center space-y-1">
                                            <div className={`text-xs font-semibold transition-colors duration-500 ${
                                              box.hasLabel ? 'text-green-800' : 'text-amber-800'
                                            }`}>
                                              {box.product.name}
                                            </div>
                                            <div className="text-[10px] text-amber-600">
                                              SKU: {box.product.sku}
                                            </div>
                                            <div className="text-[10px] text-gray-500">
                                              #{index + 1}
                                            </div>
                                          </div>

                                          {/* Hiệu ứng khi đã có nhãn */}
                                          {box.hasLabel && (
                                            <div className="absolute inset-0 border-4 border-green-500 rounded-lg animate-pulse" />
                                          )}

                                          {/* Nút dán nhãn - chỉ hiển thị trên thùng hàng hiện tại */}
                                          {isCurrent && !box.hasLabel && !isAutoPlay && (
                                            <div className="absolute -bottom-14 left-1/2 transform -translate-x-1/2 z-30">
                                              <Button
                                                onClick={() => handleAddLabel(index)}
                                                disabled={isProcessing}
                                                size="sm"
                                                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                                              >
                                                <Tag className="mr-2 h-3 w-3" />
                                                {isProcessing ? 'Đang xử lý...' : 'Dán nhãn'}
                                              </Button>
                                            </div>
                                          )}

                                          {/* Badge đã dán nhãn */}
                                          {isCurrent && box.hasLabel && (
                                            <div className="absolute -bottom-14 left-1/2 transform -translate-x-1/2 z-30">
                                              <Badge className="bg-green-500 text-white shadow-lg">
                                                <CheckCircle className="mr-1 h-3 w-3" />
                                                Đã dán
                                              </Badge>
                                            </div>
                                          )}

                                          {/* Badge đang dán nhãn (auto-play) */}
                                          {isCurrent && !box.hasLabel && isAutoPlay && (
                                            <div className="absolute -bottom-14 left-1/2 transform -translate-x-1/2 z-30">
                                              <Badge className="bg-blue-500 text-white shadow-lg animate-pulse">
                                                <Tag className="mr-1 h-3 w-3" />
                                                Đang dán nhãn...
                                              </Badge>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })
                            ) : (
                              <div className="flex items-center justify-center w-full h-full">
                                <div className="text-center text-gray-500">
                                  <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                  <p>Chưa có thùng hàng</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* AR Mode */}
                    {viewMode === 'ar' && (
                      <div className="relative w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
                        {/* AR Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20">
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

                        {/* AR Content */}
                        <div className="relative z-10 h-full flex flex-col items-center justify-center">
                          {/* Top Status */}
                          <div className="absolute top-4 left-4 right-4 z-20">
                            <div className="bg-black/70 backdrop-blur-md rounded-lg p-3 border border-white/20">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Eye className="w-5 h-5 text-blue-400 animate-pulse" />
                                  <span className="font-semibold text-sm">AR Packaging Mode</span>
                                </div>
                                <div className="flex items-center gap-4 text-xs">
                                  <span className="text-green-400">● Live</span>
                                  <span>{progress}%</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Center Box - Slider Carousel AR */}
                          <div className="flex-1 flex items-center justify-center relative overflow-hidden">
                            {/* Slider Container - trượt từ phải sang trái */}
                            <div 
                              className="relative w-full h-full flex items-center"
                              style={{
                                transform: `translateX(calc(50% - ${currentBoxIndex * 400}px - ${currentBoxIndex * 2}rem))`,
                                transition: isSliding ? 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)' : 'transform 0.3s ease-out',
                              }}
                            >
                              {/* Render tất cả các thùng hàng trong một hàng */}
                              <div 
                                className="flex items-center gap-8 px-8 h-full"
                                style={{ 
                                  width: 'max-content',
                                  minWidth: '100%'
                                }}
                              >
                                {boxes.length > 0 ? (
                                  boxes.map((box, index) => {
                                    const isCurrent = index === currentBoxIndex
                                    const distance = Math.abs(index - currentBoxIndex)
                                    
                                    // Tính toán scale và opacity dựa trên khoảng cách
                                    let scale = 1
                                    let opacity = 1
                                    let rotateY = -15
                                    
                                    if (distance === 0) {
                                      // Thùng hàng hiện tại (center)
                                      scale = 1
                                      opacity = 1
                                      rotateY = -15
                                    } else if (distance === 1) {
                                      // Thùng hàng kế bên
                                      scale = 0.85
                                      opacity = 0.8
                                      rotateY = index > currentBoxIndex ? 15 : -30
                                    } else {
                                      // Thùng hàng xa hơn
                                      scale = 0.7
                                      opacity = 0.5
                                      rotateY = index > currentBoxIndex ? 20 : -35
                                    }

                                    return (
                                      <div
                                        key={box.id}
                                        className="flex-shrink-0 flex items-center justify-center h-full"
                                        style={{
                                          width: '400px',
                                          opacity: opacity,
                                          transform: `scale(${scale})`,
                                          transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                                        }}
                                      >
                                        <div
                                          className="relative transform-gpu"
                                          style={{
                                            transform: `perspective(1000px) rotateY(${rotateY}deg) rotateX(10deg)`,
                                            transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                                          }}
                                        >
                                          <div className="relative">
                                            <div className="absolute inset-0 bg-blue-500/30 rounded-2xl blur-3xl scale-150 animate-pulse" />
                                            <div className={`relative bg-gradient-to-br from-amber-600 to-amber-800 rounded-2xl p-10 border-4 border-white/30 shadow-2xl transition-all duration-500 ${
                                              box.hasLabel ? 'border-green-400 scale-105' : ''
                                            }`}>
                                              <div className="text-center space-y-3">
                                                <Package className={`w-20 h-20 mx-auto transition-all duration-500 ${
                                                  box.hasLabel ? 'text-green-300 scale-110' : 'text-white'
                                                }`} />
                                                {box.hasLabel && box.labelData && (
                                                  <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1.5 rounded-lg shadow-xl transform rotate-12 border-2 border-white animate-pulse z-20">
                                                    <Tag className="w-5 h-5" />
                                                  </div>
                                                )}
                                                <div className="text-white">
                                                  <div className="font-bold text-base">{box.product.name}</div>
                                                  <div className="text-xs opacity-80">{box.product.sku}</div>
                                                  <div className="text-[10px] opacity-60 mt-1">#{index + 1}</div>
                                                </div>
                                                {isCurrent && !box.hasLabel && !isAutoPlay && (
                                                  <Button
                                                    onClick={() => handleAddLabel(index)}
                                                    disabled={isProcessing}
                                                    size="sm"
                                                    className="mt-3 bg-blue-600 hover:bg-blue-700 text-white"
                                                  >
                                                    <Tag className="mr-2 h-3 w-3" />
                                                    {isProcessing ? 'Đang xử lý...' : 'Dán nhãn'}
                                                  </Button>
                                                )}
                                                {isCurrent && box.hasLabel && (
                                                  <Badge className="mt-3 bg-green-500 text-white">
                                                    <CheckCircle className="mr-1 h-3 w-3" />
                                                    Đã dán nhãn
                                                  </Badge>
                                                )}
                                                {isCurrent && !box.hasLabel && isAutoPlay && (
                                                  <Badge className="mt-3 bg-blue-500 text-white animate-pulse">
                                                    <Tag className="mr-1 h-3 w-3" />
                                                    Đang dán nhãn...
                                                  </Badge>
                                                )}
                                              </div>
                                            </div>
                                            {box.hasLabel && (
                                              <div className="absolute inset-0 rounded-2xl border-4 border-green-400 animate-pulse" />
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  })
                                ) : (
                                  <div className="flex items-center justify-center w-full h-full">
                                    <div className="text-center text-gray-400">
                                      <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                      <p>Chưa có thùng hàng</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Bottom Info */}
                          <div className="absolute bottom-4 left-4 right-4 z-20">
                            <div className="bg-black/70 backdrop-blur-md rounded-lg p-4 border border-white/20">
                              <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                  <div className="text-xs text-gray-400 mb-1">Thùng hiện tại</div>
                                  <div className="font-semibold text-sm text-white">
                                    {currentBoxIndex + 1}/{totalBoxes}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-400 mb-1">Đã xử lý</div>
                                  <div className="font-semibold text-sm text-green-400">
                                    {processedCount}/{totalBoxes}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-400 mb-1">Tiến độ</div>
                                  <div className="font-semibold text-sm text-blue-400">
                                    {progress}%
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Control Buttons */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevBox}
                        disabled={currentBoxIndex === 0 || isProcessing}
                        className="bg-white/90 backdrop-blur-sm"
                      >
                        ← Trước
                      </Button>
                      <Button
                        variant={isAutoPlay ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setIsAutoPlay(!isAutoPlay)
                          if (!isAutoPlay && currentBox && !currentBox.hasLabel) {
                            // Bắt đầu auto-play ngay
                            handleAddLabel(currentBoxIndex, true)
                          }
                        }}
                        disabled={isProcessing || !currentBox}
                        className={isAutoPlay ? "bg-green-600 hover:bg-green-700 text-white" : "bg-white/90 backdrop-blur-sm"}
                      >
                        {isAutoPlay ? (
                          <>
                            <Pause className="mr-2 h-3 w-3" />
                            Tạm dừng
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-3 w-3" />
                            Tự động
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextBox}
                        disabled={currentBoxIndex === boxes.length - 1 || isProcessing}
                        className="bg-white/90 backdrop-blur-sm"
                      >
                        Tiếp theo →
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="mb-2">Chọn một đơn hàng hoặc thêm sản phẩm để bắt đầu</p>
                      <Button
                        onClick={() => setIsAddProductDialogOpen(true)}
                        className="mt-4"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm sản phẩm
                      </Button>
                    </div>
                  </div>
                )}

                {/* Progress Bar */}
                {boxes.length > 0 && (
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">Tiến độ đóng gói</div>
                    <div className="w-48 bg-gray-200 rounded-full h-3 mb-1">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="text-xs font-semibold text-gray-700">
                      {processedCount}/{totalBoxes} thùng đã xử lý ({progress}%)
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order List Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Đơn hàng cần xử lý</CardTitle>
              <CardDescription>
                {trackableOrders.length} đơn hàng + {boxes.filter((b) => b.orderId === 'MANUAL').length > 0 ? new Set(boxes.filter((b) => b.orderId === 'MANUAL').map((b) => b.productId)).size : 0} sản phẩm thêm thủ công
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {trackableOrders.length === 0 && boxes.filter((b) => b.orderId === 'MANUAL').length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Không có đơn hàng cần xử lý</p>
                  </div>
                ) : (
                  <>
                    {/* Hiển thị đơn hàng từ supply chain */}
                    {trackableOrders.map((order) => {
                      const orderBoxes = boxes.filter((b) => b.orderId === order.id)
                      const orderProcessed = orderBoxes.filter((b) => b.hasLabel).length
                      const orderProgress = orderBoxes.length > 0 
                        ? Math.round((orderProcessed / orderBoxes.length) * 100) 
                        : 0

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
                            <Badge className="bg-blue-100 text-blue-800">
                              {order.quantity} thùng
                            </Badge>
                          </div>
                          {selectedOrder === order.id && orderBoxes.length > 0 && (
                            <>
                              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                                <div
                                  className="bg-blue-600 h-1.5 rounded-full transition-all"
                                  style={{ width: `${orderProgress}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>{orderProcessed}/{orderBoxes.length} đã xử lý</span>
                                <span>{orderProgress}%</span>
                              </div>
                            </>
                          )}
                        </div>
                      )
                    })}

                    {/* Hiển thị sản phẩm thêm thủ công - nhóm theo productId */}
                    {(() => {
                      const manualBoxes = boxes.filter((b) => b.orderId === 'MANUAL')
                      const groupedManual = manualBoxes.reduce((acc, box) => {
                        if (!acc[box.productId]) {
                          acc[box.productId] = []
                        }
                        acc[box.productId].push(box)
                        return acc
                      }, {} as Record<string, BoxItem[]>)

                      return Object.entries(groupedManual).map(([productId, productBoxes]) => {
                        const product = productBoxes[0].product
                        const processed = productBoxes.filter((b) => b.hasLabel).length
                        const progress = productBoxes.length > 0 
                          ? Math.round((processed / productBoxes.length) * 100) 
                          : 0
                        // Kiểm tra xem sản phẩm này có đang được hiển thị không (currentBox có cùng productId và orderId = MANUAL)
                        const isSelected = currentBox?.productId === productId && currentBox?.orderId === 'MANUAL'

                        return (
                          <div
                            key={`manual-${productId}`}
                            onClick={() => {
                              // Tìm index của box đầu tiên của sản phẩm này
                              const firstIndex = boxes.findIndex((b) => b.productId === productId && b.orderId === 'MANUAL')
                              if (firstIndex !== -1) {
                                setCurrentBoxIndex(firstIndex)
                                // Nếu đang chọn đơn hàng khác, bỏ chọn để hiển thị tất cả
                                if (selectedOrder) {
                                  setSelectedOrder(null)
                                }
                              }
                            }}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                              isSelected
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-purple-200 hover:border-purple-300 hover:bg-purple-50'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="font-semibold text-sm flex items-center gap-2">
                                  {product.name}
                                  <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300 text-[10px]">
                                    Thủ công
                                  </Badge>
                                </div>
                                <div className="text-xs text-gray-600">SKU: {product.sku}</div>
                              </div>
                              <Badge className="bg-purple-100 text-purple-800">
                                {productBoxes.length} thùng
                              </Badge>
                            </div>
                            {isSelected && productBoxes.length > 0 && (
                              <>
                                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                                  <div
                                    className="bg-purple-600 h-1.5 rounded-full transition-all"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <div className="flex justify-between text-xs text-gray-500">
                                  <span>{processed}/{productBoxes.length} đã xử lý</span>
                                  <span>{progress}%</span>
                                </div>
                              </>
                            )}
                          </div>
                        )
                      })
                    })()}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          {boxes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Chi tiết đóng gói</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedOrderData && (
                  <>
                    <div>
                      <div className="text-xs text-gray-500">Mã đơn hàng</div>
                      <div className="font-semibold">{selectedOrderData.orderId}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Sản phẩm</div>
                      <div className="font-semibold">{selectedOrderData.product.name}</div>
                      <div className="text-xs text-gray-600">SKU: {selectedOrderData.product.sku}</div>
                    </div>
                  </>
                )}
                {boxes.some((b) => b.orderId === 'MANUAL') && (
                  <div>
                    <div className="text-xs text-gray-500">Sản phẩm thêm thủ công</div>
                    <div className="text-xs text-gray-600">
                      {boxes.filter((b) => b.orderId === 'MANUAL').length} thùng
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-xs text-gray-500">Tổng số thùng</div>
                  <div className="font-semibold">{totalBoxes} thùng</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Đã xử lý</div>
                  <div className="font-semibold text-green-600">
                    {processedCount}/{totalBoxes} thùng ({progress}%)
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Thùng hiện tại</div>
                  <div className="font-semibold">
                    Thùng {currentBoxIndex + 1}/{totalBoxes}
                    {currentBox?.hasLabel && (
                      <Badge className="ml-2 bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Đã dán nhãn
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
