# 🏗️ Shipping System Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SHIPPING SYSTEM                              │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────┐         ┌──────────────┐         ┌─────────────────┐
│             │         │              │         │                 │
│   Frontend  │────────▶│  API Routes  │────────▶│  Business Logic │
│ (Checkout)  │         │  shipping.js │         │ shippingService │
│             │◀────────│              │◀────────│                 │
└─────────────┘         └──────────────┘         └─────────────────┘
                                │                          │
                                │                          │
                                ▼                          ▼
                        ┌──────────────┐         ┌─────────────────┐
                        │   MongoDB    │         │   Haversine     │
                        │   Database   │         │   Formula       │
                        │              │         │  (Distance Calc)│
                        └──────────────┘         └─────────────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
            ┌──────────────┐       ┌──────────────┐
            │ShippingZones │       │  Warehouses  │
            │   Table      │       │    Table     │
            └──────────────┘       └──────────────┘
```

## Request Flow

```
1. User enters pincode at checkout
   ↓
2. Frontend calls API: POST /api/shipping/calculate-shipping
   {
     "deliveryPincode": "400001",
     "cartWeight": 5
   }
   ↓
3. API validates input
   ↓
4. Service fetches warehouse coordinates
   ↓
5. Service fetches delivery pincode coordinates
   ↓
6. Calculate distance using Haversine formula
   ↓
7. Determine zone based on distance
   ↓
8. Calculate charges (base + weight surcharge)
   ↓
9. Return response to frontend
   {
     "deliveryCharge": 100,
     "zone": "National",
     "distance": 1138.42,
     "estimatedDays": 7
   }
```

## Database Schema

```
┌───────────────────────────────┐
│      ShippingZone Model       │
├───────────────────────────────┤
│ zoneName: String              │  "Local", "Zonal", "National"
│ minDistance: Number           │  0, 51, 301
│ maxDistance: Number           │  50, 300, 10000
│ charge: Number                │  40, 70, 100
│ estimatedDays: Number         │  2, 4, 7
│ description: String           │
│ isActive: Boolean             │
│ timestamps: true              │
└───────────────────────────────┘

┌───────────────────────────────┐
│       Warehouse Model         │
├───────────────────────────────┤
│ name: String                  │  "Main Warehouse"
│ pincode: String               │  "110001"
│ address: String               │
│ city: String                  │  "New Delhi"
│ state: String                 │  "Delhi"
│ coordinates:                  │
│   ├─ latitude: Number         │  28.6139
│   └─ longitude: Number        │  77.2090
│ isActive: Boolean             │
│ isPrimary: Boolean            │
│ timestamps: true              │
└───────────────────────────────┘
```

## Distance Calculation

```
Haversine Formula (calculates great-circle distance)

                    ┌──────────────────────┐
                    │   Warehouse Coords   │
                    │   Lat1, Lon1         │
                    └──────────────────────┘
                              │
                              ▼
                    ┌──────────────────────┐
                    │  Haversine Formula   │
                    │  d = 2r × arcsin(√a) │
                    └──────────────────────┘
                              │
                              ▼
                    ┌──────────────────────┐
                    │   Delivery Coords    │
                    │   Lat2, Lon2         │
                    └──────────────────────┘
                              │
                              ▼
                        Distance (km)
```

## Charge Calculation Logic

```
START
  │
  ├─ Get Distance between Warehouse & Delivery Location
  │
  ├─ Determine Zone:
  │  ├─ 0-50 km    → Local    (₹40, 2 days)
  │  ├─ 51-300 km  → Zonal    (₹70, 4 days)
  │  └─ >300 km    → National (₹100, 7 days)
  │
  ├─ Calculate Base Charge
  │  Base Charge = Zone.charge
  │
  ├─ Calculate Weight Surcharge
  │  IF weight > 5 kg:
  │    surcharge = (weight - 5) × ₹10
  │  ELSE:
  │    surcharge = 0
  │
  ├─ Calculate Total
  │  Total = Base Charge + Weight Surcharge
  │
  └─ RETURN {
       deliveryCharge: Total,
       baseCharge: Base Charge,
       weightCharge: Surcharge,
       zone: Zone Name,
       distance: Distance,
       estimatedDays: Estimated Days
     }
END
```

## API Endpoints Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     /api/shipping/*                              │
└─────────────────────────────────────────────────────────────────┘

POST /calculate-shipping
├─ Input: { deliveryPincode, cartWeight }
├─ Validation: Pincode format, weight > 0
├─ Process: Calculate distance, determine zone, compute charge
└─ Output: { deliveryCharge, zone, distance, estimatedDays, ... }

POST /validate-pincode
├─ Input: { pincode }
├─ Validation: 6-digit format, starts with 1-9
└─ Output: { isValid, message }

POST /validate-pincodes
├─ Input: { pincodes: [] }
├─ Process: Validate each pincode
└─ Output: [{ pincode, isValid }, ...]

GET /zones
├─ Process: Fetch all active zones from DB
└─ Output: [{ zoneName, minDistance, maxDistance, charge, ... }]

GET /warehouse
├─ Process: Fetch primary warehouse
└─ Output: { name, pincode, city, state, address }

GET /check-serviceability/:pincode
├─ Input: pincode (URL param)
├─ Validation: Pincode format
└─ Output: { serviceable, message }
```

## File Structure & Relationships

```
server/
│
├── models/
│   └── ShippingZone.js ──────┐
│       ├─ ShippingZone schema │
│       └─ Warehouse schema    │
│                               │
├── utils/                      │
│   └── shippingService.js ────┼──▶ Uses schemas
│       ├─ validatePincode()   │
│       ├─ calculateDistance() │
│       ├─ getShippingZone()   │
│       └─ calculateShipping() │
│                               │
├── routes/                     │
│   └── shipping.js ───────────┼──▶ Uses service
│       ├─ POST /calculate     │
│       ├─ POST /validate      │
│       ├─ GET /zones          │
│       └─ GET /warehouse      │
│                               │
├── server.js ─────────────────┴──▶ Registers routes
│   └── app.use('/api/shipping', shippingRoutes)
│
├── seed-shipping.js ──────────────▶ Seeds database
│
└── test-shipping-api.js ──────────▶ Tests endpoints
```

## Data Flow Example

```
┌──────────────────────────────────────────────────────────────────┐
│  Example: Delhi (110001) → Mumbai (400001), 5kg package          │
└──────────────────────────────────────────────────────────────────┘

1. Input
   ┌─────────────────────────┐
   │ deliveryPincode: 400001 │
   │ cartWeight: 5           │
   └─────────────────────────┘

2. Validation
   ┌─────────────────────────┐
   │ ✓ Valid pincode format  │
   │ ✓ Weight > 0            │
   └─────────────────────────┘

3. Fetch Warehouse
   ┌─────────────────────────┐
   │ Pincode: 110001         │
   │ Lat: 28.6139            │
   │ Lon: 77.2090            │
   └─────────────────────────┘

4. Fetch Delivery Coords
   ┌─────────────────────────┐
   │ Pincode: 400001         │
   │ Lat: 19.0760            │
   │ Lon: 72.8777            │
   └─────────────────────────┘

5. Calculate Distance
   ┌─────────────────────────┐
   │ Haversine Formula       │
   │ Distance: 1138.42 km    │
   └─────────────────────────┘

6. Determine Zone
   ┌─────────────────────────┐
   │ 1138.42 km > 300 km     │
   │ Zone: National          │
   │ Charge: ₹100            │
   │ Days: 7                 │
   └─────────────────────────┘

7. Calculate Weight Surcharge
   ┌─────────────────────────┐
   │ Weight: 5 kg            │
   │ 5 kg ≤ 5 kg             │
   │ Surcharge: ₹0           │
   └─────────────────────────┘

8. Total Calculation
   ┌─────────────────────────┐
   │ Base: ₹100              │
   │ Weight: ₹0              │
   │ TOTAL: ₹100             │
   └─────────────────────────┘

9. Response
   ┌─────────────────────────┐
   │ deliveryCharge: 100     │
   │ baseCharge: 100         │
   │ weightCharge: 0         │
   │ zone: "National"        │
   │ distance: 1138.42       │
   │ estimatedDays: 7        │
   │ deliveryCity: "Mumbai"  │
   │ deliveryState: "MH"     │
   └─────────────────────────┘
```

## Integration Points

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend Integration                          │
└─────────────────────────────────────────────────────────────────┘

Checkout Page
    │
    ├─ User enters pincode
    │     └─ Validate: /validate-pincode
    │
    ├─ Calculate cart weight
    │
    ├─ Call API: /calculate-shipping
    │
    ├─ Display shipping info
    │     ├─ Delivery charge
    │     ├─ Estimated days
    │     └─ Zone
    │
    └─ Add to order total

Order Creation
    │
    ├─ Include shipping data:
    │     ├─ deliveryCharge
    │     ├─ deliveryPincode
    │     ├─ estimatedDays
    │     └─ zone
    │
    └─ Save to database
```

## Error Handling Flow

```
Request → Validation → Processing → Response
   │          │             │           │
   │          ▼             │           │
   │     Invalid Input?     │           │
   │          │             │           │
   │          ├─ Yes ───────┴───▶ 400 Error
   │          └─ No              { error: "..." }
   │                         │
   │                         ▼
   │                  Process Failed?
   │                         │
   │                         ├─ Yes ───▶ 500 Error
   │                         │           { error: "..." }
   │                         └─ No
   │                              │
   │                              ▼
   └──────────────────────▶  Success Response
                               { success: true, data: {...} }
```

## Zone Determination Logic

```
          Distance Calculation
                  │
                  ▼
         ┌────────────────┐
         │  Distance (km) │
         └────────────────┘
                  │
         ┌────────┴────────┬────────────────┐
         │                 │                │
         ▼                 ▼                ▼
    0-50 km          51-300 km         >300 km
         │                 │                │
         ▼                 ▼                ▼
    ┌────────┐       ┌────────┐       ┌─────────┐
    │ LOCAL  │       │ ZONAL  │       │NATIONAL │
    │  ₹40   │       │  ₹70   │       │  ₹100   │
    │ 2 days │       │ 4 days │       │  7 days │
    └────────┘       └────────┘       └─────────┘
```

## Weight Surcharge Logic

```
         Cart Weight
              │
              ▼
      ┌──────────────┐
      │ Weight ≤ 5kg?│
      └──────────────┘
              │
      ┌───────┴────────┐
      │                │
      ▼                ▼
     YES              NO
      │                │
      ▼                ▼
  No Surcharge   Calculate Surcharge
  Surcharge = 0   │
                  ▼
          (Weight - 5) × ₹10
                  │
                  ▼
            Surcharge = Result

Example:
  8kg → (8 - 5) × ₹10 = ₹30
  3kg → ₹0
  12kg → (12 - 5) × ₹10 = ₹70
```

## Complete Transaction Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    COMPLETE USER JOURNEY                          │
└──────────────────────────────────────────────────────────────────┘

User at Checkout
      │
      ▼
[1] Enter Delivery Pincode
      │
      ▼
[2] Frontend → POST /api/shipping/calculate-shipping
      │
      ▼
[3] Server validates pincode (6 digits, starts with 1-9)
      │
      ▼
[4] Get warehouse coordinates from DB
      │
      ▼
[5] Get delivery coordinates (from pincode database)
      │
      ▼
[6] Calculate distance using Haversine formula
      │
      ▼
[7] Query ShippingZone collection for matching zone
      │
      ▼
[8] Calculate base charge from zone
      │
      ▼
[9] Calculate weight surcharge if applicable
      │
      ▼
[10] Prepare response object with all details
      │
      ▼
[11] Send JSON response to frontend
      │
      ▼
[12] Frontend displays:
      - Delivery charge
      - Zone (Local/Zonal/National)
      - Estimated delivery days
      - Distance
      │
      ▼
[13] User confirms and places order
      │
      ▼
[14] Order saved with shipping information
```

## Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                      SYSTEM COMPONENTS                           │
├─────────────────────────────────────────────────────────────────┤
│ • 2 MongoDB Models (ShippingZone, Warehouse)                    │
│ • 6 API Endpoints (calculate, validate, zones, warehouse, etc.) │
│ • Haversine distance calculation                                │
│ • 3 delivery zones with configurable pricing                    │
│ • Weight-based surcharge system                                 │
│ • Comprehensive error handling                                  │
│ • Production-ready architecture                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    TECHNOLOGY STACK                              │
├─────────────────────────────────────────────────────────────────┤
│ Backend: Node.js + Express.js                                   │
│ Database: MongoDB + Mongoose                                    │
│ Algorithms: Haversine Formula                                   │
│ Architecture: RESTful API                                       │
│ Response Format: JSON                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

**🎯 System Architecture Complete!**

This architecture supports:
- ✅ Scalable design
- ✅ Production-ready code
- ✅ Clean separation of concerns
- ✅ Comprehensive error handling
- ✅ Extensible for future enhancements
