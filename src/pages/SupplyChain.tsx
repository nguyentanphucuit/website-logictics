import { useDataStore } from '@/store/dataStore'
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
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'

function getStatusBadge(status: string) {
  const variants: Record<string, string> = {
    pending: 'secondary',
    in_transit: 'default',
    delivered: 'outline',
    cancelled: 'destructive',
  }
  
  const labels: Record<string, string> = {
    pending: 'Chờ xử lý',
    in_transit: 'Đang vận chuyển',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy',
  }

  return (
    <Badge variant={variants[status] as any}>
      {labels[status] || status}
    </Badge>
  )
}

export default function SupplyChain() {
  const supplyChain = useDataStore((state) => state.supplyChain)
  const updateSupplyChainStatus = useDataStore((state) => state.updateSupplyChainStatus)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const handleExport = () => {
    exportSupplyChain(supplyChain)
  }

  const handleStatusChange = (id: string, newStatus: string) => {
    updateSupplyChainStatus(id, { status: newStatus as any })
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
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Phân tích chuỗi cung ứng</h1>
          <p className="mt-2 text-sm text-gray-600">
            Theo dõi trạng thái đơn hàng và chuỗi cung ứng
          </p>
        </div>
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Xuất Excel
        </Button>
      </div>

      <div className="mb-6 flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Lọc theo trạng thái:</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đơn hàng</TableHead>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Nhà cung cấp</TableHead>
                <TableHead className="text-right">Số lượng</TableHead>
                <TableHead>Ngày đặt hàng</TableHead>
                <TableHead>Ngày dự kiến</TableHead>
                <TableHead>Ngày thực tế</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ghi chú</TableHead>
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
                    <TableCell>{item.product.sku}</TableCell>
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell>
                      {new Date(item.orderDate).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell>
                      {new Date(item.expectedDate).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell>
                      {item.actualDate
                        ? new Date(item.actualDate).toLocaleDateString('vi-VN')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={item.status}
                        onValueChange={(value) => handleStatusChange(item.id, value)}
                      >
                        <SelectTrigger className="w-[150px]">
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
                    <TableCell className="max-w-xs truncate">
                      {item.notes || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}


