import mongoose from 'mongoose'

const wishlistSchema = new mongoose.Schema({
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
    icon: {
      type: String,
      default: '📦',
    },
  }],
}, {
  timestamps: true,
})

const Wishlist = mongoose.model('Wishlist', wishlistSchema)

export default Wishlist

