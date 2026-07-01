import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../contexts/AuthContext'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { LogIn } from 'lucide-react'

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      setIsLoading(true)
      setError(null)
      await login(data.username, data.password)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--bg-primary)] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-500 rounded-xl mb-4">
            <span className="text-white font-bold text-2xl">IF</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Inventory Assets</h1>
          <p className="text-[var(--text-muted)] mt-1">TIF Indonesia - Asset Management</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Sign in to your account</h2>

            {error && (
              <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-md">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <Input
              label="Username"
              placeholder="Enter your username"
              error={errors.username?.message}
              {...register('username')}
            />
            <Input
              type="password"
              label="Password"
              placeholder="Enter your password"
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
              leftIcon={!isLoading && <LogIn className="w-4 h-4" />}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-[var(--border)] text-center">
            <p className="text-xs text-[var(--text-muted)]">Demo credentials: admin / admin123</p>
          </div>
        </Card>

        <p className="text-center text-xs text-[var(--text-muted)] mt-6">© 2024 TIF Indonesia. All rights reserved.</p>
      </div>
    </div>
  )
}
