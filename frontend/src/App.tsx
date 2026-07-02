import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { MapProvider } from './contexts/MapContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import DevicesPage from './pages/DevicesPage'
import ProtectedRoute from './components/layout/ProtectedRoute'

function ProtectedLayout() {
  return (
    <MapProvider>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/devices" element={<DevicesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MapProvider>
  )
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <ProtectedLayout />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
