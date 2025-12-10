import { create } from 'zustand'
import { User, Permission, ROLE_PERMISSIONS_WITH_AUDIT, ROLE_PERMISSIONS } from '@/types'

interface AuthStore {
  currentUser: User | null
  isAuthenticated: boolean
  
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  setCurrentUser: (user: User | null) => void
  hasPermission: (resource: string, action: string) => boolean
}

// Mock users data
const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@logistics.com',
    fullName: 'Quản trị viên',
    role: 'admin',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    username: 'khotruong',
    email: 'khotruong@logistics.com',
    fullName: 'Nguyễn Văn A - Kho trưởng',
    role: 'warehouse_manager',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    username: 'nhanvien',
    email: 'nhanvien@logistics.com',
    fullName: 'Trần Thị B - Nhân viên bốc xếp',
    role: 'warehouse_staff',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    username: 'ketoan',
    email: 'ketoan@logistics.com',
    fullName: 'Lê Văn C - Kế toán',
    role: 'accountant',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// Mock passwords (trong thực tế sẽ hash và lưu trong database)
const mockPasswords: Record<string, string> = {
  admin: 'admin123',
  khotruong: 'kho123',
  nhanvien: 'nv123',
  ketoan: 'kt123',
}

// Load user from localStorage
const getInitialState = (): { currentUser: User | null; isAuthenticated: boolean } => {
  try {
    const stored = localStorage.getItem('auth-user')
    if (stored) {
      const user = JSON.parse(stored) as User
      // Verify user still exists in mockUsers
      const validUser = mockUsers.find((u) => u.id === user.id && u.username === user.username)
      if (validUser && validUser.isActive) {
        return { currentUser: validUser, isAuthenticated: true }
      }
    }
  } catch (error) {
    console.error('Error loading user from localStorage:', error)
  }
  return { currentUser: null, isAuthenticated: false }
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  ...getInitialState(),

  login: async (username: string, password: string) => {
    // Trim username
    const trimmedUsername = username.trim()
    
    // Mock authentication - find user by exact username match
    const user = mockUsers.find((u) => u.username === trimmedUsername)
    
    if (!user) {
      return false
    }
    
    // Get password for this specific username
    const correctPassword = mockPasswords[user.username]
    
    // Check password and active status
    if (correctPassword && correctPassword === password && user.isActive) {
      set({ currentUser: user, isAuthenticated: true })
      // Lưu vào localStorage
      localStorage.setItem('auth-user', JSON.stringify(user))
      return true
    }
    return false
  },

  logout: () => {
    set({ currentUser: null, isAuthenticated: false })
    // Xóa khỏi localStorage
    localStorage.removeItem('auth-user')
  },

  setCurrentUser: (user) => {
    set({ currentUser: user, isAuthenticated: !!user })
    // Lưu vào localStorage nếu có user, xóa nếu không
    if (user) {
      localStorage.setItem('auth-user', JSON.stringify(user))
    } else {
      localStorage.removeItem('auth-user')
    }
  },

  hasPermission: (resource: string, action: string) => {
    const { currentUser } = get()
    if (!currentUser) return false

    // Admin có tất cả quyền
    if (currentUser.role === 'admin') return true

    // Kiểm tra quyền theo role
    const permissions = ROLE_PERMISSIONS_WITH_AUDIT[currentUser.role] || ROLE_PERMISSIONS[currentUser.role] || []

    return permissions.some((perm: Permission) => {
      // Kiểm tra resource
      const resourceMatch =
        perm.resource === '*' || perm.resource === resource

      // Kiểm tra action
      const actionMatch =
        perm.actions.includes('*') || perm.actions.includes(action)

      return resourceMatch && actionMatch
    })
  },
}))

