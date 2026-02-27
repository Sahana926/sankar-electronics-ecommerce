import mongoose from 'mongoose'

const variantSchema = new mongoose.Schema({
  wattage: { type: String, trim: true }, // e.g., "5W", "10W", "20W"
  colorName: { type: String, required: true, trim: true },
  colorCode: { type: String, trim: true }, // Hex code like #FF0000
  images: [{ type: String }], // Images specific to this variant
  price: { type: Number, min: 0 }, // Price for this specific variant
  stockQty: { type: Number, default: 0, min: 0 },
  sku: { type: String, trim: true }, // SKU specific to this variant
}, { _id: true })

// Legacy support
const colorVariantSchema = variantSchema

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '', trim: true },
  category: { type: String, default: '', index: true, trim: true },
  subcategory: { type: String, default: '', index: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  discountPrice: { type: Number, default: 0, min: 0 },
  stockQty: { type: Number, required: true, min: 0, index: true },
  sku: { type: String, trim: true, unique: true, sparse: true },
  images: [{ type: String }],
  colorVariants: [colorVariantSchema], // Color variants with images
  features: { type: mongoose.Schema.Types.Mixed, default: {} }, // Supports array or map of features
  status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
  softDeleted: { type: Boolean, default: false, index: true },
}, {
  timestamps: true,
})

productSchema.index({ name: 'text', description: 'text', category: 'text', subcategory: 'text', sku: 'text' })

const Product = mongoose.model('Product', productSchema)

export default Product
