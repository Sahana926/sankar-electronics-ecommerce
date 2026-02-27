import mongoose from 'mongoose'

const cartSchema = new mongoose.Schema({
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
  items: [{
    productId: {
      type: String,
      required: true,
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
    imageUrl: {
      type: String,
      default: '',
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    icon: {
      type: String,
      default: '📦',
    },
  }],
}, {
  timestamps: true,
})

const Cart = mongoose.model('Cart', cartSchema)

export default Cart

