import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import DataManagement from './pages/DataManagement'
import WarehouseReports from './pages/WarehouseReports'
import SupplyChain from './pages/SupplyChain'
import Reports from './pages/Reports'
import UserManagement from './pages/UserManagement'
import AuditLog from './pages/AuditLog'
import DemandForecast from './pages/DemandForecast'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuthStore } from './store/authStore'

function AppRoutes() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/data-management"
        element={
          <ProtectedRoute
            requiredPermission={{ resource: 'products', action: 'read' }}
          >
            <Layout>
              <DataManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/warehouse-reports"
        element={
          <ProtectedRoute
            requiredPermission={{ resource: 'warehouse_reports', action: 'read' }}
          >
            <Layout>
              <WarehouseReports />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/supply-chain"
        element={
          <ProtectedRoute
            requiredPermission={{ resource: 'supply_chain', action: 'read' }}
          >
            <Layout>
              <SupplyChain />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute
            requiredPermission={{ resource: 'reports', action: 'read' }}
          >
            <Layout>
              <Reports />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user-management"
        element={
          <ProtectedRoute
            requiredPermission={{ resource: 'users', action: 'read' }}
          >
            <Layout>
              <UserManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/audit-log"
        element={
          <ProtectedRoute
            requiredPermission={{ resource: 'audit_log', action: 'read' }}
          >
            <Layout>
              <AuditLog />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/demand-forecast"
        element={
          <ProtectedRoute
            requiredPermission={{ resource: 'demand_forecast', action: 'read' }}
          >
            <Layout>
              <DemandForecast />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App



