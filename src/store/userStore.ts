import { create } from 'zustand'
import { User } from '@/types'

interface UserStore {
  users: User[]
  
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateUser: (id: string, user: Partial<User>) => void
  deleteUser: (id: string) => void
  getUserById: (id: string) => User | undefined
}

const initialUsers: User[] = [
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

export const useUserStore = create<UserStore>((set, get) => ({
  users: initialUsers,

  addUser: (userData) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    set((state) => ({
      users: [...state.users, newUser],
    }))
  },

  updateUser: (id, userData) => {
    set((state) => ({
      users: state.users.map((u) =>
        u.id === id
          ? { ...u, ...userData, updatedAt: new Date().toISOString() }
          : u
      ),
    }))
  },

  deleteUser: (id) => {
    set((state) => ({
      users: state.users.filter((u) => u.id !== id),
    }))
  },

  getUserById: (id) => {
    return get().users.find((u) => u.id === id)
  },
}))

