import { useDataStore } from '@/store/dataStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, FileSpreadsheet } from 'lucide-react'
import { exportDashboard, exportWarehouseReports, exportSupplyChain } from '@/lib/excelExport'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type Slice = { label: string; value: number; color: string }

/** Biểu đồ tròn (donut) bằng SVG thuần */
function DonutChart({ data, size = 200, title }: { data: Slice[]; size?: number; title?: string }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 20
  const stroke = 28

  // Trường hợp tổng = 0: vẽ vòng tròn xám
  if (total === 0) {
    return (
      <div className="flex flex-col items-center">
        <svg width={size} height={size}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" className="text-sm fill-gray-400">
            Không có dữ liệu
          </text>
        </svg>
        {title && <div className="mt-2 text-sm font-medium text-gray-700">{title}</div>}
      </div>
    )
  }

  // Vẽ từng cung tròn dưới dạng path
  let cumulative = 0
  const polar = (angleDeg: number) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }
  const arcs = data
    .filter((d) => d.value > 0)
    .map((d, i) => {
      const startAngle = (cumulative / total) * 360
      cumulative += d.value
      const endAngle = (cumulative / total) * 360
      const largeArc = endAngle - startAngle > 180 ? 1 : 0
      const start = polar(startAngle)
      const end = polar(endAngle)
      // Trường hợp 1 slice chiếm 100%: vẽ thành 2 nửa
      const isFull = endAngle - startAngle >= 359.99
      const path = isFull
        ? `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy}`
        : `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`
      return <path key={i} d={path} fill="none" stroke={d.color} strokeWidth={stroke} />
    })

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size}>
        {arcs}
        <text x={cx} y={cy - 6} textAnchor="middle" className="text-2xl font-bold fill-gray-900">
          {total}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" className="text-[10px] fill-gray-500 uppercase tracking-wider">
          Tổng
        </text>
      </svg>
      {title && <div className="mt-1 text-sm font-medium text-gray-700">{title}</div>}
      {/* Chú thích */}
      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 w-full px-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs">
            <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-gray-600 truncate">{d.label}</span>
            <span className="ml-auto font-semibold text-gray-900">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Biểu đồ cột ngang */
function BarChart({ data, unit = '' }: { data: Slice[]; unit?: string }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className="space-y-3">
      {data.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-6">Không có dữ liệu</p>
      ) : (
        data.map((d, i) => {
          const pct = (d.value / max) * 100
          return (
            <div key={i}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-gray-700 truncate pr-2">{d.label}</span>
                <span className="text-gray-600 shrink-0">
                  {d.value}{unit ? ` ${unit}` : ''}
                </span>
              </div>
              <div className="h-6 bg-gray-100 rounded overflow-hidden">
                <div
                  className="h-full rounded transition-all duration-500 flex items-center justify-end px-2"
                  style={{ width: `${pct}%`, backgroundColor: d.color, minWidth: d.value > 0 ? '24px' : '0' }}
                >
                  {pct > 15 && (
                    <span className="text-[10px] font-semibold text-white">{Math.round(pct)}%</span>
                  )}
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

export default function Reports() {
  const stats = useDataStore((state) => state.getDashboardStats())
  const reports = useDataStore((state) => state.getWarehouseReports())
  const supplyChain = useDataStore((state) => state.supplyChain)

  const handleExportDashboard = () => {
    exportDashboard(stats, reports, supplyChain)
  }

  const handleExportWarehouse = () => {
    exportWarehouseReports(reports)
  }

  const handleExportSupplyChain = () => {
    exportSupplyChain(supplyChain)
  }

  // === Data cho biểu đồ ===
  const warehouseStatusData: Slice[] = [
    { label: 'Còn hàng', value: reports.filter((r) => r.status === 'in_stock').length, color: '#22c55e' },
    { label: 'Sắp hết', value: reports.filter((r) => r.status === 'low_stock').length, color: '#f97316' },
    { label: 'Hết hàng', value: reports.filter((r) => r.status === 'out_of_stock').length, color: '#ef4444' },
    { label: 'Tồn kho cao', value: reports.filter((r) => r.status === 'overstock').length, color: '#6b7280' },
  ]

  const orderStatusData: Slice[] = [
    { label: 'Chờ xử lý', value: stats.pendingOrders, color: '#eab308' },
    { label: 'Đang vận chuyển', value: stats.inTransitOrders, color: '#3b82f6' },
    { label: 'Đã giao', value: stats.deliveredOrders, color: '#22c55e' },
    { label: 'Đã hủy', value: supplyChain.filter((s) => s.status === 'cancelled').length, color: '#ef4444' },
  ]

  const stockBarData: Slice[] = reports.map((r, i) => ({
    label: r.product.name,
    value: r.currentStock,
    color: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'][i % 6],
  }))

  // Phân loại theo danh mục
  const categoryMap = reports.reduce((acc, r) => {
    acc[r.product.category] = (acc[r.product.category] || 0) + r.currentStock
    return acc
  }, {} as Record<string, number>)
  const categoryData: Slice[] = Object.entries(categoryMap).map(([cat, value], i) => ({
    label: cat,
    value,
    color: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][i % 5],
  }))

  return (
    <div>
      <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Báo cáo & Dashboard</h1>
          <p className="mt-2 text-xs sm:text-sm text-gray-600">
            Xem và xuất báo cáo tổng hợp
          </p>
        </div>
        <Button onClick={handleExportDashboard} className="w-full sm:w-auto">
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Xuất tất cả báo cáo</span>
          <span className="sm:hidden">Xuất tất cả</span>
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="warehouse">Báo cáo kho</TabsTrigger>
          <TabsTrigger value="supplychain">Chuỗi cung ứng</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* === HÀNG BIỂU ĐỒ === */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Phân bố tồn kho</CardTitle>
                <CardDescription>Theo trạng thái kho</CardDescription>
              </CardHeader>
              <CardContent>
                <DonutChart data={warehouseStatusData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Trạng thái đơn hàng</CardTitle>
                <CardDescription>Phân loại chuỗi cung ứng</CardDescription>
              </CardHeader>
              <CardContent>
                <DonutChart data={orderStatusData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tồn kho theo danh mục</CardTitle>
                <CardDescription>Tổng số lượng theo nhóm</CardDescription>
              </CardHeader>
              <CardContent>
                <DonutChart data={categoryData} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tồn kho từng sản phẩm</CardTitle>
              <CardDescription>So sánh số lượng hiện tại</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart data={stockBarData} />
            </CardContent>
          </Card>

          {/* === HÀNG SỐ LIỆU === */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Số liệu tổng quan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tổng sản phẩm:</span>
                    <span className="font-semibold">{stats.totalProducts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tổng tồn kho:</span>
                    <span className="font-semibold">{stats.totalInventoryValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Sản phẩm sắp hết:</span>
                    <span className="font-semibold text-orange-600">
                      {stats.lowStockItems}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Đơn hàng chờ xử lý:</span>
                    <span className="font-semibold text-yellow-600">
                      {stats.pendingOrders}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Đơn hàng đang vận chuyển:</span>
                    <span className="font-semibold text-purple-600">
                      {stats.inTransitOrders}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Đơn hàng đã giao:</span>
                    <span className="font-semibold text-green-600">
                      {stats.deliveredOrders}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Báo cáo kho</CardTitle>
                <CardDescription>
                  Tổng số: {reports.length} sản phẩm
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Còn hàng:</span>
                    <span className="font-medium">
                      {reports.filter((r) => r.status === 'in_stock').length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Sắp hết:</span>
                    <span className="font-medium text-orange-600">
                      {reports.filter((r) => r.status === 'low_stock').length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Hết hàng:</span>
                    <span className="font-medium text-red-600">
                      {reports.filter((r) => r.status === 'out_of_stock').length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tồn kho cao:</span>
                    <span className="font-medium">
                      {reports.filter((r) => r.status === 'overstock').length}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={handleExportWarehouse}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Xuất báo cáo kho
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Chuỗi cung ứng</CardTitle>
                <CardDescription>
                  Tổng số: {supplyChain.length} đơn hàng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Chờ xử lý:</span>
                    <span className="font-medium text-yellow-600">
                      {stats.pendingOrders}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Đang vận chuyển:</span>
                    <span className="font-medium text-purple-600">
                      {stats.inTransitOrders}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Đã giao:</span>
                    <span className="font-medium text-green-600">
                      {stats.deliveredOrders}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Đã hủy:</span>
                    <span className="font-medium text-red-600">
                      {supplyChain.filter((s) => s.status === 'cancelled').length}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={handleExportSupplyChain}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Xuất báo cáo chuỗi cung ứng
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="warehouse" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Phân bố trạng thái</CardTitle>
              </CardHeader>
              <CardContent>
                <DonutChart data={warehouseStatusData} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tồn kho từng sản phẩm</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart data={stockBarData} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Chi tiết báo cáo kho</CardTitle>
              <CardDescription>
                Danh sách tất cả sản phẩm trong kho
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[120px]">SKU</TableHead>
                      <TableHead className="min-w-[150px]">Tên sản phẩm</TableHead>
                      <TableHead className="text-right min-w-[100px]">Tồn kho</TableHead>
                      <TableHead className="min-w-[100px]">Trạng thái</TableHead>
                      <TableHead className="hidden md:table-cell min-w-[120px]">Vị trí</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.product.sku}</TableCell>
                        <TableCell>{report.product.name}</TableCell>
                        <TableCell className="text-right">
                          {report.currentStock} {report.product.unit}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              report.status === 'in_stock'
                                ? 'bg-green-100 text-green-800'
                                : report.status === 'low_stock'
                                ? 'bg-orange-100 text-orange-800'
                                : report.status === 'out_of_stock'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {report.status === 'in_stock'
                              ? 'Còn hàng'
                              : report.status === 'low_stock'
                              ? 'Sắp hết'
                              : report.status === 'out_of_stock'
                              ? 'Hết hàng'
                              : 'Tồn kho cao'}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{report.location}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="supplychain" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trạng thái đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="max-w-xs w-full">
                <DonutChart data={orderStatusData} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chi tiết chuỗi cung ứng</CardTitle>
              <CardDescription>
                Danh sách tất cả đơn hàng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[100px]">Mã đơn hàng</TableHead>
                      <TableHead className="min-w-[120px]">Sản phẩm</TableHead>
                      <TableHead className="hidden md:table-cell min-w-[120px]">Nhà cung cấp</TableHead>
                      <TableHead className="text-right min-w-[80px]">Số lượng</TableHead>
                      <TableHead className="min-w-[100px]">Trạng thái</TableHead>
                      <TableHead className="hidden lg:table-cell min-w-[100px]">Ngày đặt hàng</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supplyChain.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.orderId}</TableCell>
                        <TableCell>{item.product.name}</TableCell>
                        <TableCell className="hidden md:table-cell">{item.supplier}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              item.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : item.status === 'in_transit'
                                ? 'bg-blue-100 text-blue-800'
                                : item.status === 'delivered'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {item.status === 'pending'
                              ? 'Chờ xử lý'
                              : item.status === 'in_transit'
                              ? 'Đang vận chuyển'
                              : item.status === 'delivered'
                              ? 'Đã giao'
                              : 'Đã hủy'}
                          </span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {new Date(item.orderDate).toLocaleDateString('vi-VN')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
