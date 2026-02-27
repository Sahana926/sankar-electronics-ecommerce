import express from 'express'
import User from '../models/User.js'
import Login from '../models/Login.js'
import jwt from 'jsonwebtoken'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Helper function to get client IP
const getClientIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] || 
         req.headers['x-real-ip'] || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress ||
         'unknown'
}

// Helper function to get user agent
const getUserAgent = (req) => {
  return req.headers['user-agent'] || 'unknown'
}

// Signup route
router.post('/signup', async (req, res) => {
  try {
    let { fullName, email, phone, password } = req.body

    // Validation
    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    // Normalize email to lowercase for consistent storage
    email = email.trim().toLowerCase()

    // Check if user already exists (case-insensitive search)
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' })
    }

    // Create new user
    const user = new User({
      fullName,
      email, // Already normalized to lowercase
      phone,
      password,
    })

    await user.save()

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
      },
    })
  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({ message: 'Server error. Please try again later.' })
  }
})

// Login route
router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body

    // Validation
    if (!email || !password) {
      // Log failed login attempt
      await Login.create({
        email: email || 'unknown',
        loginStatus: 'failed',
        failureReason: 'Missing email or password',
        ipAddress: getClientIP(req),
        userAgent: getUserAgent(req),
      })
      return res.status(400).json({ message: 'Email and password are required' })
    }

    // Normalize email to lowercase for consistent matching
    email = email.trim().toLowerCase()

    // Find user - case-insensitive search
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      // Log failed login attempt
      await Login.create({
        email,
        loginStatus: 'failed',
        failureReason: 'User not found',
        ipAddress: getClientIP(req),
        userAgent: getUserAgent(req),
      })
      return res.status(401).json({ message: 'Invalid email ID' })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      // Log failed login attempt
      await Login.create({
        user: user._id,
        email,
        loginStatus: 'failed',
        failureReason: 'Invalid password',
        ipAddress: getClientIP(req),
        userAgent: getUserAgent(req),
      })
      return res.status(401).json({ message: 'Invalid password' })
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Log successful login
    await Login.create({
      user: user._id,
      email,
      loginStatus: 'success',
      ipAddress: getClientIP(req),
      userAgent: getUserAgent(req),
    })

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Server error. Please try again later.' })
  }
})

// Get current user (protected route)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        createdAt: req.user.createdAt,
      },
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ message: 'Server error. Please try again later.' })
  }
})

// Verify token endpoint
router.post('/verify', authenticateToken, (req, res) => {
  res.json({
    valid: true,
    message: 'Token is valid',
    user: {
      id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
    },
  })
})

// Logout endpoint (client-side token removal, but included for completeness)
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Log logout activity (optional - you can track this if needed)
    // For now, logout is handled client-side by removing the token
    res.json({ message: 'Logout successful' })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ message: 'Server error. Please try again later.' })
  }
})

// Get login history for current user (protected route)
router.get('/login-history', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const logins = await Login.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .select('-__v')

    const total = await Login.countDocuments({ user: req.user._id })

    res.json({
      logins,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get login history error:', error)
    res.status(500).json({ message: 'Server error. Please try again later.' })
  }
})

// Get all login history (admin - protected route)
router.get('/all-login-history', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 50
    const skip = (page - 1) * limit
    const { email, status } = req.query

    const query = {}
    if (email) query.email = email.toLowerCase()
    if (status) query.loginStatus = status

    const logins = await Login.find(query)
      .populate('user', 'fullName email phone')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .select('-__v')

    const total = await Login.countDocuments(query)

    res.json({
      logins,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get all login history error:', error)
    res.status(500).json({ message: 'Server error. Please try again later.' })
  }
})

export default router

