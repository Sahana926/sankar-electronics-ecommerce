import express from 'express';
import Profile from '../models/Profile.js';
import { authenticateToken } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Validation rules for profile
const profileValidation = [
  body('fullName').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
  body('phone').optional().trim().isMobilePhone().withMessage('Invalid phone number'),
  body('gender').optional().isIn(['Male', 'Female', 'Other', '']).withMessage('Invalid gender'),
  body('companyName').optional().trim(),
  body('address.city').optional().trim(),
  body('address.state').optional().trim(),
  body('address.pincode').optional().trim(),
  body('address.country').optional().trim(),
  body('address.street').optional().trim()
];

/**
 * @route   GET /api/profiles/me
 * @desc    Get current user's profile
 * @access  Private
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/profiles/search/query
 * @desc    Search profiles by email or fullName
 * @access  Private
 */
router.get('/search/:query', authenticateToken, async (req, res) => {
  try {
    const { query } = req.params;

    const profiles = await Profile.find({
      $or: [
        { fullName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { companyName: { $regex: query, $options: 'i' } }
      ]
    })
      .limit(10)
      .select('-__v');

    res.json({
      success: true,
      count: profiles.length,
      data: profiles
    });
  } catch (error) {
    console.error('Error searching profiles:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching profiles',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/profiles/me
 * @desc    Update current user's profile
 * @access  Private
 */
router.put('/me', authenticateToken, profileValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { fullName, phone, dateOfBirth, gender, companyName, address, bio, preferences, socialLinks, profilePicture, email } = req.body;

    const updates = {
      userId: req.user._id,
      email: email || req.user.email
    };
    
    if (fullName) updates.fullName = fullName.trim();
    if (phone) updates.phone = phone.trim();
    if (dateOfBirth !== undefined) updates.dateOfBirth = dateOfBirth;
    if (gender !== undefined) updates.gender = gender;
    if (companyName !== undefined) updates.companyName = companyName.trim();
    if (profilePicture) updates.profilePicture = profilePicture;
    if (bio) updates.bio = bio.trim();
    
    if (address) {
      updates.address = {
        street: address.street?.trim() || '',
        locality: address.locality?.trim() || '',
        city: address.city?.trim() || '',
        state: address.state?.trim() || '',
        pincode: address.pincode?.trim() || '',
        landmark: address.landmark?.trim() || '',
        alternatePhone: address.alternatePhone?.trim() || '',
        addressType: address.addressType || 'home',
        country: address.country?.trim() || 'India'
      };
    }

    if (preferences) {
      updates.preferences = {
        newsletter: preferences.newsletter !== undefined ? preferences.newsletter : true,
        notifications: preferences.notifications !== undefined ? preferences.notifications : true,
        marketing: preferences.marketing !== undefined ? preferences.marketing : false
      };
    }

    if (socialLinks) {
      updates.socialLinks = {
        linkedin: socialLinks.linkedin?.trim() || '',
        twitter: socialLinks.twitter?.trim() || '',
        facebook: socialLinks.facebook?.trim() || '',
        instagram: socialLinks.instagram?.trim() || ''
      };
    }

    updates.lastUpdated = Date.now();

    // Find and update, or create if doesn't exist
    let profile = await Profile.findOne({ userId: req.user._id });
    
    if (profile) {
      // Update existing profile
      profile = await Profile.findOneAndUpdate(
        { userId: req.user._id },
        { $set: updates },
        { new: true, runValidators: true }
      );
    } else {
      // Create new profile
      profile = new Profile(updates);
      await profile.save();
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: profile
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/profiles
 * @desc    Create a new profile
 * @access  Private
 */
router.post('/', authenticateToken, profileValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check if profile already exists
    const existingProfile = await Profile.findOne({ userId: req.user._id });
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: 'Profile already exists for this user'
      });
    }

    const { fullName, email, phone, dateOfBirth, gender, companyName, address, bio, preferences, socialLinks } = req.body;

    const profile = new Profile({
      userId: req.user._id,
      fullName: fullName || req.user.fullName,
      email: email || req.user.email,
      phone: phone || '',
      dateOfBirth: dateOfBirth || null,
      gender: gender || '',
      companyName: companyName || '',
      address: address || {
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
      },
      bio: bio || '',
      preferences: preferences || {
        newsletter: true,
        notifications: true,
        marketing: false
      },
      socialLinks: socialLinks || {
        linkedin: '',
        twitter: '',
        facebook: '',
        instagram: ''
      },
      isVerified: false
    });

    await profile.save();

    res.status(201).json({
      success: true,
      message: 'Profile created successfully',
      data: profile
    });
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating profile',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/profiles/:profileId
 * @desc    Update a profile
 * @access  Private
 */
router.put('/:profileId', authenticateToken, profileValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { fullName, phone, dateOfBirth, gender, companyName, address, bio, preferences, socialLinks, profilePicture } = req.body;

    const updates = {};
    if (fullName) updates.fullName = fullName.trim();
    if (phone) updates.phone = phone.trim();
    if (dateOfBirth !== undefined) updates.dateOfBirth = dateOfBirth;
    if (gender !== undefined) updates.gender = gender;
    if (companyName !== undefined) updates.companyName = companyName.trim();
    if (profilePicture) updates.profilePicture = profilePicture;
    if (bio) updates.bio = bio.trim();
    
    if (address) {
      updates.address = {
        street: address.street?.trim() || '',
        city: address.city?.trim() || '',
        state: address.state?.trim() || '',
        pincode: address.pincode?.trim() || '',
        country: address.country?.trim() || 'India'
      };
    }

    if (preferences) {
      updates.preferences = {
        newsletter: preferences.newsletter !== undefined ? preferences.newsletter : true,
        notifications: preferences.notifications !== undefined ? preferences.notifications : true,
        marketing: preferences.marketing !== undefined ? preferences.marketing : false
      };
    }

    if (socialLinks) {
      updates.socialLinks = {
        linkedin: socialLinks.linkedin?.trim() || '',
        twitter: socialLinks.twitter?.trim() || '',
        facebook: socialLinks.facebook?.trim() || '',
        instagram: socialLinks.instagram?.trim() || ''
      };
    }

    updates.lastUpdated = Date.now();

    const profile = await Profile.findByIdAndUpdate(
      req.params.profileId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: profile
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/profiles/:profileId
 * @desc    Delete a profile
 * @access  Private
 */
router.delete('/:profileId', authenticateToken, async (req, res) => {
  try {
    const profile = await Profile.findByIdAndDelete(req.params.profileId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile deleted successfully',
      data: profile
    });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting profile',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/profiles/:userId
 * @desc    Get user profile by userId
 * @access  Public
 */
router.get('/:userId', async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.userId })
      .populate('userId', '-password -__v');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
});

export default router;
