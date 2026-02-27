import mongoose from 'mongoose';
import Product from './models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

async function testInventory() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://sankar64899:SankarPass123@cluster0.ur0vy.mongodb.net/sankar_electrical';
    await mongoose.connect(mongoUri);
    
    console.log('📊 Testing Inventory Calculation...\n');
    
    // Get all products
    const allProducts = await Product.find({ softDeleted: false }).select('name stockQty colorVariants category');
    
    console.log(`Total products: ${allProducts.length}\n`);
    
    // Calculate metrics
    let outOfStockCount = 0;
    let lowStockCount = 0;
    let inStockCount = 0;
    
    const outOfStockProducts = [];
    const lowStockProducts = [];
    
    allProducts.forEach(p => {
      const hasVariants = Array.isArray(p.colorVariants) && p.colorVariants.length > 0;
      const variantStock = hasVariants ? p.colorVariants.reduce((sum, v) => sum + (v.stockQty || 0), 0) : 0;
      const actualStock = hasVariants ? variantStock : (p.stockQty || 0);
      
      if (actualStock === 0) {
        outOfStockCount++;
        if (outOfStockProducts.length < 5) {
          outOfStockProducts.push({ 
            name: p.name, 
            stockQty: p.stockQty, 
            hasVariants, 
            variantCount: hasVariants ? p.colorVariants.length : 0,
            totalVariantStock: variantStock 
          });
        }
      } else if (actualStock > 0 && actualStock < 10) {
        lowStockCount++;
        if (lowStockProducts.length < 5) {
          lowStockProducts.push({ 
            name: p.name, 
            actualStock,
            stockQty: p.stockQty, 
            hasVariants, 
            variantCount: hasVariants ? p.colorVariants.length : 0
          });
        }
      } else if (actualStock >= 10) {
        inStockCount++;
      }
    });
    
    console.log('📈 Summary:');
    console.log(`  In Stock (≥10): ${inStockCount}`);
    console.log(`  Low Stock (1-9): ${lowStockCount}`);
    console.log(`  Out of Stock (0): ${outOfStockCount}\n`);
    
    if (outOfStockProducts.length > 0) {
      console.log('Out of Stock Products (sample):');
      outOfStockProducts.forEach(p => {
        console.log(`  - ${p.name}`);
        console.log(`    Main stock: ${p.stockQty}, Has variants: ${p.hasVariants}, Variant count: ${p.variantCount}, Total variant stock: ${p.totalVariantStock}`);
      });
    }
    
    if (lowStockProducts.length > 0) {
      console.log('\nLow Stock Products (sample):');
      lowStockProducts.forEach(p => {
        console.log(`  - ${p.name} (${p.actualStock} units)`);
        console.log(`    Main stock: ${p.stockQty}, Has variants: ${p.hasVariants}, Variant count: ${p.variantCount}`);
      });
    }
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

testInventory();
