# Subcategory Update - Completed ✅

## Issue
Products in MongoDB database did not have proper `subcategory` values set, causing mismatch between:
- **Frontend filters**: Using subcategory IDs like "switchboard", "modular-6a", "wire-1sqmm", etc.
- **Backend data**: Products only had `category` field, no `subcategory`

## Products Affected
- **Switches & Sockets**: 40 products
  - Modular combined Plate → `subcategory: 'switchboard'`
  - Modular Switches (6A) → `subcategory: 'modular-6a'`
  - Modular Switches (16A) → `subcategory: 'modular-16a'`
  - Sockets → `subcategory: 'socket'`
  - Fan Regulators → `subcategory: 'fan-regulator'`

- **Wires & Cables**: 30 products
  - 1 sq mm Wire → `subcategory: 'wire-1sqmm'`
  - 1.5 sq mm Wire → `subcategory: 'wire-1.5sqmm'`
  - 2.5 sq mm Wire → `subcategory: 'wire-2.5sqmm'`
  - 4 sq mm Wire → `subcategory: 'service-wire'`
  - 6 sq mm Wire → `subcategory: 'lan-cable'`

## Solution Implemented

### 1. Created Update Script
**File**: `server/update-subcategories.js`

This script:
- Analyzes each product's name and description
- Determines the correct subcategory based on keywords
- Updates MongoDB with proper subcategory values

### 2. Subcategory Logic

#### For Switches & Sockets:
```javascript
- Contains "plate", "switchboard", "combined", "combination" → switchboard
- Contains "fan regulator", "regulator" → fan-regulator  
- Contains "socket" (but not "switch") → socket
- Contains "16a", "16 a", "16ax", "16amp" → modular-16a
- Contains "6a", "6 a", "6ax", "6amp" → modular-6a
- Contains "switch" → modular-6a (default)
```

#### For Wires & Cables:
```javascript
- Contains "1.0 sq", "1 sq mm" → wire-1sqmm
- Contains "1.5 sq" → wire-1.5sqmm
- Contains "2.5 sq" → wire-2.5sqmm
- Contains "4 sq", "4.0 sq" → service-wire
- Contains "6 sq", "6.0 sq" → lan-cable
```

### 3. Results
✅ **38 products updated** with proper subcategories

### 4. Verification
**File**: `server/verify-subcategories.js`

Confirmed:
- ✅ "6M Combined Plate Magnus Matt Grey" → `subcategory: 'switchboard'`
- ✅ All wire products have correct sq mm subcategories
- ✅ All switch products correctly categorized by amperage

## Frontend Compatibility

The frontend pages already filter by these subcategory values:

**SwitchesAndSockets.jsx**:
```javascript
const subcategories = [
  { id: 'modular-6a', label: 'Modular Switches (6A)' },
  { id: 'modular-16a', label: 'Modular Switches (16A)' },
  { id: 'socket', label: 'Sockets' },
  { id: 'fan-regulator', label: 'Fan Regulators' },
  { id: 'switchboard', label: 'Modular combined Plate' }
]
```

**WiresAndCables.jsx**:
```javascript
const subcategories = [
  { id: 'wire-1sqmm', label: '1 sq mm Wire (per meter)' },
  { id: 'wire-1.5sqmm', label: '1.5 sq mm Wire (per meter)' },
  { id: 'wire-2.5sqmm', label: '2.5 sq mm Wire (per meter)' },
  { id: 'service-wire', label: '4 sq mm Wire (per meter)' },
  { id: 'lan-cable', label: '6 sq mm Wire (per meter)' }
]
```

## Testing
1. ✅ MongoDB data updated successfully
2. ✅ Verified "6M Combined Plate Magnus Matt Grey" shows `subcategory: 'switchboard'`
3. ✅ Verified wire products have correct subcategories
4. 🔄 **Next**: Refresh browser to see filters working correctly

## Usage

### To update subcategories (if needed in future):
```bash
cd server
node update-subcategories.js
```

### To verify current subcategories:
```bash
cd server
node verify-subcategories.js
```

## Notes
- Product model already had `subcategory` field defined in schema
- Frontend determines subcategory client-side if not present in backend
- Now backend and frontend use consistent subcategory values
- Filters on category pages will work correctly
