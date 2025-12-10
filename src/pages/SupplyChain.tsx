import { useDataStore } from '@/store/dataStore'
import { useAuthStore } from '@/store/authStore'
import { useAuditStore } from '@/store/auditStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { exportSupplyChain } from '@/lib/excelExport'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'

export default function SupplyChain() {
  const supplyChain = useDataStore((state) => state.supplyChain)
  const updateSupplyChainStatus = useDataStore((state) => state.updateSupplyChainStatus)
  const currentUser = useAuthStore((state) => state.currentUser)
  const addAuditLog = useAuditStore((state) => state.addAuditLog)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const handleExport = () => {
    exportSupplyChain(supplyChain)
  }

  const handleStatusChange = (id: string, newStatus: string) => {
    const item = supplyChain.find((s) => s.id === id)
    updateSupplyChainStatus(id, { status: newStatus as any })
    if (currentUser && item) {
      addAuditLog(
        currentUser.id,
        'update',
        'supply_chain',
        id,
        `Cập nhật trạng thái đơn hàng ${item.orderId}: ${newStatus}`
      )
    }
  }

  const filteredSupplyChain = statusFilter === 'all' 
    ? supplyChain 
    : supplyChain.filter(item => item.status === statusFilter)

  const statusCounts = {
    all: supplyChain.length,
    pending: supplyChain.filter(s => s.status === 'pending').length,
    in_transit: supplyChain.filter(s => s.status === 'in_transit').length,
    delivered: supplyChain.filter(s => s.status === 'delivered').length,
    cancelled: supplyChain.filter(s => s.status === 'cancelled').length,
  }

  return (
    <div>
      <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Phân tích chuỗi cung ứng</h1>
          <p className="mt-2 text-xs sm:text-sm text-gray-600">
            Theo dõi trạng thái đơn hàng và chuỗi cung ứng
          </p>
        </div>
        <Button onClick={handleExport} className="w-full sm:w-auto">
          <Download className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Xuất Excel</span>
          <span className="sm:hidden">Xuất</span>
        </Button>
      </div>

      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-4 items-stretch sm:items-center">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
          <span className="text-xs sm:text-sm font-medium whitespace-nowrap">Lọc theo trạng thái:</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả ({statusCounts.all})</SelectItem>
              <SelectItem value="pending">Chờ xử lý ({statusCounts.pending})</SelectItem>
              <SelectItem value="in_transit">Đang vận chuyển ({statusCounts.in_transit})</SelectItem>
              <SelectItem value="delivered">Đã giao ({statusCounts.delivered})</SelectItem>
              <SelectItem value="cancelled">Đã hủy ({statusCounts.cancelled})</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trạng thái chuỗi cung ứng</CardTitle>
          <CardDescription>
            Tổng số đơn hàng: {supplyChain.length} | Đang hiển thị: {filteredSupplyChain.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">Mã đơn hàng</TableHead>
                  <TableHead className="min-w-[120px]">Sản phẩm</TableHead>
                  <TableHead className="hidden md:table-cell min-w-[120px]">SKU</TableHead>
                  <TableHead className="min-w-[120px]">Nhà cung cấp</TableHead>
                  <TableHead className="text-right min-w-[80px]">Số lượng</TableHead>
                  <TableHead className="hidden lg:table-cell min-w-[100px]">Ngày đặt hàng</TableHead>
                  <TableHead className="hidden lg:table-cell min-w-[100px]">Ngày dự kiến</TableHead>
                  <TableHead className="hidden xl:table-cell min-w-[100px]">Ngày thực tế</TableHead>
                  <TableHead className="min-w-[140px]">Trạng thái</TableHead>
                  <TableHead className="hidden xl:table-cell min-w-[120px]">Ghi chú</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSupplyChain.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-gray-500">
                      Chưa có dữ liệu chuỗi cung ứng
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSupplyChain.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.orderId}</TableCell>
                      <TableCell>{item.product.name}</TableCell>
                      <TableCell className="hidden md:table-cell">{item.product.sku}</TableCell>
                      <TableCell className="truncate max-w-[120px]">{item.supplier}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {new Date(item.orderDate).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {new Date(item.expectedDate).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        {item.actualDate
                          ? new Date(item.actualDate).toLocaleDateString('vi-VN')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={item.status}
                          onValueChange={(value) => handleStatusChange(item.id, value)}
                        >
                          <SelectTrigger className="w-full sm:w-[150px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Chờ xử lý</SelectItem>
                            <SelectItem value="in_transit">Đang vận chuyển</SelectItem>
                            <SelectItem value="delivered">Đã giao</SelectItem>
                            <SelectItem value="cancelled">Đã hủy</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell max-w-xs truncate">
                        {item.notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


