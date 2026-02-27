import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    profilePicture: {
      type: String,
      default: null
    },
    dateOfBirth: {
      type: Date,
      default: null
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', ''],
      default: ''
    },
    companyName: {
      type: String,
      trim: true,
      default: ''
    },
    address: {
      street: {
        type: String,
        trim: true,
        default: ''
      },
      locality: {
        type: String,
        trim: true,
        default: ''
      },
      city: {
        type: String,
        trim: true,
        default: ''
      },
      state: {
        type: String,
        trim: true,
        default: ''
      },
      pincode: {
        type: String,
        trim: true,
        default: ''
      },
      landmark: {
        type: String,
        trim: true,
        default: ''
      },
      alternatePhone: {
        type: String,
        trim: true,
        default: ''
      },
      addressType: {
        type: String,
        enum: ['home', 'work', ''],
        default: 'home'
      },
      country: {
        type: String,
        trim: true,
        default: 'India'
      }
    },
    bio: {
      type: String,
      default: ''
    },
    preferences: {
      newsletter: {
        type: Boolean,
        default: true
      },
      notifications: {
        type: Boolean,
        default: true
      },
      marketing: {
        type: Boolean,
        default: false
      }
    },
    socialLinks: {
      linkedin: {
        type: String,
        default: ''
      },
      twitter: {
        type: String,
        default: ''
      },
      facebook: {
        type: String,
        default: ''
      },
      instagram: {
        type: String,
        default: ''
      }
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationToken: {
      type: String,
      default: null
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
profileSchema.index({ email: 1 });

const Profile = mongoose.model('Profile', profileSchema);

export default Profile;
