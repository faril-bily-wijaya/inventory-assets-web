import { useState, useEffect } from 'react'
import { PageContainer } from '../components/layout/PageContainer'
import { SidebarNav } from '../components/layout/SidebarNav'
import { api } from '../contexts/AuthContext'
import { Trash2, UserCheck, UserX, Shield, ShieldAlert, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '../utils/cn'

interface User {
  id: string
  username: string
  email: string
  full_name: string | null
  role: 'ADMIN' | 'STAFF'
  is_active: boolean
  created_at: string
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const res = await api.get('/users')
      setUsers(res.data.users)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to fetch users')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleRoleChange = async (userId: string, currentRole: string) => {
    try {
      setProcessingId(userId)
      const newRole = currentRole === 'ADMIN' ? 'STAFF' : 'ADMIN'
      await api.put(`/users/${userId}/role`, { role: newRole })
      toast.success('Role updated successfully')
      fetchUsers()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update role')
    } finally {
      setProcessingId(null)
    }
  }

  const handleStatusChange = async (userId: string, currentStatus: boolean) => {
    try {
      setProcessingId(userId)
      await api.put(`/users/${userId}/active`, { is_active: !currentStatus })
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
      fetchUsers()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update status')
    } finally {
      setProcessingId(null)
    }
  }

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Are you sure you want to deactivate/delete this user?')) return
    
    try {
      setProcessingId(userId)
      await api.delete(`/users/${userId}`)
      toast.success('User deleted successfully')
      fetchUsers()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete user')
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <PageContainer sidebar={<SidebarNav />}>
      <div className="flex-1 overflow-auto p-6 bg-[var(--bg-primary)]">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">User Management</h1>
            <p className="text-[var(--text-muted)]">Manage system users, roles, and access.</p>
          </div>
        </div>

        <div className="glass-panel rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-[var(--bg-elevated)] border-b border-[var(--border)]">
                <tr>
                  <th className="py-4 px-6 font-semibold text-[var(--text-secondary)] uppercase text-xs">User</th>
                  <th className="py-4 px-6 font-semibold text-[var(--text-secondary)] uppercase text-xs">Role</th>
                  <th className="py-4 px-6 font-semibold text-[var(--text-secondary)] uppercase text-xs text-center">Status</th>
                  <th className="py-4 px-6 font-semibold text-[var(--text-secondary)] uppercase text-xs">Joined</th>
                  <th className="py-4 px-6 font-semibold text-[var(--text-secondary)] uppercase text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[var(--text-muted)]">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[var(--text-muted)]">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-[var(--bg-elevated)] transition-colors group">
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold uppercase">
                            {user.username.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-[var(--text-primary)]">{user.username}</div>
                            <div className="text-xs text-[var(--text-muted)]">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-6">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wide",
                          user.role === 'ADMIN' 
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50" 
                            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        )}>
                          {user.role === 'ADMIN' ? <ShieldAlert className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-center">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          user.is_active 
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        )}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-[var(--text-secondary)] text-xs">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleRoleChange(user.id, user.role)}
                            disabled={processingId === user.id}
                            title={user.role === 'ADMIN' ? 'Demote to Staff' : 'Promote to Admin'}
                            className="p-1.5 rounded-md hover:bg-[var(--border)] text-[var(--text-secondary)] hover:text-purple-500 transition-colors"
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(user.id, user.is_active)}
                            disabled={processingId === user.id}
                            title={user.is_active ? 'Deactivate' : 'Activate'}
                            className="p-1.5 rounded-md hover:bg-[var(--border)] text-[var(--text-secondary)] hover:text-amber-500 transition-colors"
                          >
                            {user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            disabled={processingId === user.id}
                            title="Delete User"
                            className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-[var(--text-secondary)] hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
