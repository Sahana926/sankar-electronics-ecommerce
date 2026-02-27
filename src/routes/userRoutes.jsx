import { lazy } from 'react'
import ProtectedRoute from '../components/ProtectedRoute'

const Home = lazy(() => import('../pages/Home'))
const Login = lazy(() => import('../pages/Login'))
const Signup = lazy(() => import('../pages/Signup'))
const Products = lazy(() => import('../pages/Products'))
const Contact = lazy(() => import('../pages/Contact'))
const Shop = lazy(() => import('../pages/Shop'))
const SwitchesAndSockets = lazy(() => import('../pages/SwitchesAndSockets'))
const WiresAndCables = lazy(() => import('../pages/WiresAndCables'))
const Lighting = lazy(() => import('../pages/Lighting'))
const Fans = lazy(() => import('../pages/Fans'))
const MCBDistribution = lazy(() => import('../pages/MCBDistribution'))
const ElectricalAccessories = lazy(() => import('../pages/ElectricalAccessories'))
const Fasteners = lazy(() => import('../pages/Fasteners'))
const HandTools = lazy(() => import('../pages/HandTools'))
const PowerTools = lazy(() => import('../pages/PowerTools'))
const ConstructionHardware = lazy(() => import('../pages/ConstructionHardware'))
const PlumbingHardware = lazy(() => import('../pages/PlumbingHardware'))
const ProductDetail = lazy(() => import('../pages/ProductDetail'))
const Checkout = lazy(() => import('../pages/Checkout'))
const PaymentSuccess = lazy(() => import('../pages/PaymentSuccess'))
const Cart = lazy(() => import('../pages/Cart'))
const Wishlist = lazy(() => import('../pages/Wishlist'))
const Orders = lazy(() => import('../pages/Orders'))
const Profile = lazy(() => import('../pages/Profile'))
const EditProfile = lazy(() => import('../pages/EditProfile'))

export const userRoutes = [
  // Public Routes
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/products',
    element: <Products />,
  },
  {
    path: '/contact',
    element: <Contact />,
  },

  // Protected Routes - Requires User Login
  {
    path: '/shop',
    element: (
      <ProtectedRoute>
        <Shop />
      </ProtectedRoute>
    ),
  },
  {
    path: '/switches-sockets',
    element: (
      <ProtectedRoute>
        <SwitchesAndSockets />
      </ProtectedRoute>
    ),
  },
  {
    path: '/wires-cables',
    element: (
      <ProtectedRoute>
        <WiresAndCables />
      </ProtectedRoute>
    ),
  },
  {
    path: '/lighting',
    element: (
      <ProtectedRoute>
        <Lighting />
      </ProtectedRoute>
    ),
  },
  {
    path: '/fans',
    element: (
      <ProtectedRoute>
        <Fans />
      </ProtectedRoute>
    ),
  },
  {
    path: '/mcb-distribution',
    element: (
      <ProtectedRoute>
        <MCBDistribution />
      </ProtectedRoute>
    ),
  },
  {
    path: '/electrical-accessories',
    element: (
      <ProtectedRoute>
        <ElectricalAccessories />
      </ProtectedRoute>
    ),
  },
  {
    path: '/fasteners',
    element: (
      <ProtectedRoute>
        <Fasteners />
      </ProtectedRoute>
    ),
  },
  {
    path: '/hand-tools',
    element: (
      <ProtectedRoute>
        <HandTools />
      </ProtectedRoute>
    ),
  },
  {
    path: '/power-tools',
    element: (
      <ProtectedRoute>
        <PowerTools />
      </ProtectedRoute>
    ),
  },
  {
    path: '/construction-hardware',
    element: (
      <ProtectedRoute>
        <ConstructionHardware />
      </ProtectedRoute>
    ),
  },
  {
    path: '/plumbing-hardware',
    element: (
      <ProtectedRoute>
        <PlumbingHardware />
      </ProtectedRoute>
    ),
  },
  {
    path: '/product/:id',
    element: (
      <ProtectedRoute>
        <ProductDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: '/checkout',
    element: (
      <ProtectedRoute>
        <Checkout />
      </ProtectedRoute>
    ),
  },
  {
    path: '/payment-success',
    element: (
      <ProtectedRoute>
        <PaymentSuccess />
      </ProtectedRoute>
    ),
  },
  {
    path: '/cart',
    element: (
      <ProtectedRoute>
        <Cart />
      </ProtectedRoute>
    ),
  },
  {
    path: '/wishlist',
    element: (
      <ProtectedRoute>
        <Wishlist />
      </ProtectedRoute>
    ),
  },
  {
    path: '/orders',
    element: (
      <ProtectedRoute>
        <Orders />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile/edit',
    element: (
      <ProtectedRoute>
        <EditProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: '/edit-profile',
    element: (
      <ProtectedRoute>
        <EditProfile />
      </ProtectedRoute>
    ),
  },
]
