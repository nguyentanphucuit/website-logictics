import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Download, Edit } from 'lucide-react'
import { exportWarehouseReports } from '@/lib/excelExport'
import { Badge } from '@/components/ui/badge'
import { WarehouseReport, InventoryCondition, AuditCheck } from '@/types'

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

function getConditionBadge(condition: InventoryCondition) {
  const variants: Record<InventoryCondition, string> = {
    new: 'default',
    good: 'secondary',
    damaged: 'destructive',
    expired: 'destructive',
  }
  const labels: Record<InventoryCondition, string> = {
    new: 'Mới',
    good: 'Tốt',
    damaged: 'Hư hỏng',
    expired: 'Hết hạn',
  }
  return <Badge variant={variants[condition] as any}>{labels[condition]}</Badge>
}

function getExpiryInfo(expiryDate?: string) {
  if (!expiryDate) {
    return { label: 'Không áp dụng', variant: 'outline' as const, days: null }
  }
  const now = Date.now()
  const exp = new Date(expiryDate).getTime()
  const days = Math.ceil((exp - now) / (24 * 60 * 60 * 1000))
  if (days < 0) return { label: 'Đã hết hạn', variant: 'destructive' as const, days }
  if (days <= 30) return { label: `Còn ${days} ngày`, variant: 'secondary' as const, days }
  return { label: `Còn ${days} ngày`, variant: 'default' as const, days }
}

function Barcode({ code }: { code: string }) {
  const widths = code.split('').map((d) => (parseInt(d, 10) % 3) + 1)
  return (
    <div className="inline-flex flex-col items-center gap-0.5 bg-white px-1.5 py-1 rounded border">
      <div className="flex items-end h-6 gap-px">
        {widths.map((w, i) => (
          <div
            key={i}
            className={i % 2 === 0 ? 'bg-black' : 'bg-white'}
            style={{ width: `${w}px`, height: '100%' }}
          />
        ))}
      </div>
      <span className="font-mono text-[10px] tracking-widest leading-none">{code}</span>
    </div>
  )
}

function suggestReorderQty(report: WarehouseReport) {
  if (report.reorderQuantity > 0) return report.reorderQuantity
  if (report.status === 'out_of_stock' || report.status === 'low_stock') {
    return Math.max(report.maxStock - report.currentStock, 0)
  }
  return 0
}

function toDateInputValue(iso?: string) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

type AuditForm = {
  quantity: number
  condition: InventoryCondition
  expiryDate: string
  supplier: string
  reorderQuantity: number
  auditCheck: AuditCheck | 'none'
  barcode: string
}

const emptyForm: AuditForm = {
  quantity: 0,
  condition: 'good',
  expiryDate: '',
  supplier: '',
  reorderQuantity: 0,
  auditCheck: 'none',
  barcode: '',
}

export default function WarehouseReports() {
  const allReports = useDataStore((state) => state.getWarehouseReports())
  const updateInventoryItem = useDataStore((state) => state.updateInventoryItem)
  const [searchParams, setSearchParams] = useSearchParams()
  const filter = searchParams.get('filter') // 'low_stock' | null

  const reports =
    filter === 'low_stock'
      ? allReports.filter((r) => r.status === 'low_stock' || r.status === 'out_of_stock')
      : allReports

  const clearFilter = () => {
    searchParams.delete('filter')
    setSearchParams(searchParams)
  }

  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<AuditForm>(emptyForm)

  const handleExport = () => {
    exportWarehouseReports(reports)
  }

  const openEdit = (r: WarehouseReport) => {
    setEditingId(r.id)
    setForm({
      quantity: r.currentStock,
      condition: r.condition,
      expiryDate: toDateInputValue(r.expiryDate),
      supplier: r.supplier,
      reorderQuantity: r.reorderQuantity,
      auditCheck: r.auditCheck ?? 'none',
      barcode: r.barcode,
    })
  }

  const closeEdit = () => {
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleSave = () => {
    if (!editingId) return
    updateInventoryItem(editingId, {
      quantity: Number(form.quantity) || 0,
      condition: form.condition,
      expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : undefined,
      supplier: form.supplier,
      reorderQuantity: Number(form.reorderQuantity) || 0,
      auditCheck: form.auditCheck === 'none' ? undefined : form.auditCheck,
      barcode: form.barcode,
    })
    closeEdit()
  }

  const setAuditCheckQuick = (id: string, value: AuditCheck) => {
    updateInventoryItem(id, { auditCheck: value })
  }

  const reorderList = reports.filter(
    (r) => suggestReorderQty(r) > 0 || r.status === 'low_stock' || r.status === 'out_of_stock'
  )

  const EditButton = ({ r }: { r: WarehouseReport }) => (
    <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>
      <Edit className="h-4 w-4 mr-1" />
      Sửa
    </Button>
  )

  const auditTriggerColor: Record<AuditCheck | 'none', string> = {
    none: '',
    sufficient: 'bg-green-100 text-green-800 border-green-300 font-medium',
    missing: 'bg-red-100 text-red-800 border-red-300 font-medium',
    excess: 'bg-yellow-100 text-yellow-800 border-yellow-300 font-medium',
  }

  const AuditCheckPicker = ({ r }: { r: WarehouseReport }) => {
    const current = r.auditCheck ?? 'none'
    return (
      <Select
        value={current}
        onValueChange={(v) =>
          v === 'none'
            ? updateInventoryItem(r.id, { auditCheck: undefined })
            : setAuditCheckQuick(r.id, v as AuditCheck)
        }
      >
        <SelectTrigger className={`h-8 w-[110px] ${auditTriggerColor[current]}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Chưa kiểm</SelectItem>
          <SelectItem value="sufficient" className="text-green-700 font-medium">Đủ</SelectItem>
          <SelectItem value="missing" className="text-red-700 font-medium">Thiếu</SelectItem>
          <SelectItem value="excess" className="text-yellow-700 font-medium">Dư</SelectItem>
        </SelectContent>
      </Select>
    )
  }

  return (
    <div>
      <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Báo cáo kho</h1>
          <p className="mt-2 text-xs sm:text-sm text-gray-600">
            Xem tình trạng tồn kho, kiểm kê hàng hóa và cảnh báo mức tồn kho
          </p>
        </div>
        <Button onClick={handleExport} className="w-full sm:w-auto">
          <Download className="mr-2 h-4 w-4" />
          Xuất Excel
        </Button>
      </div>

      {filter === 'low_stock' && (
        <div className="mb-4 flex items-center justify-between gap-3 bg-orange-50 border border-orange-200 rounded-lg px-4 py-3">
          <div className="text-sm text-orange-800">
            Đang lọc: <span className="font-semibold">Sản phẩm sắp hết / hết hàng</span> ({reports.length} sản phẩm)
          </div>
          <Button variant="ghost" size="sm" onClick={clearFilter} className="text-orange-700 hover:text-orange-900 hover:bg-orange-100">
            Bỏ lọc
          </Button>
        </div>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="overview">Báo cáo tồn kho</TabsTrigger>
          <TabsTrigger value="audit">Kiểm kê hàng hóa</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Báo cáo tồn kho</CardTitle>
              <CardDescription>
                Tổng số sản phẩm: {reports.length} | Sắp hết:{' '}
                {reports.filter((r) => r.status === 'low_stock' || r.status === 'out_of_stock').length}
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
                      <TableHead className="text-right min-w-[90px]">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center text-gray-500">
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
                          <TableCell className="text-right">
                            <EditButton r={report} />
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

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Kiểm kê hàng hóa</CardTitle>
              <CardDescription>
                Theo dõi và chỉnh sửa số lượng, tình trạng, hạn sử dụng, nhà cung cấp, tồn kho và đề xuất đặt hàng bổ sung
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="quantity" className="w-full">
                <TabsList className="flex flex-wrap h-auto">
                  <TabsTrigger value="quantity">Số lượng</TabsTrigger>
                  <TabsTrigger value="condition">Tình trạng</TabsTrigger>
                  <TabsTrigger value="expiry">Hạn sử dụng</TabsTrigger>
                  <TabsTrigger value="supplier">Nhà cung cấp</TabsTrigger>
                  <TabsTrigger value="stock">Tồn kho</TabsTrigger>
                  <TabsTrigger value="reorder">Đặt hàng bổ sung</TabsTrigger>
                </TabsList>

                <TabsContent value="quantity">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>SKU</TableHead>
                          <TableHead>Mã vạch</TableHead>
                          <TableHead>Tên sản phẩm</TableHead>
                          <TableHead className="text-right">Số lượng</TableHead>
                          <TableHead>Đơn vị</TableHead>
                          <TableHead className="hidden md:table-cell">Vị trí</TableHead>
                          <TableHead>Kiểm kê</TableHead>
                          <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reports.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell className="font-medium">{r.product.sku}</TableCell>
                            <TableCell><Barcode code={r.barcode} /></TableCell>
                            <TableCell>{r.product.name}</TableCell>
                            <TableCell className="text-right font-medium">{r.currentStock}</TableCell>
                            <TableCell>{r.product.unit}</TableCell>
                            <TableCell className="hidden md:table-cell">{r.location}</TableCell>
                            <TableCell><AuditCheckPicker r={r} /></TableCell>
                            <TableCell className="text-right">
                              <EditButton r={r} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="condition">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>SKU</TableHead>
                          <TableHead>Mã vạch</TableHead>
                          <TableHead>Tên sản phẩm</TableHead>
                          <TableHead>Tình trạng</TableHead>
                          <TableHead className="hidden md:table-cell">Vị trí</TableHead>
                          <TableHead className="hidden md:table-cell">Cập nhật lần cuối</TableHead>
                          <TableHead>Kiểm kê</TableHead>
                          <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reports.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell className="font-medium">{r.product.sku}</TableCell>
                            <TableCell><Barcode code={r.barcode} /></TableCell>
                            <TableCell>{r.product.name}</TableCell>
                            <TableCell>{getConditionBadge(r.condition)}</TableCell>
                            <TableCell className="hidden md:table-cell">{r.location}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              {new Date(r.lastMovement).toLocaleDateString('vi-VN')}
                            </TableCell>
                            <TableCell><AuditCheckPicker r={r} /></TableCell>
                            <TableCell className="text-right">
                              <EditButton r={r} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="expiry">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>SKU</TableHead>
                          <TableHead>Mã vạch</TableHead>
                          <TableHead>Tên sản phẩm</TableHead>
                          <TableHead>Hạn sử dụng</TableHead>
                          <TableHead>Còn lại</TableHead>
                          <TableHead>Kiểm kê</TableHead>
                          <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reports.map((r) => {
                          const info = getExpiryInfo(r.expiryDate)
                          return (
                            <TableRow key={r.id}>
                              <TableCell className="font-medium">{r.product.sku}</TableCell>
                              <TableCell><Barcode code={r.barcode} /></TableCell>
                              <TableCell>{r.product.name}</TableCell>
                              <TableCell>
                                {r.expiryDate
                                  ? new Date(r.expiryDate).toLocaleDateString('vi-VN')
                                  : '—'}
                              </TableCell>
                              <TableCell>
                                <Badge variant={info.variant as any}>{info.label}</Badge>
                              </TableCell>
                              <TableCell><AuditCheckPicker r={r} /></TableCell>
                              <TableCell className="text-right">
                                <EditButton r={r} />
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="supplier">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>SKU</TableHead>
                          <TableHead>Mã vạch</TableHead>
                          <TableHead>Tên sản phẩm</TableHead>
                          <TableHead>Nhà cung cấp</TableHead>
                          <TableHead className="hidden md:table-cell">Danh mục</TableHead>
                          <TableHead>Kiểm kê</TableHead>
                          <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reports.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell className="font-medium">{r.product.sku}</TableCell>
                            <TableCell><Barcode code={r.barcode} /></TableCell>
                            <TableCell>{r.product.name}</TableCell>
                            <TableCell>{r.supplier}</TableCell>
                            <TableCell className="hidden md:table-cell">{r.product.category}</TableCell>
                            <TableCell><AuditCheckPicker r={r} /></TableCell>
                            <TableCell className="text-right">
                              <EditButton r={r} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="stock">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>SKU</TableHead>
                          <TableHead>Mã vạch</TableHead>
                          <TableHead>Tên sản phẩm</TableHead>
                          <TableHead className="text-right">Hiện tại</TableHead>
                          <TableHead className="text-right">Tối thiểu</TableHead>
                          <TableHead className="text-right">Tối đa</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead>Kiểm kê</TableHead>
                          <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reports.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell className="font-medium">{r.product.sku}</TableCell>
                            <TableCell><Barcode code={r.barcode} /></TableCell>
                            <TableCell>{r.product.name}</TableCell>
                            <TableCell className="text-right font-medium">
                              {r.currentStock} {r.product.unit}
                            </TableCell>
                            <TableCell className="text-right">{r.minStock}</TableCell>
                            <TableCell className="text-right">{r.maxStock}</TableCell>
                            <TableCell>{getStatusBadge(r.status)}</TableCell>
                            <TableCell><AuditCheckPicker r={r} /></TableCell>
                            <TableCell className="text-right">
                              <EditButton r={r} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="reorder">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>SKU</TableHead>
                          <TableHead>Mã vạch</TableHead>
                          <TableHead>Tên sản phẩm</TableHead>
                          <TableHead>Nhà cung cấp</TableHead>
                          <TableHead className="text-right">Tồn kho</TableHead>
                          <TableHead className="text-right">Tối thiểu</TableHead>
                          <TableHead className="text-right">SL đề xuất đặt</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead>Kiểm kê</TableHead>
                          <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reorderList.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={10} className="text-center text-gray-500">
                              Không có sản phẩm cần đặt hàng bổ sung
                            </TableCell>
                          </TableRow>
                        ) : (
                          reorderList.map((r) => (
                            <TableRow key={r.id}>
                              <TableCell className="font-medium">{r.product.sku}</TableCell>
                              <TableCell><Barcode code={r.barcode} /></TableCell>
                              <TableCell>{r.product.name}</TableCell>
                              <TableCell>{r.supplier}</TableCell>
                              <TableCell className="text-right">{r.currentStock}</TableCell>
                              <TableCell className="text-right">{r.minStock}</TableCell>
                              <TableCell className="text-right font-medium text-orange-600">
                                {suggestReorderQty(r)} {r.product.unit}
                              </TableCell>
                              <TableCell>{getStatusBadge(r.status)}</TableCell>
                              <TableCell><AuditCheckPicker r={r} /></TableCell>
                              <TableCell className="text-right">
                                <EditButton r={r} />
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={editingId !== null} onOpenChange={(open) => !open && closeEdit()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sửa kiểm kê hàng hóa</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin kiểm kê cho sản phẩm. Bấm Lưu để áp dụng.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="barcode">Mã vạch</Label>
              <Input
                id="barcode"
                value={form.barcode}
                onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                placeholder="VD: 8801068939842"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="quantity">Số lượng</Label>
              <Input
                id="quantity"
                type="number"
                min={0}
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="condition">Tình trạng</Label>
              <Select
                value={form.condition}
                onValueChange={(v) => setForm({ ...form, condition: v as InventoryCondition })}
              >
                <SelectTrigger id="condition">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Mới</SelectItem>
                  <SelectItem value="good">Tốt</SelectItem>
                  <SelectItem value="damaged">Hư hỏng</SelectItem>
                  <SelectItem value="expired">Hết hạn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="expiryDate">Hạn sử dụng</Label>
              <Input
                id="expiryDate"
                type="date"
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
              />
              <p className="text-xs text-gray-500">Để trống nếu sản phẩm không có hạn sử dụng</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="supplier">Nhà cung cấp</Label>
              <Input
                id="supplier"
                value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reorderQuantity">Số lượng đặt hàng bổ sung</Label>
              <Input
                id="reorderQuantity"
                type="number"
                min={0}
                value={form.reorderQuantity}
                onChange={(e) => setForm({ ...form, reorderQuantity: Number(e.target.value) })}
              />
              <p className="text-xs text-gray-500">Đặt 0 để hệ thống tự đề xuất khi tồn kho thấp</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="auditCheck">Kết quả kiểm kê</Label>
              <Select
                value={form.auditCheck}
                onValueChange={(v) =>
                  setForm({ ...form, auditCheck: v as AuditCheck | 'none' })
                }
              >
                <SelectTrigger id="auditCheck">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Chưa kiểm</SelectItem>
                  <SelectItem value="sufficient">Đủ</SelectItem>
                  <SelectItem value="missing">Thiếu</SelectItem>
                  <SelectItem value="excess">Dư</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeEdit}>
              Hủy
            </Button>
            <Button onClick={handleSave}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
