import express from 'express';
const router = express.Router();
import { 
  calculateShipping, 
  validatePincode,
  validatePincodes,
  getPrimaryWarehouse 
} from '../utils/shippingService.js';
import { ShippingZone, Warehouse } from '../models/ShippingZone.js';

/**
 * @route   POST /api/shipping/calculate-shipping
 * @desc    Calculate shipping charges based on delivery pincode and cart weight
 * @access  Public
 */
router.post('/calculate-shipping', async (req, res) => {
  try {
    const { deliveryPincode, cartWeight } = req.body;

    // Validate required fields
    if (!deliveryPincode) {
      return res.status(400).json({
        success: false,
        error: 'Delivery pincode is required'
      });
    }

    // Validate pincode format
    if (!validatePincode(deliveryPincode)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid pincode format. Please enter a valid 6-digit Indian pincode.'
      });
    }

    // Set default weight if not provided
    const weight = cartWeight || 0;

    // Validate weight
    if (weight < 0) {
      return res.status(400).json({
        success: false,
        error: 'Cart weight cannot be negative'
      });
    }

    // Calculate shipping
    const result = await calculateShipping(deliveryPincode, weight);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Shipping calculated successfully',
      data: result.data
    });

  } catch (error) {
    console.error('Error calculating shipping:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while calculating shipping charges',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/shipping/validate-pincode
 * @desc    Validate a single pincode
 * @access  Public
 */
router.post('/validate-pincode', async (req, res) => {
  try {
    const { pincode } = req.body;

    if (!pincode) {
      return res.status(400).json({
        success: false,
        error: 'Pincode is required'
      });
    }

    const isValid = validatePincode(pincode);

    return res.status(200).json({
      success: true,
      data: {
        pincode,
        isValid,
        message: isValid 
          ? 'Valid pincode' 
          : 'Invalid pincode format. Must be a 6-digit number starting with 1-9.'
      }
    });

  } catch (error) {
    console.error('Error validating pincode:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while validating pincode'
    });
  }
});

/**
 * @route   POST /api/shipping/validate-pincodes
 * @desc    Validate multiple pincodes
 * @access  Public
 */
router.post('/validate-pincodes', async (req, res) => {
  try {
    const { pincodes } = req.body;

    if (!pincodes || !Array.isArray(pincodes)) {
      return res.status(400).json({
        success: false,
        error: 'Pincodes array is required'
      });
    }

    const results = validatePincodes(pincodes);

    return res.status(200).json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Error validating pincodes:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while validating pincodes'
    });
  }
});

/**
 * @route   GET /api/shipping/zones
 * @desc    Get all shipping zones
 * @access  Public
 */
router.get('/zones', async (req, res) => {
  try {
    const zones = await ShippingZone.find({ isActive: true }).sort({ minDistance: 1 });

    return res.status(200).json({
      success: true,
      count: zones.length,
      data: zones
    });

  } catch (error) {
    console.error('Error fetching shipping zones:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while fetching shipping zones'
    });
  }
});

/**
 * @route   GET /api/shipping/warehouse
 * @desc    Get warehouse information
 * @access  Public
 */
router.get('/warehouse', async (req, res) => {
  try {
    const warehouse = await getPrimaryWarehouse();

    return res.status(200).json({
      success: true,
      data: {
        name: warehouse.name,
        pincode: warehouse.pincode,
        city: warehouse.city,
        state: warehouse.state,
        address: warehouse.address
      }
    });

  } catch (error) {
    console.error('Error fetching warehouse:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while fetching warehouse information'
    });
  }
});

/**
 * @route   GET /api/shipping/check-serviceability/:pincode
 * @desc    Check if delivery is available for a pincode
 * @access  Public
 */
router.get('/check-serviceability/:pincode', async (req, res) => {
  try {
    const { pincode } = req.params;

    if (!validatePincode(pincode)) {
      return res.status(400).json({
        success: false,
        serviceable: false,
        error: 'Invalid pincode format'
      });
    }

    // For now, all valid pincodes are serviceable
    // In production, maintain a list of serviceable pincodes
    return res.status(200).json({
      success: true,
      serviceable: true,
      pincode,
      message: 'Delivery available for this pincode'
    });

  } catch (error) {
    console.error('Error checking serviceability:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while checking serviceability'
    });
  }
});

export default router;
