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
import { exportWarehouseReports } from '@/lib/excelExport'
import { Badge } from '@/components/ui/badge'

function getStatusBadge(status: string) {
  const variants: Record<string, string> = {
    in_stock: 'default',
    low_stock: 'secondary',
    out_of_stock: 'destructive',
    overstock: 'outline',
  }
  
  const labels: Record<string, string> = {
    in_stock: 'Còn hàng',
    low_stock: 'Sắp hết',
    out_of_stock: 'Hết hàng',
    overstock: 'Tồn kho cao',
  }

  return (
    <Badge variant={variants[status] as any}>
      {labels[status] || status}
    </Badge>
  )
}

export default function WarehouseReports() {
  const reports = useDataStore((state) => state.getWarehouseReports())

  const handleExport = () => {
    exportWarehouseReports(reports)
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Báo cáo kho</h1>
          <p className="mt-2 text-sm text-gray-600">
            Xem tình trạng tồn kho và cảnh báo mức tồn kho
          </p>
        </div>
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Xuất Excel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Báo cáo tồn kho</CardTitle>
          <CardDescription>
            Tổng số sản phẩm: {reports.length} | Sắp hết: {reports.filter(r => r.status === 'low_stock' || r.status === 'out_of_stock').length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Tên sản phẩm</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead className="text-right">Tồn kho hiện tại</TableHead>
                <TableHead className="text-right">Tồn kho tối thiểu</TableHead>
                <TableHead className="text-right">Tồn kho tối đa</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Vị trí</TableHead>
                <TableHead>Cập nhật lần cuối</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-gray-500">
                    Chưa có dữ liệu tồn kho
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.product.sku}</TableCell>
                    <TableCell>{report.product.name}</TableCell>
                    <TableCell>{report.product.category}</TableCell>
                    <TableCell className="text-right font-medium">
                      {report.currentStock} {report.product.unit}
                    </TableCell>
                    <TableCell className="text-right">{report.minStock}</TableCell>
                    <TableCell className="text-right">{report.maxStock}</TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell>{report.location}</TableCell>
                    <TableCell>
                      {new Date(report.lastMovement).toLocaleDateString('vi-VN')}
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


