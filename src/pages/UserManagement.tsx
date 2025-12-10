import { useState } from 'react'
import { useUserStore } from '@/store/userStore'
import { useAuthStore } from '@/store/authStore'
import { useAuditStore } from '@/store/auditStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Plus, Edit, Trash2, RefreshCw } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Role } from '@/types'

const ROLE_LABELS: Record<Role, string> = {
  admin: 'Quản trị viên',
  warehouse_manager: 'Kho trưởng',
  warehouse_staff: 'Nhân viên bốc xếp',
  accountant: 'Kế toán',
}

const ROLE_COLORS: Record<Role, string> = {
  admin: 'bg-red-100 text-red-800',
  warehouse_manager: 'bg-blue-100 text-blue-800',
  warehouse_staff: 'bg-green-100 text-green-800',
  accountant: 'bg-purple-100 text-purple-800',
}

export default function UserManagement() {
  const users = useUserStore((state) => state.users)
  const addUser = useUserStore((state) => state.addUser)
  const updateUser = useUserStore((state) => state.updateUser)
  const deleteUser = useUserStore((state) => state.deleteUser)
  const currentUser = useAuthStore((state) => state.currentUser)
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const addAuditLog = useAuditStore((state) => state.addAuditLog)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    role: 'warehouse_staff' as Role,
    isActive: true,
  })

  // Kiểm tra quyền
  const canManageUsers = hasPermission('users', 'create') || hasPermission('users', 'update')

  const handleOpenDialog = (userId?: string) => {
    if (userId) {
      const user = users.find((u) => u.id === userId)
      if (user) {
        setEditingUser(userId)
        setFormData({
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          isActive: user.isActive,
        })
      }
    } else {
      setEditingUser(null)
      setFormData({
        username: '',
        email: '',
        fullName: '',
        role: 'warehouse_staff',
        isActive: true,
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingUser(null)
    setFormData({
      username: '',
      email: '',
      fullName: '',
      role: 'warehouse_staff',
      isActive: true,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingUser) {
      updateUser(editingUser, formData)
      if (currentUser) {
        addAuditLog(
          currentUser.id,
          'update',
          'user',
          editingUser,
          `Cập nhật người dùng: ${formData.fullName}`
        )
      }
    } else {
      addUser(formData)
      if (currentUser) {
        addAuditLog(
          currentUser.id,
          'create',
          'user',
          undefined,
          `Tạo người dùng mới: ${formData.fullName}`
        )
      }
    }
    handleCloseDialog()
  }

  const handleDelete = (id: string) => {
    const user = users.find((u) => u.id === id)
    if (confirm(`Bạn có chắc chắn muốn xóa người dùng ${user?.fullName}?`)) {
      deleteUser(id)
      if (currentUser) {
        addAuditLog(
          currentUser.id,
          'delete',
          'user',
          id,
          `Xóa người dùng: ${user?.fullName}`
        )
      }
    }
  }

  const handleClearLocalStorage = () => {
    if (confirm('Bạn có chắc chắn muốn xóa tất cả dữ liệu trong localStorage? Hành động này sẽ đăng xuất bạn và xóa tất cả dữ liệu đã lưu.')) {
      localStorage.clear()
      if (currentUser) {
        addAuditLog(
          currentUser.id,
          'delete',
          'system',
          undefined,
          'Xóa toàn bộ localStorage'
        )
      }
      window.location.reload()
    }
  }

  if (!canManageUsers) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Không có quyền truy cập</CardTitle>
            <CardDescription className="text-center">
              Bạn không có quyền quản lý người dùng
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
          <p className="mt-2 text-xs sm:text-sm text-gray-600">
            Quản lý tài khoản và phân quyền người dùng
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {currentUser?.role === 'admin' && (
            <Button
              variant="destructive"
              onClick={handleClearLocalStorage}
              className="w-full sm:w-auto"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Xóa LocalStorage
            </Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Thêm người dùng
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Sửa người dùng' : 'Thêm người dùng mới'}
              </DialogTitle>
              <DialogDescription>
                Điền thông tin người dùng vào form bên dưới
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Tên đăng nhập *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    disabled={!!editingUser}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="fullName">Họ và tên *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Vai trò *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) =>
                      setFormData({ ...formData, role: value as Role })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Quản trị viên</SelectItem>
                      <SelectItem value="warehouse_manager">Kho trưởng</SelectItem>
                      <SelectItem value="warehouse_staff">Nhân viên bốc xếp</SelectItem>
                      <SelectItem value="accountant">Kế toán</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">
                    Tài khoản đang hoạt động
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Hủy
                </Button>
                <Button type="submit">{editingUser ? 'Cập nhật' : 'Thêm mới'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách người dùng</CardTitle>
          <CardDescription>Tổng số người dùng: {users.length}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Tên đăng nhập</TableHead>
                  <TableHead className="min-w-[150px]">Họ và tên</TableHead>
                  <TableHead className="hidden md:table-cell min-w-[180px]">Email</TableHead>
                  <TableHead className="min-w-[120px]">Vai trò</TableHead>
                  <TableHead className="min-w-[100px]">Trạng thái</TableHead>
                  <TableHead className="text-right min-w-[100px]">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500">
                      Chưa có người dùng nào
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.fullName}</TableCell>
                      <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                      <TableCell>
                        <Badge className={ROLE_COLORS[user.role]}>
                          {ROLE_LABELS[user.role]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? 'default' : 'secondary'}>
                          {user.isActive ? 'Hoạt động' : 'Vô hiệu'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(user.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(user.id)}
                            disabled={user.id === currentUser?.id}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
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

