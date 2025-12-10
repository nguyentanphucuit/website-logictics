import { useState } from 'react'
import { useAuditStore } from '@/store/auditStore'
import { useUserStore } from '@/store/userStore'
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
import { Download, Filter } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { exportAuditLogs } from '@/lib/excelExport'

const ACTION_LABELS: Record<string, string> = {
  create: 'Tạo mới',
  update: 'Cập nhật',
  delete: 'Xóa',
  read: 'Xem',
  export: 'Xuất file',
  login: 'Đăng nhập',
  logout: 'Đăng xuất',
}

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-green-100 text-green-800',
  update: 'bg-blue-100 text-blue-800',
  delete: 'bg-red-100 text-red-800',
  read: 'bg-gray-100 text-gray-800',
  export: 'bg-purple-100 text-purple-800',
  login: 'bg-yellow-100 text-yellow-800',
  logout: 'bg-orange-100 text-orange-800',
}

export default function AuditLog() {
  const getAuditLogs = useAuditStore((state) => state.getAuditLogs)
  const users = useUserStore((state) => state.users)
  const [filters, setFilters] = useState({
    userId: 'all',
    resource: 'all',
    action: 'all',
    startDate: '',
    endDate: '',
  })

  // Convert filter values for API call
  const filterParams = {
    userId: filters.userId === 'all' ? undefined : filters.userId,
    resource: filters.resource === 'all' ? undefined : filters.resource,
    action: filters.action === 'all' ? undefined : filters.action,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
  }

  const auditLogs = getAuditLogs(filterParams)

  const handleExport = () => {
    exportAuditLogs(auditLogs)
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    setFilters({
      userId: 'all',
      resource: 'all',
      action: 'all',
      startDate: '',
      endDate: '',
    })
  }

  // Get all unique resources and actions from all logs (not just filtered)
  const allLogs = useAuditStore((state) => state.auditLogs)
  const resources = Array.from(new Set(allLogs.map((log) => log.resource)))
  const actions = Array.from(new Set(allLogs.map((log) => log.action)))

  return (
    <div>
      <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Audit Log</h1>
          <p className="mt-2 text-xs sm:text-sm text-gray-600">
            Lịch sử thao tác của người dùng trong hệ thống
          </p>
        </div>
        <Button onClick={handleExport} className="w-full sm:w-auto">
          <Download className="mr-2 h-4 w-4" />
          Xuất Excel
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label>Người dùng</Label>
              <Select
                value={filters.userId}
                onValueChange={(value) => handleFilterChange('userId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả người dùng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả người dùng</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Tài nguyên</Label>
              <Select
                value={filters.resource}
                onValueChange={(value) => handleFilterChange('resource', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả tài nguyên" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả tài nguyên</SelectItem>
                  {resources.map((resource) => (
                    <SelectItem key={resource} value={resource}>
                      {resource}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Hành động</Label>
              <Select
                value={filters.action}
                onValueChange={(value) => handleFilterChange('action', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả hành động" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả hành động</SelectItem>
                  {actions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {ACTION_LABELS[action] || action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Từ ngày</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Đến ngày</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Xóa bộ lọc
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lịch sử thao tác</CardTitle>
          <CardDescription>
            Tổng số bản ghi: {auditLogs.length} | Đang hiển thị: {auditLogs.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Thời gian</TableHead>
                  <TableHead className="min-w-[120px]">Người dùng</TableHead>
                  <TableHead className="min-w-[100px]">Hành động</TableHead>
                  <TableHead className="min-w-[100px]">Tài nguyên</TableHead>
                  <TableHead className="hidden md:table-cell min-w-[120px]">ID tài nguyên</TableHead>
                  <TableHead className="min-w-[200px]">Chi tiết</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500">
                      Không có dữ liệu audit log
                    </TableCell>
                  </TableRow>
                ) : (
                  auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {new Date(log.timestamp).toLocaleString('vi-VN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell>
                        {log.user?.fullName || `User ID: ${log.userId}`}
                      </TableCell>
                      <TableCell>
                        <Badge className={ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-800'}>
                          {ACTION_LABELS[log.action] || log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{log.resource}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {log.resourceId || '-'}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {log.details || '-'}
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

