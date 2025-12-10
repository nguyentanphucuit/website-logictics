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
      <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Báo cáo kho</h1>
          <p className="mt-2 text-xs sm:text-sm text-gray-600">
            Xem tình trạng tồn kho và cảnh báo mức tồn kho
          </p>
        </div>
        <Button onClick={handleExport} className="w-full sm:w-auto">
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">SKU</TableHead>
                  <TableHead className="min-w-[150px]">Tên sản phẩm</TableHead>
                  <TableHead className="hidden md:table-cell min-w-[100px]">Danh mục</TableHead>
                  <TableHead className="text-right min-w-[100px]">Tồn kho hiện tại</TableHead>
                  <TableHead className="text-right hidden lg:table-cell min-w-[100px]">Tồn kho tối thiểu</TableHead>
                  <TableHead className="text-right hidden lg:table-cell min-w-[100px]">Tồn kho tối đa</TableHead>
                  <TableHead className="min-w-[100px]">Trạng thái</TableHead>
                  <TableHead className="hidden md:table-cell min-w-[120px]">Vị trí</TableHead>
                  <TableHead className="hidden xl:table-cell min-w-[120px]">Cập nhật lần cuối</TableHead>
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
                      <TableCell className="hidden md:table-cell">{report.product.category}</TableCell>
                      <TableCell className="text-right font-medium">
                        {report.currentStock} {report.product.unit}
                      </TableCell>
                      <TableCell className="text-right hidden lg:table-cell">{report.minStock}</TableCell>
                      <TableCell className="text-right hidden lg:table-cell">{report.maxStock}</TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell className="hidden md:table-cell">{report.location}</TableCell>
                      <TableCell className="hidden xl:table-cell">
                        {new Date(report.lastMovement).toLocaleDateString('vi-VN')}
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


