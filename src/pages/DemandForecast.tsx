import { useState } from 'react'
import { useDemandForecastStore } from '@/store/demandForecastStore'
import { useDataStore } from '@/store/dataStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  TrendingUp,
  Users,
  Package,
  Plus,
  Target,
  Clock,
  Calendar,
  Star,
  Zap,
  Sparkles,
} from 'lucide-react'
import { format } from 'date-fns'

export default function DemandForecast() {
  const customers = useDemandForecastStore((state) => state.customers)
  const orders = useDemandForecastStore((state) => state.orders)
  const products = useDataStore((state) => state.products)
  const addCustomer = useDemandForecastStore((state) => state.addCustomer)
  const addOrder = useDemandForecastStore((state) => state.addOrder)
  const getAllDemandForecasts = useDemandForecastStore((state) => state.getAllDemandForecasts)
  const getPotentialCustomers = useDemandForecastStore((state) => state.getPotentialCustomers)
  const getShortTermCustomers = useDemandForecastStore((state) => state.getShortTermCustomers)
  const getLongTermCustomers = useDemandForecastStore((state) => state.getLongTermCustomers)
  const predictNewProductTypes = useDemandForecastStore((state) => state.predictNewProductTypes)

  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false)
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)
  const [customerFormData, setCustomerFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    customerType: 'regular' as 'vip' | 'regular' | 'potential',
  })
  const [orderFormData, setOrderFormData] = useState({
    customerId: '',
    totalAmount: '',
    status: 'completed' as 'pending' | 'processing' | 'completed' | 'cancelled',
    notes: '',
  })

  const forecasts = getAllDemandForecasts()
  const potentialCustomers = getPotentialCustomers()
  const shortTermCustomers = getShortTermCustomers()
  const longTermCustomers = getLongTermCustomers()
  const newProductPredictions = predictNewProductTypes()

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault()
    addCustomer(customerFormData)
    setIsCustomerDialogOpen(false)
    setCustomerFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      address: '',
      customerType: 'regular',
    })
  }

  const handleAddOrder = (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderFormData.customerId || !products.length) return

    const totalAmount = parseFloat(orderFormData.totalAmount) || 0
    // Tự động chọn sản phẩm ngẫu nhiên từ danh sách để tạo đơn hàng
    const randomProduct = products[Math.floor(Math.random() * products.length)]
    const quantity = Math.max(1, Math.floor(totalAmount / 1000000)) // Giả lập số lượng dựa trên tổng tiền
    const unitPrice = Math.floor(totalAmount / quantity)

    const items = [
      {
        id: Date.now().toString(),
        orderId: '',
        productId: randomProduct.id,
        product: randomProduct,
        quantity,
        unitPrice,
        totalPrice: totalAmount,
      },
    ]

    const order = {
      customerId: orderFormData.customerId,
      orderDate: new Date().toISOString(),
      totalAmount,
      status: orderFormData.status,
      items,
      notes: orderFormData.notes,
    }

    addOrder(order)
    setIsOrderDialogOpen(false)
    setOrderFormData({
      customerId: '',
      totalAmount: '',
      status: 'completed',
      notes: '',
    })
  }

  const getSegmentBadge = (segment: string) => {
    switch (segment) {
      case 'long_term':
        return <Badge className="bg-blue-100 text-blue-800">Dài hạn</Badge>
      case 'short_term':
        return <Badge className="bg-orange-100 text-orange-800">Ngắn hạn</Badge>
      case 'new':
        return <Badge className="bg-green-100 text-green-800">Mới</Badge>
      default:
        return <Badge>{segment}</Badge>
    }
  }

  const getCustomerTypeBadge = (type: string) => {
    switch (type) {
      case 'vip':
        return <Badge className="bg-purple-100 text-purple-800">VIP</Badge>
      case 'potential':
        return <Badge className="bg-yellow-100 text-yellow-800">Tiềm năng</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Thường</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  return (
    <div>
      <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dự báo nhu cầu</h1>
          <p className="mt-2 text-xs sm:text-sm text-gray-600">
            Dự đoán sản phẩm/dịch vụ tương lai, phân loại khách hàng và dự đoán sản phẩm mới
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Thêm đơn hàng
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm đơn hàng mới</DialogTitle>
                <DialogDescription>
                  Tạo đơn hàng để hệ thống tự động dự đoán nhu cầu
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddOrder}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="customerId">Khách hàng *</Label>
                    <Select
                      value={orderFormData.customerId}
                      onValueChange={(value) =>
                        setOrderFormData({ ...orderFormData, customerId: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn khách hàng" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="totalAmount">Tổng tiền (VND) *</Label>
                    <Input
                      id="totalAmount"
                      type="number"
                      value={orderFormData.totalAmount}
                      onChange={(e) =>
                        setOrderFormData({ ...orderFormData, totalAmount: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Trạng thái</Label>
                    <Select
                      value={orderFormData.status}
                      onValueChange={(value: any) =>
                        setOrderFormData({ ...orderFormData, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Chờ xử lý</SelectItem>
                        <SelectItem value="processing">Đang xử lý</SelectItem>
                        <SelectItem value="completed">Hoàn thành</SelectItem>
                        <SelectItem value="cancelled">Đã hủy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Ghi chú</Label>
                    <Input
                      id="notes"
                      value={orderFormData.notes}
                      onChange={(e) =>
                        setOrderFormData({ ...orderFormData, notes: e.target.value })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsOrderDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button type="submit">Thêm</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Thêm khách hàng
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm khách hàng mới</DialogTitle>
                <DialogDescription>
                  Thêm thông tin khách hàng vào hệ thống
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddCustomer}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Tên khách hàng *</Label>
                    <Input
                      id="name"
                      value={customerFormData.name}
                      onChange={(e) =>
                        setCustomerFormData({ ...customerFormData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerFormData.email}
                      onChange={(e) =>
                        setCustomerFormData({ ...customerFormData, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                      id="phone"
                      value={customerFormData.phone}
                      onChange={(e) =>
                        setCustomerFormData({ ...customerFormData, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="company">Công ty</Label>
                    <Input
                      id="company"
                      value={customerFormData.company}
                      onChange={(e) =>
                        setCustomerFormData({ ...customerFormData, company: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="customerType">Loại khách hàng</Label>
                    <Select
                      value={customerFormData.customerType}
                      onValueChange={(value: any) =>
                        setCustomerFormData({ ...customerFormData, customerType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regular">Thường</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                        <SelectItem value="potential">Tiềm năng</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCustomerDialogOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button type="submit">Thêm</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="forecasts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="forecasts">
            <TrendingUp className="mr-2 h-4 w-4" />
            Dự báo nhu cầu
          </TabsTrigger>
          <TabsTrigger value="customers">
            <Users className="mr-2 h-4 w-4" />
            Khách hàng tiềm năng
          </TabsTrigger>
          <TabsTrigger value="products">
            <Sparkles className="mr-2 h-4 w-4" />
            Sản phẩm mới
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forecasts" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Tổng số dự báo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{forecasts.length}</div>
                <p className="text-xs text-gray-600 mt-1">Khách hàng được phân tích</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Độ tin cậy TB</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {forecasts.length > 0
                    ? Math.round(
                        (forecasts.reduce((sum, f) => sum + f.confidenceScore, 0) /
                          forecasts.length) *
                          100
                      )
                    : 0}
                  %
                </div>
                <p className="text-xs text-gray-600 mt-1">Độ chính xác dự đoán</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Tổng khách hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customers.length}</div>
                <p className="text-xs text-gray-600 mt-1">Trong hệ thống</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Dự báo nhu cầu theo khách hàng</CardTitle>
              <CardDescription>
                Hệ thống tự động dự đoán sản phẩm và dịch vụ mà khách hàng có thể cần trong tương lai
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Khách hàng</TableHead>
                      <TableHead>Phân loại</TableHead>
                      <TableHead className="hidden md:table-cell">Sản phẩm dự đoán</TableHead>
                      <TableHead className="hidden lg:table-cell">Dịch vụ dự đoán</TableHead>
                      <TableHead className="text-right">Độ tin cậy</TableHead>
                      <TableHead className="text-right">Xác suất mua lại</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {forecasts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500">
                          Chưa có dữ liệu dự báo. Hãy thêm khách hàng và đơn hàng để hệ thống tự động dự đoán.
                        </TableCell>
                      </TableRow>
                    ) : (
                      forecasts.map((forecast) => (
                        <TableRow key={forecast.customerId}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{forecast.customer?.name}</div>
                              <div className="text-xs text-gray-500">{forecast.customer?.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {getSegmentBadge(forecast.customer?.segment || 'new')}
                              {getCustomerTypeBadge(forecast.customer?.customerType || 'regular')}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {forecast.predictedProducts.slice(0, 3).map((pred) => (
                                <Badge key={pred.productId} variant="outline">
                                  {pred.product?.name || pred.productId}
                                </Badge>
                              ))}
                              {forecast.predictedProducts.length > 3 && (
                                <Badge variant="outline">
                                  +{forecast.predictedProducts.length - 3}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {forecast.predictedServices.slice(0, 2).map((service, idx) => (
                                <Badge key={idx} variant="outline" className="bg-blue-50">
                                  {service}
                                </Badge>
                              ))}
                              {forecast.predictedServices.length > 2 && (
                                <Badge variant="outline">
                                  +{forecast.predictedServices.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {Math.round(forecast.confidenceScore * 100)}%
                          </TableCell>
                          <TableCell className="text-right">
                            {Math.round(forecast.nextPurchaseProbability * 100)}%
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4" />
                  Khách hàng tiềm năng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{potentialCustomers.length}</div>
                <p className="text-xs text-gray-600 mt-1">Cần quan tâm đặc biệt</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  Khách hàng ngắn hạn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{shortTermCustomers.length}</div>
                <p className="text-xs text-gray-600 mt-1">Cần chăm sóc thường xuyên</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4" />
                  Khách hàng dài hạn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{longTermCustomers.length}</div>
                <p className="text-xs text-gray-600 mt-1">Khách hàng trung thành</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Danh sách khách hàng tiềm năng</CardTitle>
              <CardDescription>
                Khách hàng mới hoặc có tiềm năng phát triển (1-3 đơn hàng)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Khách hàng</TableHead>
                      <TableHead>Phân loại</TableHead>
                      <TableHead className="hidden md:table-cell">Tổng đơn hàng</TableHead>
                      <TableHead className="text-right">Tổng chi tiêu</TableHead>
                      <TableHead className="text-right hidden lg:table-cell">TB/Đơn hàng</TableHead>
                      <TableHead className="hidden xl:table-cell">Mua lần cuối</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {potentialCustomers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500">
                          Chưa có khách hàng tiềm năng
                        </TableCell>
                      </TableRow>
                    ) : (
                      potentialCustomers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{customer.name}</div>
                              <div className="text-xs text-gray-500">{customer.email || customer.phone}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {getSegmentBadge(customer.segment)}
                              {getCustomerTypeBadge(customer.customerType)}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{customer.totalOrders}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(customer.totalSpent)}
                          </TableCell>
                          <TableCell className="text-right hidden lg:table-cell">
                            {formatCurrency(customer.averageOrderValue)}
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            {format(new Date(customer.lastPurchaseDate), 'dd/MM/yyyy')}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Khách hàng ngắn hạn</CardTitle>
                <CardDescription>Khách hàng mới hoặc ít tương tác</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {shortTermCustomers.slice(0, 5).map((customer) => (
                    <div key={customer.id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <div className="font-medium text-sm">{customer.name}</div>
                        <div className="text-xs text-gray-500">{customer.totalOrders} đơn hàng</div>
                      </div>
                      {getSegmentBadge(customer.segment)}
                    </div>
                  ))}
                  {shortTermCustomers.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">Chưa có dữ liệu</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Khách hàng dài hạn</CardTitle>
                <CardDescription>Khách hàng trung thành, mua thường xuyên</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {longTermCustomers.slice(0, 5).map((customer) => (
                    <div key={customer.id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <div className="font-medium text-sm">{customer.name}</div>
                        <div className="text-xs text-gray-500">
                          {customer.totalOrders} đơn hàng • {formatCurrency(customer.totalSpent)}
                        </div>
                      </div>
                      {getSegmentBadge(customer.segment)}
                    </div>
                  ))}
                  {longTermCustomers.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">Chưa có dữ liệu</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Dự đoán loại sản phẩm mới
              </CardTitle>
              <CardDescription>
                Hệ thống phân tích xu hướng và dự đoán các loại sản phẩm/dịch vụ mới trong tương lai
              </CardDescription>
            </CardHeader>
            <CardContent>
              {newProductPredictions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Chưa có dữ liệu đủ để dự đoán. Hãy thêm nhiều đơn hàng hơn.
                </p>
              ) : (
                <div className="space-y-4">
                  {newProductPredictions.map((prediction, idx) => (
                    <Card key={idx} className="border-l-4 border-l-blue-500">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{prediction.category}</CardTitle>
                            <CardDescription className="mt-1">{prediction.reasoning}</CardDescription>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge
                              className={
                                prediction.timeframe === 'short_term'
                                  ? 'bg-green-100 text-green-800'
                                  : prediction.timeframe === 'medium_term'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-blue-100 text-blue-800'
                              }
                            >
                              {prediction.timeframe === 'short_term'
                                ? 'Ngắn hạn'
                                : prediction.timeframe === 'medium_term'
                                ? 'Trung hạn'
                                : 'Dài hạn'}
                            </Badge>
                            <div className="text-sm text-gray-600">
                              Độ tin cậy: {Math.round(prediction.confidence * 100)}%
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Sản phẩm/Dịch vụ dự đoán:</Label>
                          <div className="flex flex-wrap gap-2">
                            {prediction.predictedProducts.map((product, pIdx) => (
                              <Badge key={pIdx} variant="outline" className="bg-blue-50">
                                <Package className="mr-1 h-3 w-3" />
                                {product}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
