import { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CountsProvider } from './context/CountsContext'
import Header from './components/Header'
import BackButton from './components/BackButton'
import AutoLogin from './components/AutoLogin'
import { userRoutes } from './routes/userRoutes'
import { adminRoutes } from './routes/adminRoutes'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'

function AppContent() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <>
      {/* User Layout (Header and BackButton only show on user routes) */}
      {!isAdminRoute && <Header />}
      {!isAdminRoute && <BackButton />}
      <AutoLogin />
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar theme="light" />
      <Suspense fallback={<div className="page-loading">Loading...</div>}>
        <Routes>
          {/* User Routes */}
          {userRoutes.map((route) => (
            <Route key={route.path} {...route} />
          ))}
          
          {/* Admin Routes */}
          {adminRoutes.map((route) => (
            <Route key={route.path} {...route} />
          ))}
        </Routes>
      </Suspense>
    </>
  )
}

function App() {
  return (
    <AuthProvider userType="user">
      <CountsProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="App">
            <AppContent />
          </div>
        </Router>
      </CountsProvider>
    </AuthProvider>
  )
}

export default App
