# 📦 Shipping & Delivery Charge System

## Overview
Complete distance-based shipping charge calculation system using pincode validation and zone-based pricing for your e-commerce platform.

---

## 🎯 Features

✅ **Distance-Based Pricing**
- Automatic distance calculation between warehouse and delivery location
- Three shipping zones: Local, Zonal, and National

✅ **Smart Pincode Validation**
- Validates Indian pincode format (6-digit, starting with 1-9)
- Coordinates lookup for distance calculation
- Serviceability checking

✅ **Weight-Based Surcharges**
- Base charge for packages up to 5kg
- ₹10 per kg surcharge for packages over 5kg

✅ **Production-Ready**
- RESTful API endpoints
- Comprehensive error handling
- MongoDB schema with indexes
- Reusable service modules

---

## 📊 Shipping Zones

| Zone | Distance | Charge | Estimated Delivery |
|------|----------|--------|-------------------|
| **Local** | 0 - 50 km | ₹40 | 2 days |
| **Zonal** | 51 - 300 km | ₹70 | 4 days |
| **National** | > 300 km | ₹100 | 7 days |

**Weight Surcharge:** ₹10 per kg for packages over 5kg

---

## 🗂️ Project Structure

```
server/
├── models/
│   └── ShippingZone.js          # Mongoose schemas
├── routes/
│   └── shipping.js              # API endpoints
├── utils/
│   └── shippingService.js       # Core logic & calculations
├── seed-shipping.js             # Database seeding
└── test-shipping-api.js         # API tests
```

---

## 🚀 Quick Start

### 1. Seed the Database

```bash
cd server
node seed-shipping.js
```

### 2. Update Warehouse Location

Edit `server/seed-shipping.js` and update with your actual warehouse details:

```javascript
const warehouse = {
  name: 'Your Warehouse Name',
  pincode: 'YOUR_PINCODE',  // e.g., '110001'
  address: 'Your warehouse address',
  city: 'Your City',
  state: 'Your State',
  coordinates: {
    latitude: YOUR_LAT,    // e.g., 28.6139
    longitude: YOUR_LONG   // e.g., 77.2090
  }
};
```

💡 **Get coordinates:** Use [Google Maps](https://www.google.com/maps) - Right-click location → "What's here?"

### 3. Test the API

```bash
# Make sure server is running
npm start

# In another terminal
node test-shipping-api.js
```

---

## 📡 API Endpoints

### 1. Calculate Shipping

**POST** `/api/shipping/calculate-shipping`

Calculate delivery charges based on pincode and weight.

**Request Body:**
```json
{
  "deliveryPincode": "400001",
  "cartWeight": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Shipping calculated successfully",
  "data": {
    "deliveryCharge": 100,
    "baseCharge": 100,
    "weightCharge": 0,
    "zone": "National",
    "distance": 1138.42,
    "estimatedDays": 7,
    "warehousePincode": "110001",
    "deliveryPincode": "400001",
    "deliveryCity": "Mumbai",
    "deliveryState": "Maharashtra",
    "cartWeight": 5
  }
}
```

---

### 2. Validate Pincode

**POST** `/api/shipping/validate-pincode`

Validate a single pincode format.

**Request Body:**
```json
{
  "pincode": "110001"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pincode": "110001",
    "isValid": true,
    "message": "Valid pincode"
  }
}
```

---

### 3. Get Shipping Zones

**GET** `/api/shipping/zones`

Get all active shipping zones.

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "...",
      "zoneName": "Local",
      "minDistance": 0,
      "maxDistance": 50,
      "charge": 40,
      "estimatedDays": 2,
      "description": "Local delivery within 50 km",
      "isActive": true
    }
    // ... more zones
  ]
}
```

---

### 4. Get Warehouse Info

**GET** `/api/shipping/warehouse`

Get primary warehouse details.

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "Sankar Electrical Main Warehouse",
    "pincode": "110001",
    "city": "New Delhi",
    "state": "Delhi",
    "address": "123 Industrial Area, Sector 5"
  }
}
```

---

### 5. Check Serviceability

**GET** `/api/shipping/check-serviceability/:pincode`

Check if delivery is available for a pincode.

**Response:**
```json
{
  "success": true,
  "serviceable": true,
  "pincode": "400001",
  "message": "Delivery available for this pincode"
}
```

---

### 6. Validate Multiple Pincodes

**POST** `/api/shipping/validate-pincodes`

Validate multiple pincodes at once.

**Request Body:**
```json
{
  "pincodes": ["110001", "400001", "12345"]
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    { "pincode": "110001", "isValid": true },
    { "pincode": "400001", "isValid": true },
    { "pincode": "12345", "isValid": false }
  ]
}
```

---

## 🔧 Integration Guide

### Frontend Integration Example

```javascript
// Calculate shipping charges
const calculateShipping = async (pincode, cartWeight) => {
  try {
    const response = await fetch('http://localhost:5000/api/shipping/calculate-shipping', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deliveryPincode: pincode,
        cartWeight: cartWeight
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('Delivery Charge:', data.data.deliveryCharge);
      console.log('Estimated Days:', data.data.estimatedDays);
      console.log('Zone:', data.data.zone);
      return data.data;
    } else {
      console.error('Error:', data.error);
    }
  } catch (error) {
    console.error('Failed to calculate shipping:', error);
  }
};

// Usage in checkout
const pincode = '400001';
const cartWeight = getTotalCartWeight(); // Your function
const shippingInfo = await calculateShipping(pincode, cartWeight);
```

### React Component Example

```jsx
import { useState } from 'react';

function CheckoutShipping({ cartWeight }) {
  const [pincode, setPincode] = useState('');
  const [shipping, setShipping] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCalculateShipping = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/shipping/calculate-shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryPincode: pincode, cartWeight })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setShipping(data.data);
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('Failed to calculate shipping');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shipping-calculator">
      <h3>Calculate Delivery Charges</h3>
      <input
        type="text"
        placeholder="Enter Pincode"
        value={pincode}
        onChange={(e) => setPincode(e.target.value)}
        maxLength="6"
      />
      <button onClick={handleCalculateShipping} disabled={loading}>
        {loading ? 'Calculating...' : 'Calculate Shipping'}
      </button>

      {shipping && (
        <div className="shipping-info">
          <p><strong>Zone:</strong> {shipping.zone}</p>
          <p><strong>Distance:</strong> {shipping.distance} km</p>
          <p><strong>Delivery Charge:</strong> ₹{shipping.deliveryCharge}</p>
          <p><strong>Estimated Delivery:</strong> {shipping.estimatedDays} days</p>
          {shipping.weightCharge > 0 && (
            <p className="surcharge">
              (Includes ₹{shipping.weightCharge} weight surcharge)
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default CheckoutShipping;
```

---

## 🧪 Testing

### Run Tests

```bash
# Start server first
npm start

# Run tests in another terminal
node test-shipping-api.js
```

### Manual Testing with cURL

```bash
# Calculate shipping
curl -X POST http://localhost:5000/api/shipping/calculate-shipping \
  -H "Content-Type: application/json" \
  -d '{"deliveryPincode":"400001","cartWeight":5}'

# Validate pincode
curl -X POST http://localhost:5000/api/shipping/validate-pincode \
  -H "Content-Type: application/json" \
  -d '{"pincode":"110001"}'

# Get zones
curl http://localhost:5000/api/shipping/zones

# Get warehouse
curl http://localhost:5000/api/shipping/warehouse
```

---

## 📋 Database Schema

### ShippingZone Model

```javascript
{
  zoneName: String,          // 'Local', 'Zonal', 'National'
  minDistance: Number,       // Minimum distance in km
  maxDistance: Number,       // Maximum distance in km
  charge: Number,            // Base delivery charge in ₹
  estimatedDays: Number,     // Delivery time estimate
  description: String,       // Zone description
  isActive: Boolean,         // Enable/disable zone
  timestamps: true
}
```

### Warehouse Model

```javascript
{
  name: String,              // Warehouse name
  pincode: String,           // 6-digit pincode
  address: String,           // Full address
  city: String,              // City name
  state: String,             // State name
  coordinates: {
    latitude: Number,        // Latitude
    longitude: Number        // Longitude
  },
  isActive: Boolean,         // Enable/disable warehouse
  isPrimary: Boolean,        // Mark as primary warehouse
  timestamps: true
}
```

---

## 🔍 Distance Calculation

The system uses the **Haversine formula** to calculate the great-circle distance between two points on Earth:

```javascript
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}
```

---

## 📈 Production Considerations

### 1. Complete Pincode Database

The current implementation includes sample pincodes. For production:

**Option A:** Use a complete pincode database
- Download India Post pincode database
- Import into MongoDB collection
- Query coordinates from database

**Option B:** Use External Geocoding API
- Google Maps Geocoding API
- Mapbox Geocoding API
- Positionstack API

```javascript
// Example: Google Maps Geocoding API
const getPincodeCoordinates = async (pincode) => {
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${pincode},India&key=${GOOGLE_API_KEY}`
  );
  
  const location = response.data.results[0]?.geometry?.location;
  return {
    latitude: location.lat,
    longitude: location.lng
  };
};
```

### 2. Caching

Implement caching for frequently used pincodes:

```javascript
import NodeCache from 'node-cache';
const pincodeCache = new NodeCache({ stdTTL: 86400 }); // 24 hours

const getCachedPincodeCoordinates = async (pincode) => {
  const cached = pincodeCache.get(pincode);
  if (cached) return cached;
  
  const coords = await getPincodeCoordinates(pincode);
  pincodeCache.set(pincode, coords);
  return coords;
};
```

### 3. Multiple Warehouses

Support multiple warehouses and select nearest one:

```javascript
const calculateShippingFromNearestWarehouse = async (deliveryPincode) => {
  const warehouses = await Warehouse.find({ isActive: true });
  const deliveryCoords = await getPincodeCoordinates(deliveryPincode);
  
  let minDistance = Infinity;
  let selectedWarehouse = null;
  
  for (const warehouse of warehouses) {
    const distance = calculateDistance(
      warehouse.coordinates.latitude,
      warehouse.coordinates.longitude,
      deliveryCoords.latitude,
      deliveryCoords.longitude
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      selectedWarehouse = warehouse;
    }
  }
  
  // Calculate shipping from selected warehouse
  // ...
};
```

### 4. Dynamic Pricing

Add time-based or demand-based pricing:

```javascript
const getDynamicCharge = (baseCharge, options) => {
  let finalCharge = baseCharge;
  
  // Express delivery surcharge
  if (options.express) {
    finalCharge += 50;
  }
  
  // Weekend delivery surcharge
  const isWeekend = [0, 6].includes(new Date().getDay());
  if (isWeekend && options.weekendDelivery) {
    finalCharge += 30;
  }
  
  return finalCharge;
};
```

### 5. Unserviceable Pincodes

Maintain a list of unserviceable pincodes:

```javascript
const unserviceablePincodes = new Set([
  '110051', // Remote area
  '400075'  // Restricted zone
  // ...
]);

const checkServiceability = (pincode) => {
  if (unserviceablePincodes.has(pincode)) {
    return {
      serviceable: false,
      reason: 'Delivery not available in this area'
    };
  }
  return { serviceable: true };
};
```

---

## ⚙️ Configuration

### Environment Variables

Add to `.env`:

```env
# Optional: Google Maps API Key for production
GOOGLE_MAPS_API_KEY=your_api_key_here

# Optional: Enable distance caching
ENABLE_PINCODE_CACHE=true
CACHE_TTL=86400

# Optional: Maximum serviceable distance
MAX_DELIVERY_DISTANCE=5000
```

---

## 🐛 Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

Common errors:
- `400`: Invalid input (bad pincode format, negative weight)
- `404`: Resource not found (warehouse, zone)
- `500`: Server error (database, external API failures)

---

## 📞 Support

For issues or questions:
1. Check the test file: `test-shipping-api.js`
2. Review error logs in console
3. Verify database seeding: `node seed-shipping.js`
4. Ensure warehouse coordinates are correct

---

## 🎉 Summary

✅ **Created:**
- Mongoose schemas for shipping zones and warehouses
- RESTful API endpoints with full CRUD operations
- Distance calculation service using Haversine formula
- Pincode validation and serviceability checking
- Seed script for initial data
- Comprehensive test suite

✅ **Features:**
- Zone-based pricing (Local/Zonal/National)
- Weight-based surcharges
- Automatic distance calculation
- Production-ready error handling
- Scalable architecture

🚀 **Ready for production with additional enhancements!**
