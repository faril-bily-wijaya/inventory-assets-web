import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PageContainer } from '../components/layout/PageContainer'
import { SidebarNav } from '../components/layout/SidebarNav'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { useAuth, api } from '../contexts/AuthContext'
import { User, Shield, Check, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  full_name: z.string().optional().nullable(),
})

const passwordSchema = z.object({
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>

export default function SettingsPage() {
  const { user, updateProfile } = useAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile')
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)


  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { register: registerProfile, handleSubmit: handleSubmitProfile, formState: { errors: profileErrors }, reset: resetProfile } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
      full_name: user?.fullName || '',
    }
  })

  useEffect(() => {
    if (user) {
      resetProfile({
        username: user.username,
        email: user.email,
        full_name: user.fullName || '',
      })
    }
  }, [user, resetProfile])

  const { register: registerPassword, handleSubmit: handleSubmitPassword, formState: { errors: passwordErrors }, reset: resetPassword } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  })

  const onProfileSubmit = async (data: ProfileForm) => {
    try {
      setIsProfileLoading(true)
      await updateProfile(data)
      toast.success('Profile updated successfully')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update profile')
    } finally {
      setIsProfileLoading(false)
    }
  }

  const onPasswordSubmit = async (data: PasswordForm) => {
    try {
      setIsPasswordLoading(true)
      await api.put('/auth/me/password', {
        newPassword: data.newPassword,
      })
      toast.success('Password updated successfully')
      resetPassword()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update password')
    } finally {
      setIsPasswordLoading(false)
    }
  }

  return (
    <PageContainer sidebar={<SidebarNav />}>
      <div className="flex-1 overflow-auto p-6 bg-[var(--bg-primary)]">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Settings</h1>
            <p className="text-[var(--text-muted)] mt-1">Manage your account preferences and security.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Tabs Sidebar */}
            <div className="w-full md:w-64 flex-shrink-0">
              <nav className="flex flex-col space-y-1">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                    activeTab === 'profile'
                      ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
                  }`}
                >
                  <User className="w-5 h-5" />
                  Profile Information
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                    activeTab === 'security'
                      ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  Security
                </button>
              </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1">
              {activeTab === 'profile' && (
                <Card padding="lg" className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Profile Information</h2>
                  
                  <div className="mb-8 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-2xl font-bold uppercase">
                      {user?.username?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--text-primary)]">{user?.username}</h3>
                      <p className="text-sm text-[var(--text-muted)]">{user?.role}</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-5">
                    <Input
                      label="Username"
                      placeholder="Username"
                      error={profileErrors.username?.message}
                      {...registerProfile('username')}
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="Email"
                      error={profileErrors.email?.message}
                      {...registerProfile('email')}
                    />
                    <Input
                      label="Full Name (Optional)"
                      placeholder="Full Name"
                      error={profileErrors.full_name?.message}
                      {...registerProfile('full_name')}
                    />
                    
                    <div className="pt-4 border-t border-[var(--border)] flex justify-end">
                      <Button type="submit" variant="primary" isLoading={isProfileLoading} leftIcon={!isProfileLoading && <Check className="w-4 h-4" />}>
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </Card>
              )}

              {activeTab === 'security' && (
                <Card padding="lg" className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Change Password</h2>
                  
                  <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-5">
                    <Input
                      type={showNewPassword ? 'text' : 'password'}
                      label="New Password"
                      placeholder="Enter new password"
                      error={passwordErrors.newPassword?.message}
                      rightIcon={
                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="focus:outline-none hover:text-[var(--text-primary)]">
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                      {...registerPassword('newPassword')}
                    />
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      label="Confirm New Password"
                      placeholder="Confirm new password"
                      error={passwordErrors.confirmPassword?.message}
                      rightIcon={
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="focus:outline-none hover:text-[var(--text-primary)]">
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                      {...registerPassword('confirmPassword')}
                    />
                    
                    <div className="pt-4 border-t border-[var(--border)] flex justify-end">
                      <Button type="submit" variant="primary" isLoading={isPasswordLoading} leftIcon={!isPasswordLoading && <Check className="w-4 h-4" />}>
                        Update Password
                      </Button>
                    </div>
                  </form>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
