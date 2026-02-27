import { lazy } from 'react'
import AdminProtectedRoute from '../components/AdminProtectedRoute'

const AdminLogin = lazy(() => import('../pages/AdminLogin'))
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'))
const AdminProducts = lazy(() => import('../pages/AdminProducts'))
const AdminProductEdit = lazy(() => import('../pages/AdminProductEdit'))
const AdminOrders = lazy(() => import('../pages/AdminOrders'))
const ContactMessages = lazy(() => import('../pages/ContactMessages'))
const ProductsReport = lazy(() => import('../pages/reports/ProductsReport'))
const OrdersReport = lazy(() => import('../pages/reports/OrdersReport'))
const UsersReport = lazy(() => import('../pages/reports/UsersReport'))
const RevenueReport = lazy(() => import('../pages/reports/RevenueReport'))
const LowStockReport = lazy(() => import('../pages/reports/LowStockReport'))
const OutOfStockReport = lazy(() => import('../pages/reports/OutOfStockReport'))
const Unauthorized = lazy(() => import('../pages/Unauthorized'))

export const adminRoutes = [
  {
    path: '/admin/login',
    element: <AdminLogin />,
  },
  {
    path: '/admin',
    element: (
      <AdminProtectedRoute>
        <AdminDashboard />
      </AdminProtectedRoute>
    ),
  },
  {
    path: '/admin/inventory',
    element: (
      <AdminProtectedRoute>
        <AdminProducts />
      </AdminProtectedRoute>
    ),
  },
  {
    path: '/admin/products',
    element: (
      <AdminProtectedRoute>
        <AdminProducts />
      </AdminProtectedRoute>
    ),
  },
  {
    path: '/admin/products/:id',
    element: (
      <AdminProtectedRoute>
        <AdminProductEdit />
      </AdminProtectedRoute>
    ),
  },
  {
    path: '/admin/orders',
    element: (
      <AdminProtectedRoute>
        <AdminOrders />
      </AdminProtectedRoute>
    ),
  },
  {
    path: '/admin/messages',
    element: (
      <AdminProtectedRoute>
        <ContactMessages />
      </AdminProtectedRoute>
    ),
  },
  {
    path: '/admin/reports/products',
    element: (
      <AdminProtectedRoute>
        <ProductsReport />
      </AdminProtectedRoute>
    ),
  },
  {
    path: '/admin/reports/orders',
    element: (
      <AdminProtectedRoute>
        <OrdersReport />
      </AdminProtectedRoute>
    ),
  },
  {
    path: '/admin/reports/users',
    element: (
      <AdminProtectedRoute>
        <UsersReport />
      </AdminProtectedRoute>
    ),
  },
  {
    path: '/admin/reports/revenue',
    element: (
      <AdminProtectedRoute>
        <RevenueReport />
      </AdminProtectedRoute>
    ),
  },
  {
    path: '/admin/reports/low-stock',
    element: (
      <AdminProtectedRoute>
        <LowStockReport />
      </AdminProtectedRoute>
    ),
  },
  {
    path: '/admin/reports/out-of-stock',
    element: (
      <AdminProtectedRoute>
        <OutOfStockReport />
      </AdminProtectedRoute>
    ),
  },
  {
    path: '/unauthorized',
    element: <Unauthorized />,
  },
]
