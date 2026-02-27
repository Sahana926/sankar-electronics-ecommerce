import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Middleware to verify JWT token
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    console.log('🔐 Auth Middleware - Path:', req.path);
    console.log('🔐 Auth Header:', authHeader ? 'Present' : 'Missing');
    
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
      console.warn('❌ No token provided');
      return res.status(401).json({ message: 'Access token required' })
    }

    const decoded = jwt.verify(token, JWT_SECRET)
    console.log('✅ Token decoded:', { userId: decoded.userId, email: decoded.email });
    
    // Handle both decoded.userId and decoded.user.id for backward compatibility
    const userId = decoded.userId || (decoded.user && decoded.user.id)
    
    if (!userId) {
      console.error('❌ No userId in token');
      return res.status(401).json({ message: 'Invalid token format' })
    }

    const user = await User.findById(userId).select('-password')

    if (!user) {
      console.error('❌ User not found:', userId);
      return res.status(401).json({ message: 'User not found' })
    }

    console.log('✅ User authenticated:', user._id);
    // Attach user to request object
    req.user = user
    req.token = token
    next()
  } catch (error) {
    console.error('🚨 Auth Error:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' })
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' })
    }
    return res.status(500).json({ message: 'Token verification failed' })
  }
}

// Middleware to enforce admin role
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' })
  }
  next()
}

