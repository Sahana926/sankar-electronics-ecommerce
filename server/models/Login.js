import mongoose from 'mongoose'

const loginSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  loginStatus: {
    type: String,
    enum: ['success', 'failed'],
    required: true,
  },
  ipAddress: {
    type: String,
    default: null,
  },
  userAgent: {
    type: String,
    default: null,
  },
  failureReason: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
})

// Index for faster queries
loginSchema.index({ user: 1, createdAt: -1 })
loginSchema.index({ email: 1, createdAt: -1 })

const Login = mongoose.model('Login', loginSchema)

export default Login

