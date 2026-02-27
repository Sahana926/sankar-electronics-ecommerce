import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    match: [/^[0-9\-\+\(\)\s]{10,15}$/, 'Please use a valid phone number'],
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
    index: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false, // Don't include password by default in queries
  },
  // Address fields
  address: {
    street: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      trim: true,
      default: '',
    },
    state: {
      type: String,
      trim: true,
      default: '',
    },
    pincode: {
      type: String,
      trim: true,
      default: '',
    },
    country: {
      type: String,
      trim: true,
      default: 'India',
    },
  },
  profilePicture: {
    type: String,
    default: '',
  },
  dateOfBirth: {
    type: Date,
    default: null,
  },
  gender: {
    type: String,
    enum: ['', 'male', 'female', 'other', 'prefer-not-to-say'],
    default: '',
  },
  companyName: {
    type: String,
    trim: true,
    default: '',
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  }
})

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Virtual for full address
userSchema.virtual('fullAddress').get(function() {
  const { street, city, state, pincode, country } = this.address;
  const parts = [];
  if (street) parts.push(street);
  if (city) parts.push(city);
  if (state) parts.push(state);
  if (pincode) parts.push(pincode);
  if (country && country !== 'India') parts.push(country);
  return parts.join(', ');
});

// Update last login timestamp
userSchema.methods.updateLastLogin = async function() {
  this.lastLogin = Date.now();
  await this.save();
};

const User = mongoose.model('User', userSchema)

export default User
