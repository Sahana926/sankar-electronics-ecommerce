import mongoose from 'mongoose';

const shippingZoneSchema = new mongoose.Schema({
  zoneName: {
    type: String,
    required: true,
    enum: ['Zone 1', 'Zone 2', 'Zone 3', 'Not Serviceable']
  },
  minDistance: {
    type: Number,
    required: true,
    min: 0
  },
  maxDistance: {
    type: Number,
    required: true
  },
  charge: {
    type: Number,
    required: true,
    min: 0
  },
  estimatedDays: {
    type: Number,
    required: true,
    min: 1
  },
  description: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Warehouse configuration schema
const warehouseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true,
    match: /^[1-9][0-9]{5}$/
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  coordinates: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPrimary: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
shippingZoneSchema.index({ zoneName: 1, isActive: 1 });
warehouseSchema.index({ pincode: 1, isActive: 1 });
warehouseSchema.index({ isPrimary: 1 });

const ShippingZone = mongoose.model('ShippingZone', shippingZoneSchema);
const Warehouse = mongoose.model('Warehouse', warehouseSchema);

export { ShippingZone, Warehouse };
