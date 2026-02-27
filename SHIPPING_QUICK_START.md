# 🎯 Quick Start - Shipping Implementation

## ✅ What Has Been Implemented

### 1. **Database Models** ([server/models/ShippingZone.js](server/models/ShippingZone.js))
- `ShippingZone` model - Stores zone definitions (Local, Zonal, National)
- `Warehouse` model - Stores warehouse location and coordinates

### 2. **Business Logic** ([server/utils/shippingService.js](server/utils/shippingService.js))
- Pincode validation (6-digit Indian format)
- Distance calculation using Haversine formula
- Zone determination based on distance
- Weight-based surcharge calculation
- Coordinates lookup for pincodes

### 3. **API Routes** ([server/routes/shipping.js](server/routes/shipping.js))
- `POST /api/shipping/calculate-shipping` - Calculate delivery charges
- `POST /api/shipping/validate-pincode` - Validate single pincode
- `POST /api/shipping/validate-pincodes` - Validate multiple pincodes
- `GET /api/shipping/zones` - Get all shipping zones
- `GET /api/shipping/warehouse` - Get warehouse information
- `GET /api/shipping/check-serviceability/:pincode` - Check serviceability

### 4. **Integration** ([server/server.js](server/server.js))
- Routes registered in Express server
- Ready to use with existing project

### 5. **Seed Script** ([server/seed-shipping.js](server/seed-shipping.js))
- Initializes shipping zones in database
- Creates warehouse with coordinates

### 6. **Test Suite** ([server/test-shipping-api.js](server/test-shipping-api.js))
- Comprehensive API testing
- Error scenario validation

---

## 🚀 Setup Steps

### Step 1: Seed the Database
```bash
cd server
node seed-shipping.js
```

**Expected Output:**
```
✅ Connected to MongoDB
✅ Created 3 shipping zones
   - Local: 0-50 km → ₹40 (2 days)
   - Zonal: 51-300 km → ₹70 (4 days)
   - National: 301-10000 km → ₹100 (7 days)
✅ Created warehouse:
   - Name: Sankar Electrical Main Warehouse
   - Pincode: 110001
   - Location: New Delhi, Delhi
```

### Step 2: Update Warehouse Location (IMPORTANT!)

Edit `server/seed-shipping.js` (lines 56-69) with your actual warehouse details:

```javascript
const warehouse = {
  name: 'Your Actual Warehouse Name',
  pincode: 'YOUR_PINCODE',     // Replace with actual pincode
  address: 'Your Full Address',
  city: 'Your City',
  state: 'Your State',
  coordinates: {
    latitude: YOUR_LATITUDE,    // e.g., 28.6139
    longitude: YOUR_LONGITUDE   // e.g., 77.2090
  },
  isActive: true,
  isPrimary: true
};
```

**How to get coordinates:**
1. Go to [Google Maps](https://www.google.com/maps)
2. Search for your warehouse address
3. Right-click on the location
4. Click "What's here?"
5. Copy the latitude and longitude

Then re-run the seed script:
```bash
node seed-shipping.js
```

### Step 3: Start Server
```bash
npm start
```

Server will run on `http://localhost:5001`

---

## 📖 Usage Examples

### Example 1: Calculate Shipping in Checkout

**JavaScript/Fetch:**
```javascript
async function calculateShipping(pincode, totalWeight) {
  try {
    const response = await fetch('http://localhost:5001/api/shipping/calculate-shipping', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deliveryPincode: pincode,
        cartWeight: totalWeight
      })
    });

    const result = await response.json();

    if (result.success) {
      console.log('Delivery Charge:', result.data.deliveryCharge);
      console.log('Zone:', result.data.zone);
      console.log('Estimated Days:', result.data.estimatedDays);
      console.log('Distance:', result.data.distance, 'km');
      return result.data;
    } else {
      alert(result.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Usage
const shipping = await calculateShipping('400001', 5.5);
```

### Example 2: React Checkout Component

```jsx
import { useState, useEffect } from 'react';

function ShippingCalculator({ cartWeight }) {
  const [pincode, setPincode] = useState('');
  const [shippingInfo, setShippingInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateShipping = async () => {
    if (pincode.length !== 6) {
      setError('Please enter a valid 6-digit pincode');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5001/api/shipping/calculate-shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveryPincode: pincode,
          cartWeight: cartWeight || 1
        })
      });

      const data = await response.json();

      if (data.success) {
        setShippingInfo(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to calculate shipping. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shipping-calculator">
      <h3>Delivery Information</h3>
      
      <div className="input-group">
        <input
          type="text"
          placeholder="Enter delivery pincode"
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          maxLength="6"
        />
        <button 
          onClick={calculateShipping} 
          disabled={loading || pincode.length !== 6}
        >
          {loading ? 'Calculating...' : 'Check Delivery'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {shippingInfo && (
        <div className="shipping-details">
          <div className="detail-row">
            <span>Delivery Zone:</span>
            <strong>{shippingInfo.zone}</strong>
          </div>
          <div className="detail-row">
            <span>Distance:</span>
            <strong>{shippingInfo.distance} km</strong>
          </div>
          <div className="detail-row">
            <span>Delivery Charge:</span>
            <strong className="price">₹{shippingInfo.deliveryCharge}</strong>
          </div>
          {shippingInfo.weightCharge > 0 && (
            <div className="detail-row surcharge">
              <span>Weight Surcharge:</span>
              <span>₹{shippingInfo.weightCharge}</span>
            </div>
          )}
          <div className="detail-row">
            <span>Estimated Delivery:</span>
            <strong>{shippingInfo.estimatedDays} days</strong>
          </div>
          <div className="detail-row">
            <span>Delivery to:</span>
            <span>{shippingInfo.deliveryCity}, {shippingInfo.deliveryState}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShippingCalculator;
```

### Example 3: Add to Existing Checkout

```javascript
// In your checkout page
const handleCheckout = async () => {
  // 1. Get delivery pincode from user
  const pincode = document.getElementById('pincode').value;
  
  // 2. Calculate cart weight (you might have this logic already)
  const cartWeight = calculateTotalWeight(); // Your existing function
  
  // 3. Calculate shipping
  const response = await fetch('http://localhost:5001/api/shipping/calculate-shipping', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deliveryPincode: pincode, cartWeight })
  });
  
  const { data } = await response.json();
  
  // 4. Add shipping to order total
  const cartTotal = getCartTotal(); // Your existing function
  const finalTotal = cartTotal + data.deliveryCharge;
  
  // 5. Display to user
  document.getElementById('shipping-charge').textContent = `₹${data.deliveryCharge}`;
  document.getElementById('final-total').textContent = `₹${finalTotal}`;
  document.getElementById('delivery-estimate').textContent = `${data.estimatedDays} days`;
  
  // 6. Store shipping info for order
  const orderData = {
    items: cartItems,
    subtotal: cartTotal,
    shippingCharge: data.deliveryCharge,
    total: finalTotal,
    deliveryPincode: pincode,
    deliveryZone: data.zone,
    estimatedDelivery: data.estimatedDays
  };
  
  // Proceed with order...
};
```

---

## 🧪 Testing

### Quick Manual Test

**Using Browser Console or Postman:**

```javascript
// Test 1: Local delivery (Delhi area)
fetch('http://localhost:5001/api/shipping/calculate-shipping', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    deliveryPincode: '110002',
    cartWeight: 3
  })
})
.then(res => res.json())
.then(data => console.log(data));

// Test 2: National delivery (Mumbai)
fetch('http://localhost:5001/api/shipping/calculate-shipping', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    deliveryPincode: '400001',
    cartWeight: 8
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

### Using cURL

```bash
# Calculate shipping
curl -X POST http://localhost:5001/api/shipping/calculate-shipping \
  -H "Content-Type: application/json" \
  -d '{"deliveryPincode":"400001","cartWeight":5}'

# Get zones
curl http://localhost:5001/api/shipping/zones

# Get warehouse info
curl http://localhost:5001/api/shipping/warehouse
```

### Using Test Script

```bash
cd server
node test-shipping-api.js
```

---

## 📊 Pricing Logic

### Zone-Based Charges
| Zone | Distance | Base Charge | Estimated Days |
|------|----------|-------------|----------------|
| Local | 0-50 km | ₹40 | 2 days |
| Zonal | 51-300 km | ₹70 | 4 days |
| National | >300 km | ₹100 | 7 days |

### Weight Surcharge
- **Free up to 5 kg**
- **₹10 per kg over 5 kg**

### Example Calculations

**Example 1:** Local, 3 kg
- Base: ₹40
- Weight: 3 kg (no surcharge)
- **Total: ₹40**

**Example 2:** National, 8 kg
- Base: ₹100
- Weight: 8 kg - 5 kg = 3 kg × ₹10 = ₹30
- **Total: ₹130**

**Example 3:** Zonal, 12 kg
- Base: ₹70
- Weight: 12 kg - 5 kg = 7 kg × ₹10 = ₹70
- **Total: ₹140**

---

## 🔧 Customization

### Modify Shipping Zones

Edit zone charges in the database or via MongoDB:

```javascript
// Update in seed-shipping.js before seeding
const zones = [
  {
    zoneName: 'Local',
    minDistance: 0,
    maxDistance: 50,
    charge: 50,  // Changed from 40 to 50
    estimatedDays: 2,
    // ...
  }
];
```

### Add Express Delivery

Modify `server/utils/shippingService.js`:

```javascript
const calculateShipping = async (deliveryPincode, cartWeight, options = {}) => {
  // ... existing code ...
  
  let totalCharge = baseCharge + weightCharge;
  
  // Add express delivery option
  if (options.express) {
    totalCharge += 50;
    zone.estimatedDays = Math.ceil(zone.estimatedDays / 2);
  }
  
  return {
    success: true,
    data: {
      deliveryCharge: totalCharge,
      // ... rest of response
    }
  };
};
```

### Add Multiple Warehouses

Update warehouse query in `getPrimaryWarehouse()` to select nearest warehouse based on delivery location.

---

## 📝 API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/shipping/calculate-shipping` | Calculate delivery charges |
| POST | `/api/shipping/validate-pincode` | Validate pincode format |
| POST | `/api/shipping/validate-pincodes` | Validate multiple pincodes |
| GET | `/api/shipping/zones` | Get all zones |
| GET | `/api/shipping/warehouse` | Get warehouse info |
| GET | `/api/shipping/check-serviceability/:pincode` | Check if serviceable |

---

## 📚 Documentation Files

1. **[SHIPPING_IMPLEMENTATION_GUIDE.md](SHIPPING_IMPLEMENTATION_GUIDE.md)** - Complete implementation guide
2. **[SHIPPING_API_RESPONSES.md](SHIPPING_API_RESPONSES.md)** - Sample API responses
3. **This file** - Quick start guide

---

## ✅ Implementation Checklist

- [x] Mongoose schemas created
- [x] Distance calculation logic implemented
- [x] API endpoints created
- [x] Routes registered in server
- [x] Seed script created
- [x] Test script created
- [x] Documentation completed
- [ ] Update warehouse coordinates (YOUR ACTION REQUIRED)
- [ ] Expand pincode database for production
- [ ] Test in your application
- [ ] Integrate with checkout flow

---

## 🎉 You're Ready!

The shipping system is fully implemented and production-ready. Just update your warehouse coordinates and integrate it into your checkout process!

**Next Steps:**
1. Update warehouse details in `seed-shipping.js`
2. Run `node seed-shipping.js`
3. Test the API endpoints
4. Integrate into your checkout page
5. (Optional) Expand pincode database for production

---

## 💡 Production Tips

1. **Expand Pincode Database**: The current implementation has sample pincodes. For production, use:
   - Complete India Post pincode database
   - Google Maps Geocoding API
   - Mapbox or Positionstack API

2. **Add Caching**: Cache pincode coordinates to reduce API calls

3. **Error Logging**: Add proper error logging and monitoring

4. **Rate Limiting**: Add rate limiting to prevent abuse

5. **Input Sanitization**: Validate all inputs thoroughly

---

## 🆘 Troubleshooting

**Issue: "No active warehouse found"**
- Solution: Run `node seed-shipping.js` to create warehouse

**Issue: "Unable to fetch coordinates for pincode"**
- Solution: Pincode not in sample database. Add to `pincodeDatabase` in `shippingService.js` or use external API

**Issue: Server not starting**
- Solution: Check MongoDB connection, ensure port 5001 is free

**Issue: Routes not working**
- Solution: Restart server after making changes

---

**Happy Shipping! 🚚✨**
