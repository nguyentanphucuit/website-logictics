import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useAuditStore } from '@/store/auditStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const addAuditLog = useAuditStore((state) => state.addAuditLog)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const success = await login(username.trim(), password)
      if (success) {
        // Wait a bit for state to update
        await new Promise(resolve => setTimeout(resolve, 100))
        const currentUser = useAuthStore.getState().currentUser
        if (currentUser) {
          addAuditLog(
            currentUser.id,
            'login',
            'auth',
            undefined,
            `Đăng nhập thành công: ${username}`
          )
        }
        navigate('/')
      } else {
        setError('Tên đăng nhập hoặc mật khẩu không đúng')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Đã xảy ra lỗi. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Đăng nhập</CardTitle>
          <CardDescription>
            Hệ thống Quản lý Logistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                placeholder="Nhập tên đăng nhập"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Nhập mật khẩu"
              />
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <p>Tài khoản demo:</p>
              <p>• Admin: admin / admin123</p>
              <p>• Kho trưởng: khotruong / kho123</p>
              <p>• Nhân viên: nhanvien / nv123</p>
              <p>• Kế toán: ketoan / kt123</p>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

