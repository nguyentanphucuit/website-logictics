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


