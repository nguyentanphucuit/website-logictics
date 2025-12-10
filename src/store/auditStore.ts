import { create } from 'zustand'
import { AuditLog, User } from '@/types'
import { useUserStore } from './userStore'

interface AuditStore {
  auditLogs: AuditLog[]
  
  addAuditLog: (
    userId: string,
    action: string,
    resource: string,
    resourceId?: string,
    details?: string
  ) => void
  getAuditLogs: (filters?: {
    userId?: string
    resource?: string
    action?: string
    startDate?: string
    endDate?: string
  }) => AuditLog[]
}

// Mock users for audit logs
const mockUsers: Record<string, User> = {
  '1': {
    id: '1',
    username: 'admin',
    email: 'admin@logistics.com',
    fullName: 'Quản trị viên',
    role: 'admin',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  '2': {
    id: '2',
    username: 'khotruong',
    email: 'khotruong@logistics.com',
    fullName: 'Nguyễn Văn A - Kho trưởng',
    role: 'warehouse_manager',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
}

const initialAuditLogs: AuditLog[] = [
  {
    id: '1',
    userId: '1',
    user: mockUsers['1'],
    action: 'login',
    resource: 'auth',
    details: 'Đăng nhập thành công: admin',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    userId: '1',
    user: mockUsers['1'],
    action: 'create',
    resource: 'product',
    resourceId: '1',
    details: 'Tạo sản phẩm mới: Laptop Dell XPS 15',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    userId: '2',
    user: mockUsers['2'],
    action: 'update',
    resource: 'inventory',
    resourceId: '1',
    details: 'Cập nhật số lượng tồn kho: 25 -> 30',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    userId: '1',
    user: mockUsers['1'],
    action: 'delete',
    resource: 'product',
    resourceId: '5',
    details: 'Xóa sản phẩm: SKU-OLD-001',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    userId: '2',
    user: mockUsers['2'],
    action: 'update',
    resource: 'supply_chain',
    resourceId: '1',
    details: 'Cập nhật trạng thái đơn hàng ORD-001: in_transit',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    userId: '1',
    user: mockUsers['1'],
    action: 'create',
    resource: 'user',
    resourceId: '5',
    details: 'Tạo người dùng mới: Nguyễn Văn D',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '7',
    userId: '1',
    user: mockUsers['1'],
    action: 'export',
    resource: 'reports',
    details: 'Xuất báo cáo tổng hợp ra Excel',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '8',
    userId: '2',
    user: mockUsers['2'],
    action: 'read',
    resource: 'warehouse_reports',
    details: 'Xem báo cáo tồn kho',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
]

export const useAuditStore = create<AuditStore>((set, get) => ({
  auditLogs: initialAuditLogs,

  addAuditLog: (userId, action, resource, resourceId, details) => {
    const newLog: AuditLog = {
      id: Date.now().toString(),
      userId,
      action,
      resource,
      resourceId,
      details,
      timestamp: new Date().toISOString(),
    }

    set((state) => ({
      auditLogs: [newLog, ...state.auditLogs],
    }))
  },

  getAuditLogs: (filters) => {
    const { auditLogs } = get()
    // Get users from userStore to populate user data
    const users = useUserStore.getState().users
    const userMap = new Map(users.map(u => [u.id, u]))
    
    // Populate user data for logs that don't have it
    let logsWithUsers = auditLogs.map(log => ({
      ...log,
      user: log.user || userMap.get(log.userId)
    }))
    
    let filtered = [...logsWithUsers]

    if (filters) {
      if (filters.userId) {
        filtered = filtered.filter((log) => log.userId === filters.userId)
      }
      if (filters.resource) {
        filtered = filtered.filter((log) => log.resource === filters.resource)
      }
      if (filters.action) {
        filtered = filtered.filter((log) => log.action === filters.action)
      }
      if (filters.startDate) {
        filtered = filtered.filter(
          (log) => log.timestamp >= filters.startDate!
        )
      }
      if (filters.endDate) {
        filtered = filtered.filter((log) => log.timestamp <= filters.endDate!)
      }
    }

    return filtered
  },
}))

