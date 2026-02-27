import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import { authenticateToken } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Utility to upsert a Profile document from a User document (for Atlas visibility)
const syncProfileFromUser = async (userDoc) => {
  if (!userDoc?._id) return;

  const address = userDoc.address || {};
  const normalizedGender = (userDoc.gender || '').toLowerCase();
  const genderForProfile =
    normalizedGender === 'male' ? 'Male' :
    normalizedGender === 'female' ? 'Female' :
    normalizedGender === 'other' ? 'Other' : '';

  const profilePayload = {
    userId: userDoc._id,
    fullName: userDoc.fullName || '',
    email: userDoc.email || '',
    phone: userDoc.phone || '',
    dateOfBirth: userDoc.dateOfBirth || null,
    gender: genderForProfile,
    companyName: userDoc.companyName || '',
    profilePicture: userDoc.profilePicture || null,
    address: {
      street: address.street || '',
      locality: address.locality || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode || '',
      landmark: address.landmark || '',
      alternatePhone: address.alternatePhone || '',
      addressType: address.addressType || 'home',
      country: address.country || 'India'
    },
    lastUpdated: new Date()
  };

  await Profile.findOneAndUpdate(
    { userId: userDoc._id },
    { $set: profilePayload },
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
  );
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const uploadDir = 'uploads/profile-pictures/';
    try {
      await fs.ensureDir(uploadDir);
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'profile-' + uniqueSuffix + ext);
  }
});

// File filter for image uploads
const imageFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1
  },
  fileFilter: imageFilter
});

/**
 * @route   GET /api/users/me
 * @desc    Get current user's profile
 * @access  Private
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -__v -isActive')
      .lean();
      
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Format date of birth for display
    if (user.dateOfBirth) {
      user.dateOfBirth = new Date(user.dateOfBirth).toISOString().split('T')[0];
    }

    // Ensure Profile collection has a document for this user
    try {
      await syncProfileFromUser(user);
    } catch (syncErr) {
      console.error('Profile sync (GET /me) failed:', syncErr.message || syncErr);
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   PUT /api/users/update-profile
 * @desc    Update user profile
 * @access  Private
 */
const updateProfileValidation = [
  body('fullName')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Full name must be between 2 and 50 characters'),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .custom((value) => {
      if (!value) return true;
      const phoneRegex = /^[0-9\-\+\(\)\s]*$/;
      if (!phoneRegex.test(value)) {
        throw new Error('Please enter a valid phone number');
      }
      return true;
    }),
  body('address').optional({ checkFalsy: true }).trim(),
  body('city').optional({ checkFalsy: true }).trim(),
  body('state').optional({ checkFalsy: true }).trim(),
  body('pincode')
    .optional({ checkFalsy: true })
    .trim()
    .custom((value) => {
      if (!value) return true;
      const pincodeRegex = /^[0-9\-\s]*$/;
      if (!pincodeRegex.test(value)) {
        throw new Error('Please enter a valid pincode');
      }
      return true;
    }),
  body('country').optional({ checkFalsy: true }).trim(),
  body('dateOfBirth')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      // Allow empty/null values
      if (!value || value === '') return true;

      // Accept ISO (yyyy-mm-dd) or common dd-mm-yyyy entered manually
      const isoMatch = /^\d{4}-\d{2}-\d{2}$/.test(value);
      const dmyMatch = /^\d{2}-\d{2}-\d{4}$/.test(value);
      if (!isoMatch && !dmyMatch) {
        throw new Error('Please enter a valid date of birth');
      }

      // Normalize to Date for range checks
      const normalized = isoMatch
        ? value
        : value.split('-').reverse().join('-'); // dd-mm-yyyy -> yyyy-mm-dd

      const dob = new Date(normalized);
      if (Number.isNaN(dob.getTime())) {
        throw new Error('Please enter a valid date of birth');
      }

      const today = new Date();
      const minAgeDate = new Date(
        today.getFullYear() - 120,
        today.getMonth(),
        today.getDate()
      );

      if (dob < minAgeDate) {
        throw new Error('Please enter a valid date of birth');
      }
      return true;
    }),
  body('gender')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      // Allow empty values
      if (!value || value === '') return true;
      
      const validGenders = ['male', 'female', 'other', 'prefer-not-to-say'];
      if (!validGenders.includes(value.toLowerCase())) {
        throw new Error('Invalid gender value');
      }
      return true;
    }),
  body('companyName').optional({ checkFalsy: true }).trim().isLength({ max: 100 }).withMessage('Company name must be less than 100 characters')
];

router.put(
  '/update-profile',
  [
    authenticateToken,
    upload.single('profilePicture'),
    ...updateProfileValidation
  ],
  async (req, res) => {
    try {
      console.log('=== UPDATE PROFILE REQUEST ===');
      console.log('User ID:', req.user._id);
      console.log('Request body:', req.body);
      console.log('Request body keys:', Object.keys(req.body));
      
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('❌ Validation errors found:');
        errors.array().forEach(err => {
          console.log(`  - ${err.param}: ${err.msg} (received: "${err.value}")`);
        });
        // Clean up uploaded file if validation fails
        if (req.file) {
          await fs.unlink(req.file.path).catch(console.error);
        }
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const {
        fullName,
        phone,
        address,
        city,
        state,
        pincode,
        country,
        dateOfBirth,
        gender,
        companyName
      } = req.body;

      const updates = {};
      
      // Basic fields
      if (fullName) updates.fullName = fullName.trim();
      if (phone) updates.phone = phone.trim();
      if (dateOfBirth !== undefined) {
        // Normalize dd-mm-yyyy to yyyy-mm-dd for storage
        let normalizedDob = dateOfBirth;
        if (typeof dateOfBirth === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(dateOfBirth)) {
          const [dd, mm, yyyy] = dateOfBirth.split('-');
          normalizedDob = `${yyyy}-${mm}-${dd}`;
        }
        updates.dateOfBirth = normalizedDob || null;
      }
      if (gender !== undefined) updates.gender = gender || '';
      if (companyName !== undefined) updates.companyName = companyName.trim();

      // Handle address - both nested and individual fields
      updates.address = {
        street: (typeof address === 'string' ? address : address?.street || '')?.trim() || '',
        city: (city || (typeof address === 'object' ? address?.city : ''))?.trim() || '',
        state: (state || (typeof address === 'object' ? address?.state : ''))?.trim() || '',
        pincode: (pincode || (typeof address === 'object' ? address?.pincode : ''))?.trim() || '',
        country: (country || (typeof address === 'object' ? address?.country : ''))?.trim() || ''
      };

      console.log('Updates to apply:', updates);

      // Handle profile picture upload
      if (req.file) {
        // If there was a previous profile picture, delete it
        if (req.user.profilePicture) {
          const oldImagePath = path.join(process.cwd(), req.user.profilePicture);
          if (await fs.pathExists(oldImagePath)) {
            await fs.unlink(oldImagePath).catch(console.error);
          }
        }
        updates.profilePicture = '/uploads/profile-pictures/' + path.basename(req.file.path);
      }

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updates },
        { 
          new: true, 
          runValidators: true,
          context: 'query'
        }
      )
      .select('-password -__v -isActive')
      .lean();

      if (!user) {
        console.error('User not found after update');
        if (req.file) {
          await fs.unlink(req.file.path).catch(console.error);
        }
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Format date of birth for response
      if (user.dateOfBirth) {
        user.dateOfBirth = new Date(user.dateOfBirth).toISOString().split('T')[0];
      }

      // Keep the Profile collection in sync for Atlas viewers
      try {
        await syncProfileFromUser(user);
      } catch (profileSyncError) {
        console.error('Profile sync failed:', profileSyncError.message || profileSyncError);
      }

      console.log('Profile updated successfully');
      console.log('Updated user:', user);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: user
      });

    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Clean up uploaded file if there was an error
      if (req.file) {
        await fs.unlink(req.file.path).catch(console.error);
      }

      // Handle specific error types
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          error: error.message
        });
      }

      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Email or phone number already in use'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error updating profile',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @route   DELETE /api/users/delete-account
 * @desc    Delete user account
 * @access  Private
 */
router.delete('/delete-account', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete profile picture if exists
    if (user.profilePicture) {
      const imagePath = path.join(process.cwd(), user.profilePicture);
      if (await fs.pathExists(imagePath)) {
        await fs.unlink(imagePath).catch(console.error);
      }
    }

    // Soft delete (mark as inactive)
    user.isActive = false;
    await user.save();

    // TODO: Invalidate JWT token

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting account',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
