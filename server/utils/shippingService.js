import axios from 'axios';
import { ShippingZone, Warehouse } from '../models/ShippingZone.js';

/**
 * Validate Indian pincode format
 */
const validatePincode = (pincode) => {
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  return pincodeRegex.test(pincode);
};

/**
 * Get coordinates for a pincode using India Post API or fallback
 * In production, use a reliable geocoding API like Google Maps, Mapbox, or Positionstack
 */
const getPincodeCoordinates = async (pincode) => {
  try {
    // Using Positionstack API (free tier available)
    // Replace with your API key in production
    // For now, we'll use a simplified approach with a local database
    
    // Fallback: Use approximate coordinates based on first 3 digits
    // In production, maintain a pincode database or use a paid API
    const pincodeData = await getPincodeFromDatabase(pincode);
    
    if (pincodeData) {
      return {
        latitude: pincodeData.latitude,
        longitude: pincodeData.longitude,
        city: pincodeData.city,
        state: pincodeData.state
      };
    }
    
    throw new Error('Pincode not found in database');
  } catch (error) {
    throw new Error(`Unable to fetch coordinates for pincode ${pincode}`);
  }
};

/**
 * Simplified pincode database lookup
 * In production, use a complete pincode database or external API
 */
const getPincodeFromDatabase = async (pincode) => {
  // Sample pincode data (expand this with a complete database)
  const pincodeDatabase = {
    // Major cities examples
    '110001': { latitude: 28.6139, longitude: 77.2090, city: 'New Delhi', state: 'Delhi' },
    '110002': { latitude: 28.6469, longitude: 77.2167, city: 'New Delhi', state: 'Delhi' },
    '400001': { latitude: 19.0760, longitude: 72.8777, city: 'Mumbai', state: 'Maharashtra' },
    '400002': { latitude: 18.9388, longitude: 72.8354, city: 'Mumbai', state: 'Maharashtra' },
    '560001': { latitude: 12.9716, longitude: 77.5946, city: 'Bangalore', state: 'Karnataka' },
    '560002': { latitude: 12.9634, longitude: 77.5855, city: 'Bangalore', state: 'Karnataka' },
    '700001': { latitude: 22.5726, longitude: 88.3639, city: 'Kolkata', state: 'West Bengal' },
    '600001': { latitude: 13.0827, longitude: 80.2707, city: 'Chennai', state: 'Tamil Nadu' },
    '500001': { latitude: 17.3850, longitude: 78.4867, city: 'Hyderabad', state: 'Telangana' },
    '411001': { latitude: 18.5204, longitude: 73.8567, city: 'Pune', state: 'Maharashtra' },
    '380001': { latitude: 23.0225, longitude: 72.5714, city: 'Ahmedabad', state: 'Gujarat' },
    '302001': { latitude: 26.9124, longitude: 75.7873, city: 'Jaipur', state: 'Rajasthan' },
    '226001': { latitude: 26.8467, longitude: 80.9462, city: 'Lucknow', state: 'Uttar Pradesh' },
    '160001': { latitude: 30.7333, longitude: 76.7794, city: 'Chandigarh', state: 'Chandigarh' },
    '201301': { latitude: 28.5355, longitude: 77.3910, city: 'Noida', state: 'Uttar Pradesh' },
    // Coimbatore region pincodes
    '641001': { latitude: 11.0168, longitude: 76.9558, city: 'Coimbatore', state: 'Tamil Nadu' },
    '641002': { latitude: 11.0074, longitude: 76.9619, city: 'Coimbatore', state: 'Tamil Nadu' },
    '641003': { latitude: 11.0271, longitude: 76.9544, city: 'Coimbatore', state: 'Tamil Nadu' },
    '641004': { latitude: 11.0271, longitude: 76.9544, city: 'Coimbatore', state: 'Tamil Nadu' },
    '641005': { latitude: 11.0095, longitude: 77.0026, city: 'Coimbatore', state: 'Tamil Nadu' },
    '641006': { latitude: 11.0321, longitude: 77.0091, city: 'Coimbatore', state: 'Tamil Nadu' },
    '641012': { latitude: 11.0293, longitude: 76.9958, city: 'Coimbatore', state: 'Tamil Nadu' },
    '641018': { latitude: 11.0453, longitude: 76.9787, city: 'Coimbatore', state: 'Tamil Nadu' },
    '641035': { latitude: 11.0788, longitude: 77.0339, city: 'Coimbatore', state: 'Tamil Nadu' },
    // Tiruppur region pincodes
    '641600': { latitude: 11.1087, longitude: 77.3411, city: 'Tiruppur', state: 'Tamil Nadu' },
    '641601': { latitude: 11.1087, longitude: 77.3411, city: 'Tiruppur', state: 'Tamil Nadu' },
    '641602': { latitude: 11.1087, longitude: 77.3411, city: 'Tiruppur', state: 'Tamil Nadu' },
    '641603': { latitude: 11.1087, longitude: 77.3411, city: 'Tiruppur', state: 'Tamil Nadu' },
    '641604': { latitude: 11.1087, longitude: 77.3411, city: 'Tiruppur', state: 'Tamil Nadu' },
    '641605': { latitude: 11.1087, longitude: 77.3411, city: 'Tiruppur', state: 'Tamil Nadu' },
    '641606': { latitude: 11.1087, longitude: 77.3411, city: 'Tiruppur', state: 'Tamil Nadu' },
    '641607': { latitude: 11.1087, longitude: 77.3411, city: 'Tiruppur', state: 'Tamil Nadu' },
    '641608': { latitude: 11.1087, longitude: 77.3411, city: 'Tiruppur', state: 'Tamil Nadu' },
    '641609': { latitude: 11.1087, longitude: 77.3411, city: 'Tiruppur', state: 'Tamil Nadu' },
    // Erode region pincodes
    '638001': { latitude: 11.3410, longitude: 77.7172, city: 'Erode', state: 'Tamil Nadu' },
    '638002': { latitude: 11.3448, longitude: 77.7297, city: 'Erode', state: 'Tamil Nadu' },
    '638003': { latitude: 11.3376, longitude: 77.7085, city: 'Erode', state: 'Tamil Nadu' },
    '638004': { latitude: 11.3543, longitude: 77.7205, city: 'Erode', state: 'Tamil Nadu' },
    '638011': { latitude: 11.3296, longitude: 77.7435, city: 'Erode', state: 'Tamil Nadu' },
    '638012': { latitude: 11.3503, longitude: 77.7389, city: 'Erode', state: 'Tamil Nadu' },
    '638052': { latitude: 11.2897, longitude: 77.7580, city: 'Erode', state: 'Tamil Nadu' },
    '638502': { latitude: 11.3410, longitude: 77.7172, city: 'Erode', state: 'Tamil Nadu' },
  };

  // If exact pincode not found, estimate based on first 3 digits (postal region)
  if (pincodeDatabase[pincode]) {
    return pincodeDatabase[pincode];
  }

  // Approximate based on region (first digit indicates region in India)
  // This is a fallback - in production use a complete database
  const region = pincode.substring(0, 1);
  const regionCenters = {
    '1': { latitude: 28.6139, longitude: 77.2090, city: 'Delhi Region', state: 'North India' },
    '2': { latitude: 22.5726, longitude: 88.3639, city: 'Kolkata Region', state: 'East India' },
    '3': { latitude: 17.3850, longitude: 78.4867, city: 'Hyderabad Region', state: 'South India' },
    '4': { latitude: 19.0760, longitude: 72.8777, city: 'Mumbai Region', state: 'West India' },
    '5': { latitude: 12.9716, longitude: 77.5946, city: 'Bangalore Region', state: 'South India' },
    '6': { latitude: 13.0827, longitude: 80.2707, city: 'Chennai Region', state: 'South India' },
    '7': { latitude: 22.3072, longitude: 73.1812, city: 'Gujarat Region', state: 'West India' },
    '8': { latitude: 26.9124, longitude: 75.7873, city: 'Rajasthan Region', state: 'North India' },
    '9': { latitude: 26.8467, longitude: 80.9462, city: 'UP Region', state: 'North India' },
  };

  return regionCenters[region] || null;
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

/**
 * Convert degrees to radians
 */
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Get shipping zone based on distance
 */
const getShippingZone = async (distance) => {
  try {
    const zones = await ShippingZone.find({ isActive: true }).sort({ minDistance: 1 });
    
    for (const zone of zones) {
      if (distance >= zone.minDistance && distance <= zone.maxDistance) {
        return zone;
      }
    }
    
    // If distance exceeds all zones, return National zone
    return zones.find(z => z.zoneName === 'National');
  } catch (error) {
    throw new Error('Error fetching shipping zones');
  }
};

/**
 * Get primary warehouse
 */
const getPrimaryWarehouse = async () => {
  try {
    let warehouse = await Warehouse.findOne({ isPrimary: true, isActive: true });
    
    // If no primary warehouse, get any active warehouse
    if (!warehouse) {
      warehouse = await Warehouse.findOne({ isActive: true });
    }
    
    if (!warehouse) {
      throw new Error('No active warehouse found');
    }
    
    return warehouse;
  } catch (error) {
    throw new Error('Error fetching warehouse data');
  }
};

/**
 * Calculate shipping charges
 */
const calculateShipping = async (deliveryPincode, cartWeight = 0) => {
  try {
    // Validate delivery pincode
    if (!validatePincode(deliveryPincode)) {
      throw new Error('Invalid pincode format. Please enter a valid 6-digit Indian pincode.');
    }

    // Get warehouse details
    const warehouse = await getPrimaryWarehouse();

    // Get coordinates for both pincodes
    const warehouseCoords = warehouse.coordinates;
    const deliveryCoords = await getPincodeCoordinates(deliveryPincode);

    // Calculate distance
    const distance = calculateDistance(
      warehouseCoords.latitude,
      warehouseCoords.longitude,
      deliveryCoords.latitude,
      deliveryCoords.longitude
    );

    // Get shipping zone based on distance
    const zone = await getShippingZone(distance);

    if (!zone) {
      throw new Error('Unable to determine shipping zone');
    }

    // Calculate additional charges based on weight if needed
    let baseCharge = zone.charge;
    let weightCharge = 0;
    
    // Add ₹10 per kg for weight over 5kg
    if (cartWeight > 5) {
      weightCharge = Math.ceil(cartWeight - 5) * 10;
    }

    const totalCharge = baseCharge + weightCharge;

    return {
      success: true,
      data: {
        deliveryCharge: totalCharge,
        baseCharge: baseCharge,
        weightCharge: weightCharge,
        zone: zone.zoneName,
        distance: distance,
        estimatedDays: zone.estimatedDays,
        warehousePincode: warehouse.pincode,
        deliveryPincode: deliveryPincode,
        deliveryCity: deliveryCoords.city,
        deliveryState: deliveryCoords.state,
        cartWeight: cartWeight
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Bulk validate pincodes
 */
const validatePincodes = (pincodes) => {
  return pincodes.map(pincode => ({
    pincode,
    isValid: validatePincode(pincode)
  }));
};

export {
  validatePincode,
  getPincodeCoordinates,
  calculateDistance,
  getShippingZone,
  getPrimaryWarehouse,
  calculateShipping,
  validatePincodes
};
