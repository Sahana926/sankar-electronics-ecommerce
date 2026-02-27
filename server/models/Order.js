import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true, // Index for faster queries
  },
  userEmail: {
    type: String,
    required: true,
    index: true,
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  items: [{
    productId: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    icon: {
      type: String,
      default: '📦',
    },
  }],
  total: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'processing',
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    phone: String,
  },
  paymentMethod: {
    type: String,
    enum: ['upi', 'card', 'cod', 'wallet'],
    default: 'cod',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'success', 'failed', 'paid', 'refunded'],
    default: 'pending',
  },
  transactionId: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
})

// Generate order number before saving
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    this.orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase()
  }
  next()
})

const Order = mongoose.model('Order', orderSchema)

export default Order

