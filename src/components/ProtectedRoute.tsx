import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermission?: {
    resource: string
    action: string
  }
}

export default function ProtectedRoute({
  children,
  requiredPermission,
}: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const hasPermission = useAuthStore((state) => state.hasPermission)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (
    requiredPermission &&
    !hasPermission(requiredPermission.resource, requiredPermission.action)
  ) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Không có quyền truy cập
          </h2>
          <p className="text-gray-600">
            Bạn không có quyền truy cập trang này
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

