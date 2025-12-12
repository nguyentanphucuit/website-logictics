import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Package,
  BarChart3,
  Network,
  FileText,
  Home,
  Menu,
  X,
  Shield,
  FileSearch,
  LogOut,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  // Eye,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import { useAuditStore } from '@/store/auditStore'

interface LayoutProps {
  children: React.ReactNode
}

const navigationItems = [
  { name: 'Bảng điều khiển', href: '/', icon: Home, permission: null }, // Dashboard không cần permission
  { name: 'Quản lý dữ liệu', href: '/data-management', icon: Package, permission: { resource: 'products', action: 'read' } },
  { name: 'Báo cáo kho', href: '/warehouse-reports', icon: BarChart3, permission: { resource: 'warehouse_reports', action: 'read' } },
  { name: 'Chuỗi cung ứng', href: '/supply-chain', icon: Network, permission: { resource: 'supply_chain', action: 'read' } },
  // { name: 'AR/VR Vận chuyển', href: '/ar-vr-tracking', icon: Eye, permission: { resource: 'supply_chain', action: 'read' } },
  { name: 'Dự báo nhu cầu', href: '/demand-forecast', icon: TrendingUp, permission: { resource: 'demand_forecast', action: 'read' } },
  { name: 'Báo cáo & Tổng quan', href: '/reports', icon: FileText, permission: { resource: 'reports', action: 'read' } },
]

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const currentUser = useAuthStore((state) => state.currentUser)
  const logout = useAuthStore((state) => state.logout)
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const addAuditLog = useAuditStore((state) => state.addAuditLog)

  const handleLogout = () => {
    if (currentUser) {
      addAuditLog(
        currentUser.id,
        'logout',
        'auth',
        undefined,
        `Đăng xuất: ${currentUser.username}`
      )
    }
    logout()
    navigate('/login')
  }

  const canManageUsers = hasPermission('users', 'read')
  const canViewAuditLog = hasPermission('audit_log', 'read')

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transition-all duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          sidebarCollapsed ? 'lg:w-16' : 'w-64'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            {!sidebarCollapsed && (
              <h1 className="text-lg font-bold text-gray-900 whitespace-nowrap">
                Hệ thống Logistics
              </h1>
            )}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:flex"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <ChevronLeft className="h-5 w-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="px-2 space-y-1">
              {navigationItems
                .filter((item) => {
                  // Dashboard luôn hiển thị
                  if (!item.permission) return true
                  // Kiểm tra permission cho các item khác
                  return hasPermission(item.permission.resource, item.permission.action)
                })
                .map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-gray-700 hover:bg-gray-100',
                        sidebarCollapsed && 'justify-center'
                      )}
                      title={sidebarCollapsed ? item.name : undefined}
                    >
                      <Icon className={cn('h-5 w-5', !sidebarCollapsed && 'mr-3')} />
                      {!sidebarCollapsed && <span>{item.name}</span>}
                    </Link>
                  )
                })}
            </div>

            {/* Admin Section */}
            {(canManageUsers || canViewAuditLog) && (
              <div className="px-2 mt-4">
                {!sidebarCollapsed && (
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Quản trị
                  </div>
                )}
                <div className="space-y-1">
                  {canManageUsers && (
                    <Link
                      to="/user-management"
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        location.pathname === '/user-management'
                          ? 'bg-primary text-primary-foreground'
                          : 'text-gray-700 hover:bg-gray-100',
                        sidebarCollapsed && 'justify-center'
                      )}
                      title={sidebarCollapsed ? 'Quản lý người dùng' : undefined}
                    >
                      <Shield className={cn('h-5 w-5', !sidebarCollapsed && 'mr-3')} />
                      {!sidebarCollapsed && <span>Quản lý người dùng</span>}
                    </Link>
                  )}
                  {canViewAuditLog && (
                    <Link
                      to="/audit-log"
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        location.pathname === '/audit-log'
                          ? 'bg-primary text-primary-foreground'
                          : 'text-gray-700 hover:bg-gray-100',
                        sidebarCollapsed && 'justify-center'
                      )}
                      title={sidebarCollapsed ? 'Audit Log' : undefined}
                    >
                      <FileSearch className={cn('h-5 w-5', !sidebarCollapsed && 'mr-3')} />
                      {!sidebarCollapsed && <span>Audit Log</span>}
                    </Link>
                  )}
                </div>
              </div>
            )}
          </nav>

          {/* Logout Button */}
          {currentUser && (
            <div className="border-t border-gray-200 p-2">
              <Button
                variant="ghost"
                onClick={handleLogout}
                className={cn(
                  'w-full justify-start text-gray-700 hover:bg-gray-100',
                  sidebarCollapsed && 'justify-center px-2'
                )}
                title={sidebarCollapsed ? 'Đăng xuất' : undefined}
              >
                <LogOut className={cn('h-5 w-5', !sidebarCollapsed && 'mr-3')} />
                {!sidebarCollapsed && <span>Đăng xuất</span>}
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}


