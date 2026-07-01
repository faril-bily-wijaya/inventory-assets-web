import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { MapProvider } from './contexts/MapContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import DevicesPage from './pages/DevicesPage'
import ProtectedRoute from './components/layout/ProtectedRoute'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MapProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Routes>
                      <Route path="/" element={<DashboardPage />} />
                      <Route path="/devices" element={<DevicesPage />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
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
          </BrowserRouter>
        </MapProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
