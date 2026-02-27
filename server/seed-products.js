import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Product from './models/Product.js'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sankar_electrical'

// Helper function to get image URL from variants or use default
const getImageUrl = (product) => {
  if (product.imageUrl) return product.imageUrl
  if (product.variants && product.variants.length > 0) {
    const firstVariantWithImage = product.variants.find(v => v.imageUrl)
    if (firstVariantWithImage) return firstVariantWithImage.imageUrl
  }
  // Return empty array to let frontend handle fallback
  return []
}

// All products from Shop component with image links
const products = [
  // Magnus & Verona Series 6A Switches (from static baseProducts)
  { name: '6 AX One Way Flat Switch (Magnus Series)', description: 'Premium 6A one-way flat switch from Magnus series', category: 'Switches & Sockets', price: 75, discountPrice: 75, stockQty: 300, sku: 'ss-6ax-magnus', images: [], colorVariants: [ { colorName: 'Grey', colorCode: '#6b6b6b', price: 75 }, { colorName: 'White', colorCode: '#f5f5f5', price: 62 } ] },
  { name: '6 AX Two Way Flat Switch (Magnus Series)', description: 'Two-way flat switch with premium Magnus design', category: 'Switches & Sockets', price: 183, discountPrice: 183, stockQty: 200, sku: 'ss-magnus-2way-flat', images: [], colorVariants: [ { colorName: 'Grey', colorCode: '#6b6b6b', price: 183 }, { colorName: 'White', colorCode: '#f5f5f5', price: 152 } ] },
  { name: '6 A Bell Push Flat Switch (Magnus Series)', description: 'Flat bell push switch in Magnus series', category: 'Switches & Sockets', price: 225, discountPrice: 225, stockQty: 220, sku: 'ss-magnus-bell-push-flat', images: [], colorVariants: [ { colorName: 'Grey', colorCode: '#6b6b6b', price: 225 }, { colorName: 'White', colorCode: '#f5f5f5', price: 188 } ] },
  { name: '6 AX Switch 1Way (Magnus Series)', description: 'One-way Magnus series switch', category: 'Switches & Sockets', price: 71, discountPrice: 71, stockQty: 300, sku: 'ss-magnus-1way', images: [], colorVariants: [ { colorName: 'Grey', colorCode: '#6b6b6b', price: 71 }, { colorName: 'White', colorCode: '#f5f5f5', price: 59 } ] },
  { name: '6 AX Switch 2Way (Magnus Series)', description: 'Two-way Magnus series switch', category: 'Switches & Sockets', price: 165, discountPrice: 165, stockQty: 280, sku: 'ss-magnus-2way', images: [], colorVariants: [ { colorName: 'Grey', colorCode: '#6b6b6b', price: 165 }, { colorName: 'White', colorCode: '#f5f5f5', price: 138 } ] },
  { name: '6 A 1Way Bell Push (Magnus Series)', description: 'One-way bell push switch in Magnus series', category: 'Switches & Sockets', price: 204, discountPrice: 204, stockQty: 260, sku: 'ss-magnus-1way-bell-push', images: [], colorVariants: [ { colorName: 'Grey', colorCode: '#6b6b6b', price: 204 }, { colorName: 'White', colorCode: '#f5f5f5', price: 170 } ] },
  { name: '6 A Switch 1Way Bell Push with Indicator (Magnus Series)', description: 'Bell push with indicator in Magnus series', category: 'Switches & Sockets', price: 250, discountPrice: 250, stockQty: 240, sku: 'ss-magnus-1way-bell-push-ind', images: [], colorVariants: [ { colorName: 'Grey', colorCode: '#6b6b6b', price: 250 }, { colorName: 'White', colorCode: '#f5f5f5', price: 208 } ] },
  { name: '6 AX One Way Switch (Verona Series)', description: 'Verona series one-way switch with color options', category: 'Switches & Sockets', price: 85, discountPrice: 85, stockQty: 300, sku: 'ss-verona-1way', images: [], colorVariants: [ { colorName: 'White', colorCode: '#f5f5f5', price: 85 }, { colorName: 'Black', colorCode: '#000000', price: 106 }, { colorName: 'Grey', colorCode: '#6b6b6b', price: 106 } ] },
  { name: '6 AX Two Way Switch (Verona Series)', description: 'Verona series two-way switch with color options', category: 'Switches & Sockets', price: 165, discountPrice: 165, stockQty: 280, sku: 'ss-verona-2way', images: [], colorVariants: [ { colorName: 'White', colorCode: '#f5f5f5', price: 165 }, { colorName: 'Black', colorCode: '#000000', price: 207 }, { colorName: 'Grey', colorCode: '#6b6b6b', price: 207 } ] },
  { name: '6 A One Way Bell Push (Verona Series)', description: 'Verona series one-way bell push switch', category: 'Switches & Sockets', price: 199, discountPrice: 199, stockQty: 260, sku: 'ss-verona-bell-push-1way', images: [], colorVariants: [ { colorName: 'White', colorCode: '#f5f5f5', price: 199 }, { colorName: 'Black', colorCode: '#000000', price: 249 }, { colorName: 'Grey', colorCode: '#6b6b6b', price: 249 } ] },
  { name: '6 A One Way Bell Push with Indicator (Verona Series)', description: 'Verona series bell push with indicator', category: 'Switches & Sockets', price: 249, discountPrice: 249, stockQty: 240, sku: 'ss-verona-bell-push-1way-ind', images: [], colorVariants: [ { colorName: 'White', colorCode: '#f5f5f5', price: 249 }, { colorName: 'Black', colorCode: '#000000', price: 311 }, { colorName: 'Grey', colorCode: '#6b6b6b', price: 311 } ] },

  // Magnus & Verona Series 16A Switches
  { name: '16 AX One Way Flat Switch (Magnus Series)', description: 'Flat 16A one-way switch in Magnus design', category: 'Switches & Sockets', price: 208, discountPrice: 208, stockQty: 180, sku: 'mod16-magnus-flat-1way', images: [], colorVariants: [ { colorName: 'Grey', colorCode: '#6b6b6b', price: 208 }, { colorName: 'White', colorCode: '#f5f5f5', price: 173 } ] },
  { name: '16 AX One Way Flat Switch with Indicator (Magnus Series)', description: 'Flat 16A one-way switch with indicator, Magnus series', category: 'Switches & Sockets', price: 298, discountPrice: 298, stockQty: 160, sku: 'mod16-magnus-flat-1way-ind', images: [], colorVariants: [ { colorName: 'Grey', colorCode: '#6b6b6b', price: 298 }, { colorName: 'White', colorCode: '#f5f5f5', price: 298 } ] },
  { name: '16 AX Two Way Flat Switch (Magnus Series)', description: 'Two-way 16A flat switch in Magnus range', category: 'Switches & Sockets', price: 344, discountPrice: 344, stockQty: 170, sku: 'mod16-magnus-flat-2way', images: [], colorVariants: [ { colorName: 'Grey', colorCode: '#6b6b6b', price: 344 }, { colorName: 'White', colorCode: '#f5f5f5', price: 287 } ] },
  { name: '16 AX Switch 1Way (Magnus Series)', description: 'Premium 16A one-way Magnus switch', category: 'Switches & Sockets', price: 190, discountPrice: 190, stockQty: 200, sku: 'mod16-magnus-1way', images: [], colorVariants: [ { colorName: 'Grey', colorCode: '#6b6b6b', price: 190 }, { colorName: 'White', colorCode: '#f5f5f5', price: 158 } ] },
  { name: '16 AX Switch 1Way with Indicator (Magnus Series)', description: '16A one-way Magnus switch with indicator', category: 'Switches & Sockets', price: 270, discountPrice: 270, stockQty: 180, sku: 'mod16-magnus-1way-ind', images: [], colorVariants: [ { colorName: 'Grey', colorCode: '#6b6b6b', price: 270 }, { colorName: 'White', colorCode: '#f5f5f5', price: 225 } ] },
  { name: '16 AX Switch 2Way (Magnus Series)', description: '16A two-way Magnus switch for dual control', category: 'Switches & Sockets', price: 313, discountPrice: 313, stockQty: 180, sku: 'mod16-magnus-2way', images: [], colorVariants: [ { colorName: 'Grey', colorCode: '#6b6b6b', price: 313 }, { colorName: 'White', colorCode: '#f5f5f5', price: 261 } ] },
  { name: '16 AX One Way Switch (Verona Series)', description: 'Verona 16A one-way switch in multiple finishes', category: 'Switches & Sockets', price: 201, discountPrice: 201, stockQty: 190, sku: 'mod16-verona-1way', images: [], colorVariants: [ { colorName: 'White', colorCode: '#f5f5f5', price: 201 }, { colorName: 'Black', colorCode: '#000000', price: 252 }, { colorName: 'Grey', colorCode: '#6b6b6b', price: 252 } ] },
  { name: '16 AX One Way Switch with Indicator (Verona Series)', description: 'Verona 16A one-way switch with indicator', category: 'Switches & Sockets', price: 239, discountPrice: 239, stockQty: 180, sku: 'mod16-verona-1way-ind', images: [], colorVariants: [ { colorName: 'White', colorCode: '#f5f5f5', price: 239 }, { colorName: 'Black', colorCode: '#000000', price: 298 }, { colorName: 'Grey', colorCode: '#6b6b6b', price: 298 } ] },
  { name: '16 AX Two Way Switch (Verona Series)', description: 'Verona 16A two-way switch for dual control', category: 'Switches & Sockets', price: 292, discountPrice: 292, stockQty: 180, sku: 'mod16-verona-2way', images: [], colorVariants: [ { colorName: 'White', colorCode: '#f5f5f5', price: 292 }, { colorName: 'Black', colorCode: '#000000', price: 364 }, { colorName: 'Grey', colorCode: '#6b6b6b', price: 364 } ] },
  { name: '16 AX Mega One Way Switch (Thames Series)', description: 'Thames mega 16A one-way switch', category: 'Switches & Sockets', price: 328, discountPrice: 328, stockQty: 140, sku: 'mod16-thames-1way', images: [], colorVariants: [ { colorName: 'White', colorCode: '#f5f5f5', price: 328 } ] },
  { name: '16 AX Mega One Way Switch with Indicator (Thames Series)', description: 'Thames mega 16A switch with indicator', category: 'Switches & Sockets', price: 355, discountPrice: 355, stockQty: 140, sku: 'mod16-thames-1way-ind', images: [], colorVariants: [ { colorName: 'White', colorCode: '#f5f5f5', price: 355 } ] },

  // Other Modular Switches (simple products)
  { name: 'Heavy Duty Modular Switch 16A', description: 'Industrial grade 16A modular switch', category: 'Switches & Sockets', price: 95, discountPrice: 95, stockQty: 30, sku: 'ss-2', images: [] },

  // Sockets (from static baseProducts)
  { name: '6A Power Socket', description: 'Standard 6A power socket for home use', category: 'Switches & Sockets', price: 30, discountPrice: 30, stockQty: 60, sku: 'ss-3', images: [] },
  { name: '16A Heavy Duty Socket', description: 'High current 16A socket for appliances', category: 'Switches & Sockets', price: 85, discountPrice: 85, stockQty: 40, sku: 'ss-4', images: [] },
  { name: '16A Socket with USB', description: '16A socket with built-in USB charging ports', category: 'Switches & Sockets', price: 120, discountPrice: 120, stockQty: 20, sku: 'ss-8', images: [] },
  { name: '6 A 3 Pin Socket (Magnus Series)', description: 'Magnus series 6A 3-pin socket', category: 'Switches & Sockets', price: 180, discountPrice: 180, stockQty: 200, sku: 'sock-magnus-6a-3pin', images: [], colorVariants: [ { colorName: 'Grey', colorCode: '#6b6b6b', price: 180 }, { colorName: 'White', colorCode: '#f5f5f5', price: 150 } ] },
  { name: '6 A /16 A Socket (Magnus Series)', description: 'Magnus series 6A/16A combo socket', category: 'Switches & Sockets', price: 304, discountPrice: 304, stockQty: 180, sku: 'sock-magnus-6a16a', images: [], colorVariants: [ { colorName: 'Grey', colorCode: '#6b6b6b', price: 304 }, { colorName: 'White', colorCode: '#f5f5f5', price: 253 } ] },
  { name: '6 A 3 Pin Shuttered Socket ISI (YU Series)', description: 'YU series 6A shuttered socket with ISI mark', category: 'Switches & Sockets', price: 130, discountPrice: 130, stockQty: 200, sku: 'sock-yu-6a-3pin-isi', images: [], colorVariants: [ { colorName: 'White', colorCode: '#f5f5f5', price: 130 }, { colorName: 'Grey', colorCode: '#6b6b6b', price: 165 }, { colorName: 'Black', colorCode: '#000000', price: 165 } ] },
  { name: '6/16 A 3 Pin Shuttered Socket ISI (YU Series)', description: 'YU series 6/16A shuttered socket with ISI mark', category: 'Switches & Sockets', price: 215, discountPrice: 215, stockQty: 180, sku: 'sock-yu-6a16a-isi', images: [], colorVariants: [ { colorName: 'White', colorCode: '#f5f5f5', price: 215 }, { colorName: 'Grey', colorCode: '#6b6b6b', price: 270 }, { colorName: 'Black', colorCode: '#000000', price: 270 } ] },
  { name: '6 A /16 A Heavy Duty Shuttered Socket (YU Series)', description: 'Heavy duty shuttered socket YU Series', category: 'Switches & Sockets', price: 300, discountPrice: 300, stockQty: 160, sku: 'sock-yu-6a16a-heavy', images: [], colorVariants: [ { colorName: 'White', colorCode: '#f5f5f5', price: 300 }, { colorName: 'Grey', colorCode: '#6b6b6b', price: 375 }, { colorName: 'Black', colorCode: '#000000', price: 375 } ] },
  { name: '6 A 3 Pin Shuttered Socket ISI (Verona Series)', description: 'Verona 6A shuttered socket with ISI mark', category: 'Switches & Sockets', price: 193, discountPrice: 193, stockQty: 190, sku: 'sock-verona-6a-3pin-isi', images: [], colorVariants: [ { colorName: 'White', colorCode: '#f5f5f5', price: 193 }, { colorName: 'Grey', colorCode: '#6b6b6b', price: 241 }, { colorName: 'Black', colorCode: '#000000', price: 241 } ] },
  { name: '6 A/16 A 3 Pin Shuttered Socket ISI (Verona Series)', description: 'Verona 6/16A ISI shuttered socket', category: 'Switches & Sockets', price: 297, discountPrice: 297, stockQty: 180, sku: 'sock-verona-6a16a-isi', images: [], colorVariants: [ { colorName: 'White', colorCode: '#f5f5f5', price: 297 }, { colorName: 'Grey', colorCode: '#6b6b6b', price: 371 }, { colorName: 'Black', colorCode: '#000000', price: 371 } ] },
  { name: '6 A/16 A Shuttered Socket (Heavy Duty) Verona', description: 'Heavy duty Verona shuttered socket', category: 'Switches & Sockets', price: 297, discountPrice: 297, stockQty: 160, sku: 'sock-verona-6a16a-heavy', images: [], colorVariants: [ { colorName: 'White', colorCode: '#f5f5f5', price: 297 }, { colorName: 'Grey', colorCode: '#6b6b6b', price: 472 }, { colorName: 'Black', colorCode: '#000000', price: 472 } ] },

  // Fan Regulators (from static baseProducts)
  { name: '1M 4 Step Fan Regulator (Verona Series)', description: 'Verona 1M 4-step fan regulator', category: 'Switches & Sockets', price: 590, discountPrice: 590, stockQty: 140, sku: 'fan-verona-1m-4step', images: [], colorVariants: [ { colorName: 'Grey', colorCode: '#6b6b6b', price: 736 }, { colorName: 'Black', colorCode: '#000000', price: 736 }, { colorName: 'White', colorCode: '#f5f5f5', price: 590 } ] },
  { name: '2M 8 Step Fan Regulator (Verona Series)', description: 'Verona 2M 8-step fan regulator', category: 'Switches & Sockets', price: 671, discountPrice: 671, stockQty: 140, sku: 'fan-verona-2m-8step', images: [], colorVariants: [ { colorName: 'Grey', colorCode: '#6b6b6b', price: 838 }, { colorName: 'Black', colorCode: '#000000', price: 838 }, { colorName: 'White', colorCode: '#f5f5f5', price: 671 } ] },
  { name: '1M 4 Step Fan Regulator (YU Series)', description: 'YU series 1M 4-step regulator (support module)', category: 'Switches & Sockets', price: 440, discountPrice: 440, stockQty: 150, sku: 'fan-yu-1m-4step', images: [], colorVariants: [ { colorName: 'Grey', colorCode: '#6b6b6b', price: 550 }, { colorName: 'Black', colorCode: '#000000', price: 550 }, { colorName: 'White', colorCode: '#f5f5f5', price: 440 } ] },
  { name: '2M 8 Step Fan Regulator (YU Series)', description: 'YU series 2M 8-step regulator (support module)', category: 'Switches & Sockets', price: 545, discountPrice: 545, stockQty: 150, sku: 'fan-yu-2m-8step', images: [], colorVariants: [ { colorName: 'Grey', colorCode: '#6b6b6b', price: 680 }, { colorName: 'Black', colorCode: '#000000', price: 680 }, { colorName: 'White', colorCode: '#f5f5f5', price: 545 } ] },
  { name: '1M Fan Regulator (Magnus Series)', description: 'Magnus series 1M fan regulator support module', category: 'Switches & Sockets', price: 457, discountPrice: 457, stockQty: 160, sku: 'fan-magnus-1m', images: [], colorVariants: [ { colorName: 'Grey', colorCode: '#6b6b6b', price: 549 }, { colorName: 'White', colorCode: '#f5f5f5', price: 457 } ] },
  { name: '2M Fan Regulator (Magnus Series)', description: 'Magnus series 2M fan regulator support module', category: 'Switches & Sockets', price: 512, discountPrice: 512, stockQty: 160, sku: 'fan-magnus-2m', images: [], colorVariants: [ { colorName: 'Grey', colorCode: '#6b6b6b', price: 614 }, { colorName: 'White', colorCode: '#f5f5f5', price: 512 } ] },

  // Switchboard Plates (from static baseProducts)
  { name: 'Designer Switchboard Plate', description: 'Premium finish switchboard plate', category: 'Switches & Sockets', price: 100, discountPrice: 100, stockQty: 35, sku: 'ss-6', images: [] },
  { name: '18M Combination Plate (Dark Grey Bliss+)', description: '18M cover frame only, Bliss+ dark grey', category: 'Switches & Sockets', price: 297, discountPrice: 297, stockQty: 120, sku: 'cp-bliss-18m-dg', images: [] },
  { name: '12M Combination Plate (Dark Grey Bliss+)', description: '12M cover frame only, Bliss+ dark grey', category: 'Switches & Sockets', price: 257, discountPrice: 257, stockQty: 120, sku: 'cp-bliss-12m-dg', images: [] },
  { name: '6M Combination Plate (Dark Grey Bliss+)', description: '6M cover frame only, Bliss+ dark grey', category: 'Switches & Sockets', price: 164, discountPrice: 164, stockQty: 130, sku: 'cp-bliss-6m-dg', images: [] },
  { name: '4M Combination Plate (Dark Grey Bliss+)', description: '4M cover frame only, Bliss+ dark grey', category: 'Switches & Sockets', price: 114, discountPrice: 114, stockQty: 130, sku: 'cp-bliss-4m-dg', images: [] },
  { name: '8M Square Combination Plate (Wooden Box)', description: '8M square cover frame for wooden box', category: 'Switches & Sockets', price: 257, discountPrice: 257, stockQty: 110, sku: 'cp-wood-8m-sq', images: [] },
  { name: '16M Combination Plate (Silk White)', description: '16M cover frame only, silk white', category: 'Switches & Sockets', price: 263, discountPrice: 263, stockQty: 120, sku: 'cp-silk-16m', images: [] },
  { name: '18M Combination Plate (Wooden Box)', description: '18M cover frame for wooden box', category: 'Switches & Sockets', price: 407, discountPrice: 407, stockQty: 110, sku: 'cp-wood-18m', images: [] },
  { name: '10M (H) Combination Plate (Wooden Box)', description: '10M horizontal cover frame for wooden box', category: 'Switches & Sockets', price: 286, discountPrice: 286, stockQty: 110, sku: 'cp-wood-10m-h', images: [] },
  { name: '4M Combined Plate Magnus ACR Glossy Black', description: '4M Magnus acrylic glossy black cover frame', category: 'Switches & Sockets', price: 490, discountPrice: 490, stockQty: 90, sku: 'cp-magnus-4m-acr-black', images: [] },
  { name: '6M Combined Plate Magnus ACR Steel Grey', description: '6M Magnus acrylic steel grey cover frame', category: 'Switches & Sockets', price: 664, discountPrice: 664, stockQty: 90, sku: 'cp-magnus-6m-acr-steelgrey', images: [] },
  { name: '2M Combined Plate Magnus ACR Glossy Brown', description: '2M Magnus acrylic glossy brown cover frame', category: 'Switches & Sockets', price: 336, discountPrice: 336, stockQty: 100, sku: 'cp-magnus-2m-acr-brown', images: [] },
  { name: '4M Combined Plate Magnus ACR Glossy Brown', description: '4M Magnus acrylic glossy brown cover frame', category: 'Switches & Sockets', price: 490, discountPrice: 490, stockQty: 95, sku: 'cp-magnus-4m-acr-brown', images: [] },
  { name: '2M Combined Plate Magnus Acrylic Walnut Wood', description: '2M Magnus acrylic walnut wood cover frame', category: 'Switches & Sockets', price: 348, discountPrice: 348, stockQty: 100, sku: 'cp-magnus-2m-acr-walnut', images: [] },
  { name: '2M Combined Plate Magnus ACR Glossy White', description: '2M Magnus acrylic glossy white cover frame', category: 'Switches & Sockets', price: 336, discountPrice: 336, stockQty: 100, sku: 'cp-magnus-2m-acr-white', images: [] },
  { name: '4M Combined Plate Magnus Matt Grey', description: '4M Magnus matt grey cover frame', category: 'Switches & Sockets', price: 251, discountPrice: 251, stockQty: 110, sku: 'cp-magnus-4m-matt-grey', images: [] },
  { name: '6M Combined Plate Magnus Matt Gold', description: '6M Magnus matt gold cover frame', category: 'Switches & Sockets', price: 343, discountPrice: 343, stockQty: 110, sku: 'cp-magnus-6m-matt-gold', images: [] },
  { name: '6M Combined Plate Magnus ACR Glossy Black', description: '6M Magnus acrylic glossy black cover frame', category: 'Switches & Sockets', price: 664, discountPrice: 664, stockQty: 90, sku: 'cp-magnus-6m-acr-black', images: [] },
  { name: '6M Combined Plate Magnus Acrylic Walnut Wood', description: '6M Magnus acrylic walnut wood cover frame', category: 'Switches & Sockets', price: 684, discountPrice: 684, stockQty: 90, sku: 'cp-magnus-6m-acr-walnut', images: [] },
  { name: '6M Combined Plate Magnus Matt Grey', description: '6M Magnus matt grey cover frame', category: 'Switches & Sockets', price: 343, discountPrice: 343, stockQty: 110, sku: 'cp-magnus-6m-matt-grey', images: [] },

  // Switches & Sockets - No placeholder images, let frontend handle
  { name: '6 A /16 A Heavy Duty Shuttered Socket (YU Series)', description: 'YU heavy duty 6/16A shuttered socket', category: 'Switches & Sockets', price: 375, discountPrice: 300, stockQty: 160, sku: 'SOCK-YU-6A16A-HD', images: [] },
  { name: '6 A 3 Pin Shuttered Socket ISI (Verona Series)', description: 'Verona 6A shuttered socket ISI', category: 'Switches & Sockets', price: 241, discountPrice: 193, stockQty: 190, sku: 'SOCK-VER-6A-3PIN-ISI', images: [] },
  { name: '6 A/16 A 3 Pin Shuttered Socket ISI (Verona Series)', description: 'Verona 6/16A shuttered socket ISI', category: 'Switches & Sockets', price: 371, discountPrice: 297, stockQty: 180, sku: 'SOCK-VER-6A16A-ISI', images: [] },
  { name: '6 A/16 A Shuttered Socket (Heavy Duty) Verona', description: 'Verona heavy duty 6/16A shuttered socket', category: 'Switches & Sockets', price: 472, discountPrice: 297, stockQty: 160, sku: 'SOCK-VER-6A16A-HD', images: [] },
  { name: '1M 4 Step Fan Regulator (Verona Series)', description: 'Verona 1M 4-step fan regulator', category: 'Switches & Sockets', price: 736, discountPrice: 590, stockQty: 140, sku: 'FAN-REG-VER-1M-4STEP', images: [] },
  { name: '2M 8 Step Fan Regulator (Verona Series)', description: 'Verona 2M 8-step fan regulator', category: 'Switches & Sockets', price: 838, discountPrice: 671, stockQty: 140, sku: 'FAN-REG-VER-2M-8STEP', images: [] },
  { name: '1M 4 Step Fan Regulator (YU Series)', description: 'YU 1M 4-step fan regulator support module', category: 'Switches & Sockets', price: 550, discountPrice: 440, stockQty: 150, sku: 'FAN-REG-YU-1M-4STEP', images: [] },
  { name: '2M 8 Step Fan Regulator (YU Series)', description: 'YU 2M 8-step fan regulator support module', category: 'Switches & Sockets', price: 680, discountPrice: 545, stockQty: 150, sku: 'FAN-REG-YU-2M-8STEP', images: [] },
  { name: '1M Fan Regulator (Magnus Series)', description: 'Magnus 1M fan regulator support module', category: 'Switches & Sockets', price: 549, discountPrice: 457, stockQty: 160, sku: 'FAN-REG-MAG-1M', images: [] },
  { name: '2M Fan Regulator (Magnus Series)', description: 'Magnus 2M fan regulator support module', category: 'Switches & Sockets', price: 614, discountPrice: 512, stockQty: 160, sku: 'FAN-REG-MAG-2M', images: [] },
  { name: '18M Combination Plate (Dark Grey Bliss+)', description: '18M cover frame only, Bliss+ dark grey', category: 'Switches & Sockets', price: 297, discountPrice: 297, stockQty: 120, sku: 'CP-BLISS-18M-DG', images: [] },
  { name: '12M Combination Plate (Dark Grey Bliss+)', description: '12M cover frame only, Bliss+ dark grey', category: 'Switches & Sockets', price: 257, discountPrice: 257, stockQty: 120, sku: 'CP-BLISS-12M-DG', images: [] },
  { name: '6M Combination Plate (Dark Grey Bliss+)', description: '6M cover frame only, Bliss+ dark grey', category: 'Switches & Sockets', price: 164, discountPrice: 164, stockQty: 130, sku: 'CP-BLISS-6M-DG', images: [] },
  { name: '4M Combination Plate (Dark Grey Bliss+)', description: '4M cover frame only, Bliss+ dark grey', category: 'Switches & Sockets', price: 114, discountPrice: 114, stockQty: 130, sku: 'CP-BLISS-4M-DG', images: [] },
  { name: '8M Square Combination Plate (Wooden Box)', description: '8M square cover frame for wooden box', category: 'Switches & Sockets', price: 257, discountPrice: 257, stockQty: 110, sku: 'CP-WOOD-8M-SQ', images: [] },
  { name: '16M Combination Plate (Silk White)', description: '16M cover frame only, silk white', category: 'Switches & Sockets', price: 263, discountPrice: 263, stockQty: 120, sku: 'CP-SILK-16M', images: [] },
  { name: '18M Combination Plate (Wooden Box)', description: '18M cover frame for wooden box', category: 'Switches & Sockets', price: 407, discountPrice: 407, stockQty: 110, sku: 'CP-WOOD-18M', images: [] },
  { name: '10M (H) Combination Plate (Wooden Box)', description: '10M horizontal cover frame for wooden box', category: 'Switches & Sockets', price: 286, discountPrice: 286, stockQty: 110, sku: 'CP-WOOD-10M-H', images: [] },
  { name: '4M Combined Plate Magnus ACR Glossy Black', description: '4M Magnus acrylic glossy black cover frame', category: 'Switches & Sockets', price: 490, discountPrice: 490, stockQty: 90, sku: 'CP-MAG-4M-ACR-BLK', images: [] },
  { name: '6M Combined Plate Magnus ACR Steel Grey', description: '6M Magnus acrylic steel grey cover frame', category: 'Switches & Sockets', price: 664, discountPrice: 664, stockQty: 90, sku: 'CP-MAG-6M-ACR-GREY', images: [] },
  { name: '2M Combined Plate Magnus ACR Glossy Brown', description: '2M Magnus acrylic glossy brown cover frame', category: 'Switches & Sockets', price: 336, discountPrice: 336, stockQty: 100, sku: 'CP-MAG-2M-ACR-BRN', images: [] },
  { name: '4M Combined Plate Magnus ACR Glossy Brown', description: '4M Magnus acrylic glossy brown cover frame', category: 'Switches & Sockets', price: 490, discountPrice: 490, stockQty: 95, sku: 'CP-MAG-4M-ACR-BRN', images: [] },
  { name: '2M Combined Plate Magnus Acrylic Walnut Wood', description: '2M Magnus acrylic walnut wood cover frame', category: 'Switches & Sockets', price: 348, discountPrice: 348, stockQty: 100, sku: 'CP-MAG-2M-ACR-WAL', images: [] },
  { name: '2M Combined Plate Magnus ACR Glossy White', description: '2M Magnus acrylic glossy white cover frame', category: 'Switches & Sockets', price: 336, discountPrice: 336, stockQty: 100, sku: 'CP-MAG-2M-ACR-WHT', images: [] },
  { name: '4M Combined Plate Magnus Matt Grey', description: '4M Magnus matt grey cover frame', category: 'Switches & Sockets', price: 251, discountPrice: 251, stockQty: 110, sku: 'CP-MAG-4M-MATT-GREY', images: [] },
  { name: '6M Combined Plate Magnus Matt Gold', description: '6M Magnus matt gold cover frame', category: 'Switches & Sockets', price: 343, discountPrice: 343, stockQty: 110, sku: 'CP-MAG-6M-MATT-GLD', images: [] },
  { name: '6M Combined Plate Magnus ACR Glossy Black', description: '6M Magnus acrylic glossy black cover frame', category: 'Switches & Sockets', price: 664, discountPrice: 664, stockQty: 90, sku: 'CP-MAG-6M-ACR-BLK', images: [] },
  { name: '6M Combined Plate Magnus Acrylic Walnut Wood', description: '6M Magnus acrylic walnut wood cover frame', category: 'Switches & Sockets', price: 684, discountPrice: 684, stockQty: 90, sku: 'CP-MAG-6M-ACR-WAL', images: [] },
  { name: '6M Combined Plate Magnus Matt Grey', description: '6M Magnus matt grey cover frame', category: 'Switches & Sockets', price: 343, discountPrice: 343, stockQty: 110, sku: 'CP-MAG-6M-MATT-GREY', images: [] },
  
  // Wires & Cables - Basic
  { name: '1 sq mm Copper Wire', description: 'High-quality copper wire for domestic wiring', category: 'Wires & Cables', price: 15, discountPrice: 12, stockQty: 500, sku: 'WC-1SQMM-CU', images: [] },
  { name: '1.5 sq mm Copper Wire', description: 'Standard copper wire for general electrical use', category: 'Wires & Cables', price: 22, discountPrice: 18, stockQty: 400, sku: 'WC-1.5SQMM-CU', images: [] },
  { name: '2.5 sq mm Copper Wire', description: 'Heavy duty wire for power circuits', category: 'Wires & Cables', price: 38, discountPrice: 30, stockQty: 350, sku: 'WC-2.5SQMM-CU', images: [] },
  { name: 'Service Wire 6 sq mm', description: 'Weather-resistant service entrance wire', category: 'Wires & Cables', price: 45, discountPrice: 35, stockQty: 200, sku: 'WC-SVC-6SQMM', images: [] },
  { name: 'Cat6 LAN Cable', description: 'High-speed ethernet cable for networking', category: 'Wires & Cables', price: 14, discountPrice: 10, stockQty: 600, sku: 'WC-CAT6-LAN', images: [] },
  { name: '1 sq mm Flexible Wire', description: 'Flexible copper wire for easy installation', category: 'Wires & Cables', price: 16, discountPrice: 13, stockQty: 450, sku: 'WC-1SQMM-FLEX', images: [] },
  { name: '1.5 sq mm FR Wire', description: 'Fire-resistant wire for safety applications', category: 'Wires & Cables', price: 25, discountPrice: 20, stockQty: 300, sku: 'WC-1.5SQMM-FR', images: [] },
  { name: 'Cat5e LAN Cable', description: 'Reliable ethernet cable for networking', category: 'Wires & Cables', price: 12, discountPrice: 8, stockQty: 700, sku: 'WC-CAT5E-LAN', images: [] },
  { name: 'Service Wire 10 sq mm', description: 'Heavy-duty service wire for main supply', category: 'Wires & Cables', price: 50, discountPrice: 40, stockQty: 150, sku: 'WC-SVC-10SQMM', images: [] },
  { name: '2.5 sq mm FRLS Wire', description: 'Fire retardant low smoke wire', category: 'Wires & Cables', price: 40, discountPrice: 32, stockQty: 250, sku: 'WC-2.5SQMM-FRLS', images: [] },
  
  // Wires & Cables - Havells & Polycab (with actual image URLs)
  { name: 'Life Line Plus S3 HRFR Cables 1.0 sq. mm 90 m', description: 'Available in black, blue, grey, green, white, yellow and red', category: 'Wires & Cables', price: 3075, discountPrice: 3075, stockQty: 150, sku: 'WC-HAV-LLP-1SQMM-90M', images: ['https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/Flexible-Cables/WHFFDNKA1X50.jpg'] },
  { name: 'Lifeline FR 1.0 sq. mm 180 m', description: 'Available in Red, black, blue, yellow', category: 'Wires & Cables', price: 5005, discountPrice: 5005, stockQty: 120, sku: 'WC-HAV-LF-1SQMM-180M', images: ['https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/l/i/lifeline_fr_red_7.jpg'] },
  { name: 'Life Guard FR-LSH 1.0 sq. mm Cables 90 m', description: 'Available in black, blue, green, yellow and red', category: 'Wires & Cables', price: 3170, discountPrice: 3170, stockQty: 140, sku: 'WC-HAV-LG-1SQMM-90M', images: ['https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_guard/90m/black.jpg'] },
  { name: 'Life Shield HFFR 1.0 sq. mm Cables 90 m', description: 'Available in black, blue, green, yellow and red', category: 'Wires & Cables', price: 3225, discountPrice: 3225, stockQty: 130, sku: 'WC-HAV-LS-1SQMM-90M', images: ['https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_shield/90m/black.jpg'] },
  { name: 'POLYCABSUPREMA Electron Beam 90M - 1 sq.mm', description: 'Available in red, yellow, blue, black, green', category: 'Wires & Cables', price: 3400, discountPrice: 3400, stockQty: 125, sku: 'WC-POLY-SUP-1SQMM-90M', images: ['https://cms.polycab.com/media/ue4gllml/ldis09cyuaye001c006sb005s_img_01.jpg?format=webp'] },
  { name: 'Polycab Green Wire+ HR FR-LSH LF 90m - 1 sq.mm', description: 'Premium house wires with fire resistance', category: 'Wires & Cables', price: 3650, discountPrice: 3650, stockQty: 110, sku: 'WC-POLY-GRN-1SQMM-90M', images: ['https://cms.polycab.com/media/lohiqjqo/ldis09cyuayl001c004sb034s_img_01.png?format=webp'] },
  { name: 'Life Line Plus S3 HRFR Cables 1.5 sq. mm 90 m', description: 'Available in black, blue, grey, green, white, yellow and red', category: 'Wires & Cables', price: 4500, discountPrice: 4500, stockQty: 150, sku: 'WC-HAV-LLP-1.5SQMM-90M', images: ['https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/Flexible-Cables/WHFFDNKA1X50.jpg'] },
  { name: 'Lifeline FR 1.5 sq. mm 180 m', description: 'Available in Red, black, blue, yellow', category: 'Wires & Cables', price: 9475, discountPrice: 9475, stockQty: 100, sku: 'WC-HAV-LF-1.5SQMM-180M', images: ['https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/l/i/lifeline_fr_red_7.jpg'] },
  { name: 'Life Guard FR-LSH 1.5 sq. mm Cables 90 m', description: 'Available in black, blue, green, yellow and red', category: 'Wires & Cables', price: 4635, discountPrice: 4635, stockQty: 135, sku: 'WC-HAV-LG-1.5SQMM-90M', images: ['https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_guard/90m/black.jpg'] },
  { name: 'Life Shield HFFR 1.5 sq. mm Cables 90 m', description: 'Available in black, blue, green, yellow and red', category: 'Wires & Cables', price: 4725, discountPrice: 4725, stockQty: 128, sku: 'WC-HAV-LS-1.5SQMM-90M', images: ['https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_shield/90m/black.jpg'] },
  { name: 'POLYCABSUPREMA Electron Beam 90M - 1.5 sq.mm', description: 'Available in red, yellow, blue, black, green', category: 'Wires & Cables', price: 5000, discountPrice: 5000, stockQty: 120, sku: 'WC-POLY-SUP-1.5SQMM-90M', images: ['https://cms.polycab.com/media/ue4gllml/ldis09cyuaye001c006sb005s_img_01.jpg?format=webp'] },
  { name: 'Polycab Green Wire+ HR FR-LSH LF 90m - 1.5 sq.mm', description: 'Premium house wires with fire resistance', category: 'Wires & Cables', price: 5900, discountPrice: 5900, stockQty: 105, sku: 'WC-POLY-GRN-1.5SQMM-90M', images: ['https://cms.polycab.com/media/lohiqjqo/ldis09cyuayl001c004sb034s_img_01.png?format=webp'] },
  { name: 'Life Line Plus S3 HRFR Cables 2.5 sq. mm 90 m', description: 'Available in black, blue, grey, green, white, yellow and red', category: 'Wires & Cables', price: 7185, discountPrice: 7185, stockQty: 140, sku: 'WC-HAV-LLP-2.5SQMM-90M', images: ['https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/Flexible-Cables/WHFFDNKA1X50.jpg'] },
  { name: 'Lifeline FR 2.5 sq. mm 180 m', description: 'Available in Red, black, blue, yellow', category: 'Wires & Cables', price: 9475, discountPrice: 9475, stockQty: 95, sku: 'WC-HAV-LF-2.5SQMM-180M', images: ['https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/l/i/lifeline_fr_red_7.jpg'] },
  { name: 'Life Guard FR-LSH 2.5 sq. mm Cables 90 m', description: 'Available in black, blue, green, yellow and red', category: 'Wires & Cables', price: 7400, discountPrice: 7400, stockQty: 130, sku: 'WC-HAV-LG-2.5SQMM-90M', images: ['https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_guard/90m/black.jpg'] },
  { name: 'Life Shield HFFR 2.5 sq. mm Cables 90 m', description: 'Available in black, blue, green, yellow and red', category: 'Wires & Cables', price: 7540, discountPrice: 7540, stockQty: 125, sku: 'WC-HAV-LS-2.5SQMM-90M', images: ['https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_shield/90m/black.jpg'] },
  { name: 'POLYCABSUPREMA Electron Beam 90M - 2.5 sq.mm', description: 'Available in red, yellow, blue, black, green', category: 'Wires & Cables', price: 7900, discountPrice: 7900, stockQty: 115, sku: 'WC-POLY-SUP-2.5SQMM-90M', images: ['https://cms.polycab.com/media/ue4gllml/ldis09cyuaye001c006sb005s_img_01.jpg?format=webp'] },
  { name: 'Polycab Green Wire+ HR FR-LSH LF 90m - 2.5 sq.mm', description: 'Premium house wires with fire resistance', category: 'Wires & Cables', price: 9250, discountPrice: 9250, stockQty: 100, sku: 'WC-POLY-GRN-2.5SQMM-90M', images: ['https://cms.polycab.com/media/lohiqjqo/ldis09cyuayl001c004sb034s_img_01.png?format=webp'] },
  { name: 'Life Line Plus S3 HRFR Cables 4 sq. mm 90 m', description: 'Available in black, blue, grey, green, white, yellow and red', category: 'Wires & Cables', price: 10520, discountPrice: 10520, stockQty: 130, sku: 'WC-HAV-LLP-4SQMM-90M', images: ['https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/Flexible-Cables/WHFFDNKA1X50.jpg'] },
  { name: 'Lifeline FR 4 sq. mm 180 m', description: 'Available in Red, black, blue, yellow', category: 'Wires & Cables', price: 23435, discountPrice: 23435, stockQty: 90, sku: 'WC-HAV-LF-4SQMM-180M', images: ['https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/l/i/lifeline_fr_red_7.jpg'] },
  { name: 'Life Guard FR-LSH 4 sq. mm Cables 90 m', description: 'Available in black, blue, green, yellow and red', category: 'Wires & Cables', price: 10840, discountPrice: 10840, stockQty: 125, sku: 'WC-HAV-LG-4SQMM-90M', images: ['https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_guard/90m/black.jpg'] },
  { name: 'Life Shield HFFR 4 sq. mm Cables 90 m', description: 'Available in black, blue, green, yellow and red', category: 'Wires & Cables', price: 11050, discountPrice: 11050, stockQty: 120, sku: 'WC-HAV-LS-4SQMM-90M', images: ['https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_shield/90m/black.jpg'] },
  { name: 'POLYCABSUPREMA Electron Beam 90M - 4 sq.mm', description: 'Available in red, yellow, blue, black, green', category: 'Wires & Cables', price: 11500, discountPrice: 11500, stockQty: 110, sku: 'WC-POLY-SUP-4SQMM-90M', images: ['https://cms.polycab.com/media/ue4gllml/ldis09cyuaye001c006sb005s_img_01.jpg?format=webp'] },
  { name: 'Polycab Green Wire+ HR FR-LSH LF 90m - 4 sq.mm', description: 'Premium house wires with fire resistance', category: 'Wires & Cables', price: 12200, discountPrice: 12200, stockQty: 95, sku: 'WC-POLY-GRN-4SQMM-90M', images: ['https://cms.polycab.com/media/lohiqjqo/ldis09cyuayl001c004sb034s_img_01.png?format=webp'] },
  { name: 'Life Line Plus S3 HRFR Cables 6 sq. mm 90 m', description: 'Available in black, blue, grey, green, white, yellow and red', category: 'Wires & Cables', price: 13410, discountPrice: 13410, stockQty: 120, sku: 'WC-HAV-LLP-6SQMM-90M', images: ['https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/Flexible-Cables/WHFFDNKA1X50.jpg'] },
  { name: 'Lifeline FR 6 sq. mm 180 m', description: 'Available in Red, black, blue, yellow', category: 'Wires & Cables', price: 23435, discountPrice: 23435, stockQty: 85, sku: 'WC-HAV-LF-6SQMM-180M', images: ['https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/l/i/lifeline_fr_red_7.jpg'] },
  { name: 'Life Guard FR-LSH 6 sq. mm Cables 90 m', description: 'Available in black, blue, green, yellow and red', category: 'Wires & Cables', price: 16135, discountPrice: 16135, stockQty: 115, sku: 'WC-HAV-LG-6SQMM-90M', images: ['https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_guard/90m/black.jpg'] },
  { name: 'Life Shield HFFR 6 sq. mm Cables 90 m', description: 'Available in black, blue, green, yellow and red', category: 'Wires & Cables', price: 16450, discountPrice: 16450, stockQty: 110, sku: 'WC-HAV-LS-6SQMM-90M', images: ['https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/import/flexible_cables/life_shield/90m/black.jpg'] },
  { name: 'POLYCABSUPREMA Electron Beam 90M - 6 sq.mm', description: 'Available in red, yellow, blue, black, green', category: 'Wires & Cables', price: 17200, discountPrice: 17200, stockQty: 105, sku: 'WC-POLY-SUP-6SQMM-90M', images: ['https://cms.polycab.com/media/ue4gllml/ldis09cyuaye001c006sb005s_img_01.jpg?format=webp'] },
  { name: 'Polycab Green Wire+ HR FR-LSH LF 90m - 6 sq.mm', description: 'Premium house wires with fire resistance', category: 'Wires & Cables', price: 18400, discountPrice: 18400, stockQty: 90, sku: 'WC-POLY-GRN-6SQMM-90M', images: ['https://cms.polycab.com/media/lohiqjqo/ldis09cyuayl001c004sb034s_img_01.png?format=webp'] },
  
  // Lighting
  { name: 'LED Bulb 9W Cool White', description: 'Energy-efficient 9W LED bulb with cool white light', category: 'Lighting', price: 160, discountPrice: 120, stockQty: 200, sku: 'LED-9W-CW', images: ['https://via.placeholder.com/400x300?text=LED+Bulb+9W'] },
  { name: 'LED Bulb 9W Warm White', description: 'Warm white 9W LED bulb for cozy ambiance', category: 'Lighting', price: 150, discountPrice: 110, stockQty: 180, sku: 'LED-9W-WW', images: ['https://via.placeholder.com/400x300?text=LED+Bulb+9W+Warm'] },
  { name: 'LED Bulb 12W Cool White', description: 'Bright 12W LED bulb for larger spaces', category: 'Lighting', price: 210, discountPrice: 160, stockQty: 150, sku: 'LED-12W-CW', images: ['https://via.placeholder.com/400x300?text=LED+Bulb+12W'] },
  { name: 'LED Bulb 12W Daylight', description: 'Natural daylight 12W LED bulb', category: 'Lighting', price: 220, discountPrice: 170, stockQty: 140, sku: 'LED-12W-DL', images: ['https://via.placeholder.com/400x300?text=LED+Bulb+12W+Daylight'] },
  { name: 'LED Tube Light 18W', description: '4ft LED tube light for offices and homes', category: 'Lighting', price: 380, discountPrice: 280, stockQty: 100, sku: 'LED-TUBE-18W', images: ['https://via.placeholder.com/400x300?text=LED+Tube+18W'] },
  { name: 'LED Tube Light 22W', description: 'Bright 22W LED tube light', category: 'Lighting', price: 420, discountPrice: 320, stockQty: 90, sku: 'LED-TUBE-22W', images: ['https://via.placeholder.com/400x300?text=LED+Tube+22W'] },
  
  // LED Tube Lights - Philips Series
  { name: 'Philips Reserve Plus Inverter LED Batten 20W', description: 'Up to 4-hour power backup, 2600mAh long-lasting Li-Ion battery, Bright 100 lm/W light output, Sleek modern 3-feet design', category: 'Lighting', price: 920, discountPrice: 920, stockQty: 50, sku: 'LED-PHIL-RESERVE-20W', images: ['https://in.shop.lighting.philips.com/cdn/shop/files/productimage.jpg?v=1763541994'] },
  { name: 'Philips StarBright Wide LED Tube Light 20W', description: '20W high-brightness output, Cool Daylight illumination (CDL), Wide batten design for uniform lighting, Energy-efficient and long-lasting LED', category: 'Lighting', price: 750, discountPrice: 750, stockQty: 60, sku: 'LED-PHIL-STARBRIGHT-20W', images: ['https://in.shop.lighting.philips.com/cdn/shop/files/51MU12GJufL._SL1080.jpg?v=1763544929'] },
  { 
    name: 'Motion Sensing Step Dim Batten', 
    description: 'Auto ON/OFF with motion detection, Step dimming after 2 minutes, Fully switches off after 4 minutes of inactivity, Energy-saving, switch-free operation', 
    category: 'Lighting', 
    price: 320, 
    discountPrice: 320, 
    stockQty: 160, 
    sku: 'LED-PHIL-MOTION', 
    images: ['https://in.shop.lighting.philips.com/cdn/shop/files/Artboard_2_ff2161cf-1198-4945-9104-582ce08b0e9c.png?v=1747311404'],
    colorVariants: [
      { wattage: '10W', colorName: '10W', price: 320, stockQty: 80, sku: 'LED-PHIL-MOTION-10W', images: ['https://in.shop.lighting.philips.com/cdn/shop/files/Artboard_2_ff2161cf-1198-4945-9104-582ce08b0e9c.png?v=1747311404'] },
      { wattage: '20W', colorName: '20W', price: 450, stockQty: 80, sku: 'LED-PHIL-MOTION-20W', images: ['https://in.shop.lighting.philips.com/cdn/shop/files/Artboard_2_ff2161cf-1198-4945-9104-582ce08b0e9c.png?v=1747311404'] }
    ]
  },
  { 
    name: 'Philips Slimline Ultra LED Tube Light', 
    description: 'High-Efficiency LED – Delivers 100+ lumens per watt, Long-Lasting – 15,000-hour lifespan, Uniform & Comfortable Light – Premium diffuser minimizes glare and flicker, Sleek & Minimalist Design', 
    category: 'Lighting', 
    price: 300, 
    discountPrice: 300, 
    stockQty: 900, 
    sku: 'LED-PHIL-SLIM', 
    images: ['https://in.shop.lighting.philips.com/cdn/shop/files/PhilipsSlimlinUltraLEDTubelight.png?v=1747311591'],
    colorVariants: [
      { wattage: '5W', colorName: 'Cool Daylight', price: 300, stockQty: 100, sku: 'LED-PHIL-SLIM-5W-CDL', images: ['https://in.shop.lighting.philips.com/cdn/shop/files/PhilipsSlimlinUltraLEDTubelight.png?v=1747311591'] },
      { wattage: '5W', colorName: 'Natural Light', price: 300, stockQty: 100, sku: 'LED-PHIL-SLIM-5W-NL', images: ['https://in.shop.lighting.philips.com/cdn/shop/files/PhilipsSlimlinUltraLEDTubelight.png?v=1747311591'] },
      { wattage: '5W', colorName: 'Warm White', price: 300, stockQty: 100, sku: 'LED-PHIL-SLIM-5W-WW', images: ['https://in.shop.lighting.philips.com/cdn/shop/files/PhilipsSlimlinUltraLEDTubelight.png?v=1747311591'] },
      { wattage: '10W', colorName: 'Cool Daylight', price: 400, stockQty: 100, sku: 'LED-PHIL-SLIM-10W-CDL', images: ['https://in.shop.lighting.philips.com/cdn/shop/files/PhilipsSlimlinUltraLEDTubelight.png?v=1747311591'] },
      { wattage: '10W', colorName: 'Natural Light', price: 400, stockQty: 100, sku: 'LED-PHIL-SLIM-10W-NL', images: ['https://in.shop.lighting.philips.com/cdn/shop/files/PhilipsSlimlinUltraLEDTubelight.png?v=1747311591'] },
      { wattage: '10W', colorName: 'Warm White', price: 400, stockQty: 100, sku: 'LED-PHIL-SLIM-10W-WW', images: ['https://in.shop.lighting.philips.com/cdn/shop/files/PhilipsSlimlinUltraLEDTubelight.png?v=1747311591'] },
      { wattage: '20W', colorName: 'Cool Daylight', price: 450, stockQty: 100, sku: 'LED-PHIL-SLIM-20W-CDL', images: ['https://in.shop.lighting.philips.com/cdn/shop/files/PhilipsSlimlinUltraLEDTubelight.png?v=1747311591'] },
      { wattage: '20W', colorName: 'Natural Light', price: 450, stockQty: 100, sku: 'LED-PHIL-SLIM-20W-NL', images: ['https://in.shop.lighting.philips.com/cdn/shop/files/PhilipsSlimlinUltraLEDTubelight.png?v=1747311591'] },
      { wattage: '20W', colorName: 'Warm White', price: 450, stockQty: 100, sku: 'LED-PHIL-SLIM-20W-WW', images: ['https://in.shop.lighting.philips.com/cdn/shop/files/PhilipsSlimlinUltraLEDTubelight.png?v=1747311591'] }
    ]
  },
  { 
    name: 'Philips Slimline Super Bright LED Tube Light', 
    description: 'Energy Efficiency Champion – Reduces energy consumption by up to 50%, Optimal Light Distribution – Uniformly illuminates every corner, Wide Voltage Range – Works efficiently from 100-240VAC, Lightweight & Easy to Install', 
    category: 'Lighting', 
    price: 500, 
    discountPrice: 500, 
    stockQty: 480, 
    sku: 'LED-PHIL-SUPER', 
    images: ['https://in.shop.lighting.philips.com/cdn/shop/files/slimlinesuperbright-2.png?v=1747311653'],
    colorVariants: [
      { wattage: '25W', colorName: 'Cool Daylight', price: 500, stockQty: 80, sku: 'LED-PHIL-SUPER-25W-CDL', images: ['https://in.shop.lighting.philips.com/cdn/shop/files/slimlinesuperbright-2.png?v=1747311653'] },
      { wattage: '25W', colorName: 'Warm White', price: 500, stockQty: 80, sku: 'LED-PHIL-SUPER-25W-WW', images: ['https://in.shop.lighting.philips.com/cdn/shop/files/slimlinesuperbright-2.png?v=1747311653'] },
      { wattage: '30W', colorName: 'Cool Daylight', price: 600, stockQty: 80, sku: 'LED-PHIL-SUPER-30W-CDL', images: ['https://in.shop.lighting.philips.com/cdn/shop/files/slimlinesuperbright-2.png?v=1747311653'] },
      { wattage: '30W', colorName: 'Warm White', price: 600, stockQty: 80, sku: 'LED-PHIL-SUPER-30W-WW', images: ['https://in.shop.lighting.philips.com/cdn/shop/files/slimlinesuperbright-2.png?v=1747311653'] },
      { wattage: '36W', colorName: 'Cool Daylight', price: 750, stockQty: 80, sku: 'LED-PHIL-SUPER-36W-CDL', images: ['https://in.shop.lighting.philips.com/cdn/shop/files/slimlinesuperbright-2.png?v=1747311653'] },
      { wattage: '36W', colorName: 'Warm White', price: 750, stockQty: 80, sku: 'LED-PHIL-SUPER-36W-WW', images: ['https://in.shop.lighting.philips.com/cdn/shop/files/slimlinesuperbright-2.png?v=1747311653'] }
    ]
  },
  { name: 'Philips Blazeline Compact LED Tube Light 2ft', description: 'High brightness – 2000 lumens for well-lit spaces, Energy-efficient – 130 lumens per watt saves electricity, Modern mushroom-shaped design – adds a stylish touch, Wider light spread – superior diffuser ensures eye comfort', category: 'Lighting', price: 210, discountPrice: 210, stockQty: 100, sku: 'LED-PHIL-BLAZE-2FT', images: ['https://in.shop.lighting.philips.com/cdn/shop/files/PhilipsBlazelineCompactLEDTubelight.png?v=1747311654'] },
  { name: 'Philips Astra Line LED Tube Light 5W', description: 'Slim, elegant design, Wide voltage & 2kV surge protection, Flicker-free, eye-friendly lighting, Bright 450 lumen illumination', category: 'Lighting', price: 350, discountPrice: 350, stockQty: 90, sku: 'LED-PHIL-ASTRA-5W', images: ['https://in.shop.lighting.philips.com/cdn/shop/files/PhilipsAstraLineLEDTubelight.png?v=1747311660'] },
  { 
    name: 'Philips TwinGlow LED Tube Light 20W', 
    description: 'India\'s first up-down lighting, Two modes: Work & Relax, Durable polycarbonate body, Energy-efficient bright illumination', 
    category: 'Lighting', 
    price: 1499, 
    discountPrice: 1499, 
    stockQty: 120, 
    sku: 'LED-PHIL-TWIN-20W', 
    images: ['https://in.shop.lighting.philips.com/cdn/shop/files/3_a855c095-7505-4047-810a-9ce1d7eba276.png?v=1747311663'],
    colorVariants: [
      { wattage: '20W', colorName: 'Warm White + Cool Daylight', price: 1499, stockQty: 60, sku: 'LED-PHIL-TWIN-20W-WWCDL', images: ['https://in.shop.lighting.philips.com/cdn/shop/files/3_a855c095-7505-4047-810a-9ce1d7eba276.png?v=1747311663'] },
      { wattage: '20W', colorName: 'Aqua Blue + Cool Daylight', price: 1499, stockQty: 60, sku: 'LED-PHIL-TWIN-20W-ABCDL', images: ['https://in.shop.lighting.philips.com/cdn/shop/files/3_a855c095-7505-4047-810a-9ce1d7eba276.png?v=1747311663'] }
    ]
  },
  
  { name: 'LED Panel Light 18W Square', description: 'Slim square panel light for false ceilings', category: 'Lighting', price: 650, discountPrice: 450, stockQty: 80, sku: 'LED-PANEL-18W-SQ', images: ['https://via.placeholder.com/400x300?text=LED+Panel+18W'] },
  { name: 'LED Panel Light 24W Round', description: 'Round panel light with uniform illumination', category: 'Lighting', price: 700, discountPrice: 520, stockQty: 70, sku: 'LED-PANEL-24W-RND', images: ['https://via.placeholder.com/400x300?text=LED+Panel+24W'] },
  { name: 'LED Street Light 30W', description: 'Outdoor street light with high brightness', category: 'Lighting', price: 1600, discountPrice: 1200, stockQty: 40, sku: 'LED-STREET-30W', images: ['https://via.placeholder.com/400x300?text=LED+Street+30W'] },
  { name: 'LED Street Light 50W', description: 'High-power street light for main roads', category: 'Lighting', price: 2400, discountPrice: 1800, stockQty: 30, sku: 'LED-STREET-50W', images: ['https://via.placeholder.com/400x300?text=LED+Street+50W'] },
  { name: 'Rechargeable Emergency Light', description: 'Portable emergency light with long backup', category: 'Lighting', price: 750, discountPrice: 550, stockQty: 60, sku: 'LED-EMERG-RECH', images: ['https://via.placeholder.com/400x300?text=Emergency+Light'] },
  { name: 'LED Emergency Bulb 9W', description: 'Emergency bulb with auto power backup', category: 'Lighting', price: 600, discountPrice: 420, stockQty: 75, sku: 'LED-EMERG-9W', images: ['https://via.placeholder.com/400x300?text=Emergency+Bulb'] },
  
  // Fans
  { name: 'Ceiling Fan 1200mm', description: 'Energy-efficient ceiling fan with 5-star rating', category: 'Fans', price: 2300, discountPrice: 1800, stockQty: 120, sku: 'FAN-CEIL-1200MM', images: ['https://via.placeholder.com/400x300?text=Ceiling+Fan+1200mm'] },
  { name: 'Table Fan 400mm', description: 'Portable 3-speed table fan with oscillation', category: 'Fans', price: 1650, discountPrice: 1250, stockQty: 90, sku: 'FAN-TABLE-400MM', images: ['https://via.placeholder.com/400x300?text=Table+Fan+400mm'] },
  { name: 'Pedestal Fan 400mm', description: 'Height-adjustable pedestal fan with remote', category: 'Fans', price: 2600, discountPrice: 2100, stockQty: 80, sku: 'FAN-PED-400MM', images: ['https://via.placeholder.com/400x300?text=Pedestal+Fan'] },
  { name: 'Exhaust Fan 250mm', description: 'High-speed exhaust fan for kitchens and bathrooms', category: 'Fans', price: 1450, discountPrice: 1150, stockQty: 70, sku: 'FAN-EXH-250MM', images: ['https://via.placeholder.com/400x300?text=Exhaust+Fan'] },
  
  // MCB & Distribution
  { name: 'Single Pole MCB 16A', description: 'Reliable protection for residential circuits', category: 'MCB & Distribution', price: 190, discountPrice: 140, stockQty: 200, sku: 'MCB-SP-16A', images: ['https://via.placeholder.com/400x300?text=MCB+16A'] },
  { name: 'Double Pole MCB 32A', description: 'DP MCB for main line protection', category: 'MCB & Distribution', price: 420, discountPrice: 320, stockQty: 160, sku: 'MCB-DP-32A', images: ['https://via.placeholder.com/400x300?text=MCB+32A'] },
  { name: 'RCCB 40A 30mA', description: 'Residual current breaker for shock protection', category: 'MCB & Distribution', price: 1250, discountPrice: 950, stockQty: 110, sku: 'RCCB-40A-30MA', images: ['https://via.placeholder.com/400x300?text=RCCB+40A'] },
  { name: '8 Way DB Box', description: 'Double-door distribution board box', category: 'MCB & Distribution', price: 700, discountPrice: 520, stockQty: 130, sku: 'DB-8WAY', images: ['https://via.placeholder.com/400x300?text=DB+Box+8Way'] },
  
  // Electrical Accessories
  { name: 'Extension Board 4 Socket', description: 'Surge-protected extension board with 4 universal sockets', category: 'Electrical Accessories', price: 360, discountPrice: 280, stockQty: 220, sku: 'ACC-EXT-4SOCK', images: ['https://via.placeholder.com/400x300?text=Extension+Board'] },
  { name: 'Spike Guard 4 Socket', description: 'Spike guard with overload protection', category: 'Electrical Accessories', price: 480, discountPrice: 340, stockQty: 200, sku: 'ACC-SPIKE-4SOCK', images: ['https://via.placeholder.com/400x300?text=Spike+Guard'] },
  { name: 'Adapter Plug 3 Pin', description: 'Universal adapter plug for travel and home use', category: 'Electrical Accessories', price: 90, discountPrice: 65, stockQty: 500, sku: 'ACC-ADP-3PIN', images: ['https://via.placeholder.com/400x300?text=Adapter+Plug'] },
  { name: 'B22 Bulb Holder', description: 'Heat-resistant bulb holder for ceiling fittings', category: 'Electrical Accessories', price: 32, discountPrice: 22, stockQty: 600, sku: 'ACC-B22-HOLDER', images: ['https://via.placeholder.com/400x300?text=Bulb+Holder'] },
  { name: 'Insulation Tape (18mm)', description: 'Flame-retardant PVC insulation tape', category: 'Electrical Accessories', price: 14, discountPrice: 10, stockQty: 1000, sku: 'ACC-TAPE-18MM', images: ['https://via.placeholder.com/400x300?text=Insulation+Tape'] },
  { name: 'Cable Ties (100 pack)', description: 'Durable nylon cable ties for neat wiring', category: 'Electrical Accessories', price: 85, discountPrice: 60, stockQty: 800, sku: 'ACC-TIES-100PK', images: ['https://via.placeholder.com/400x300?text=Cable+Ties'] },
  { name: 'Conduit Pipe 10ft', description: 'Rigid PVC conduit pipe for safe wiring', category: 'Electrical Accessories', price: 80, discountPrice: 62, stockQty: 350, sku: 'ACC-CONDUIT-10FT', images: ['https://via.placeholder.com/400x300?text=Conduit+Pipe'] },
]

async function seedProducts() {
  try {
    console.log('🔄 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Clear existing products
    console.log('🗑️  Clearing existing products...')
    await Product.deleteMany({})
    console.log('✅ Cleared existing products')

    // Insert products
    console.log(`📦 Inserting ${products.length} products with images...`)
    const inserted = await Product.insertMany(products)
    console.log(`✅ Successfully inserted ${inserted.length} products!`)

    // Display summary
    const categories = {}
    const withImages = inserted.filter(p => p.images && p.images.length > 0).length
    
    inserted.forEach(p => {
      categories[p.category] = (categories[p.category] || 0) + 1
    })
    
    console.log('\n📊 Summary by Category:')
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count} products`)
    })
    console.log(`\n🖼️  Products with images: ${withImages}/${inserted.length}`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding products:', error)
    process.exit(1)
  }
}

seedProducts()
