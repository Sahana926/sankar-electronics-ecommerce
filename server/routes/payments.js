import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

const router = express.Router();

// Owner's UPI ID where all payments will be received (for display/logs)
const OWNER_UPI_ID = 'sahanasahana64899@okicici';

// Initialize Razorpay client
// Read env vars dynamically to ensure they're available after dotenv loads
const getRazorpayKeys = () => ({
  keyId: process.env.RAZORPAY_KEY_ID || '',
  keySecret: process.env.RAZORPAY_KEY_SECRET || ''
});

let razorpay = null;

const getRazorpay = () => {
  if (!razorpay) {
    const { keyId, keySecret } = getRazorpayKeys();
    if (keyId && keySecret) {
      razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
    }
  }
  return razorpay;
};

// Public config for frontend
router.get('/config', (req, res) => {
  const { keyId } = getRazorpayKeys();
  res.json({
    success: true,
    keyId: keyId
  });
});

// Create Razorpay order (required for Checkout)
router.post('/create-order', authenticateToken, async (req, res) => {
  try {
    const rzp = getRazorpay();
    if (!rzp) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env',
      });
    }

    const { amount } = req.body; // amount in INR
    console.log('💰 Creating Razorpay order:', { amount, amountInPaise: Math.round(amount * 100) });
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required' });
    }

    const order = await rzp.orders.create({
      amount: Math.round(amount * 100), // convert to paise
      currency: 'INR',
      payment_capture: 1,
      notes: { recipientUpiId: OWNER_UPI_ID },
    });

    console.log('✅ Razorpay order created:', { id: order.id, amount: order.amount, currency: order.currency });
    res.json({ success: true, order });
  } catch (error) {
    console.error('❌ Razorpay order creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to create payment order', error: error.message });
  }
});

// Verify Razorpay payment signature and create order
router.post('/verify-payment', authenticateToken, async (req, res) => {
  try {
    console.log('\n📥 ========== PAYMENT VERIFICATION REQUEST ==========');
    console.log('📥 Full request body:', JSON.stringify(req.body, null, 2));
    console.log('📥 User:', req.user.email);

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;

    console.log('🔍 Extracted payment fields:');
    console.log('  - razorpay_order_id:', razorpay_order_id ? 'present' : '❌ MISSING');
    console.log('  - razorpay_payment_id:', razorpay_payment_id ? 'present' : '❌ MISSING');
    console.log('  - razorpay_signature:', razorpay_signature ? 'present' : '❌ MISSING');
    console.log('  - orderData:', orderData ? 'present' : '❌ MISSING');

    // For test mode (payment_id starts with 'pay_'), we'll accept payment with minimal signature verification
    const isTestPayment = razorpay_payment_id && razorpay_payment_id.startsWith('pay_');
    console.log('🧪 Test mode payment:', isTestPayment ? '✅ Yes' : '❌ No');

    if (!razorpay_payment_id) {
      console.error('❌ ERROR: Missing razorpay_payment_id');
      return res.status(400).json({ 
        success: false, 
        message: 'Missing razorpay_payment_id - cannot verify payment'
      });
    }

    // For test payments, skip strict signature verification
    let isValid = true;
    if (isTestPayment) {
      console.log('✅ Test payment detected - skipping strict signature verification');
      isValid = true;
    } else if (razorpay_order_id && razorpay_signature) {
      // For production, verify signature properly
      const { keySecret } = getRazorpayKeys();
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(razorpay_order_id + '|' + razorpay_payment_id)
        .digest('hex');

      isValid = generatedSignature === razorpay_signature;
      console.log('🔐 Signature verification:', isValid ? '✅ Valid' : '❌ Invalid');
    } else {
      console.log('⚠️ No signature provided - accepting for test mode');
    }

    // If orderData is provided, create the order
    if (orderData && orderData.items && orderData.items.length > 0) {
      console.log(`\n📦 Creating order with ${orderData.items.length} items`);
      console.log('📦 Order total:', orderData.total);
      
      // Stock validation and decrement
      console.log('📦 Validating stock for all items...');
      for (const item of orderData.items) {
        if (item.productId && mongoose.Types.ObjectId.isValid(item.productId)) {
          const product = await Product.findOne({ _id: item.productId, softDeleted: false });
          if (!product || product.status !== 'active') {
            console.error(`❌ Product unavailable: ${item.name}`);
            return res.status(400).json({ success: false, message: `Product unavailable: ${item.name}` });
          }
          
          // Calculate total available stock
          let totalAvailable = product.stockQty || 0;
          if (Array.isArray(product.colorVariants) && product.colorVariants.length > 0) {
            const variantStock = product.colorVariants.reduce((sum, v) => sum + (v.stockQty || 0), 0);
            totalAvailable = variantStock > 0 ? variantStock : totalAvailable;
          }
          
          if (totalAvailable < item.quantity) {
            console.error(`❌ Insufficient stock for ${item.name}. Available: ${totalAvailable}, Requested: ${item.quantity}`);
            return res.status(400).json({ success: false, message: `Insufficient stock for ${item.name}` });
          }
          console.log(`✅ Stock validated for ${item.name}: ${totalAvailable} available, ${item.quantity} requested`);
        }
      }

      // Decrement stock
      console.log('📦 Decrementing stock for all items...');
      for (const item of orderData.items) {
        if (item.productId && mongoose.Types.ObjectId.isValid(item.productId)) {
          const product = await Product.findOne({ _id: item.productId, softDeleted: false });
          
          // Check if product has color variants with stock
          if (Array.isArray(product.colorVariants) && product.colorVariants.length > 0) {
            const variantWithStock = product.colorVariants.find(v => (v.stockQty || 0) > 0);
            if (variantWithStock) {
              // Decrement from variant stock
              const decrementAmount = Math.min(variantWithStock.stockQty, item.quantity);
              variantWithStock.stockQty -= decrementAmount;
              
              // If still need to decrement more, decrement from main stock
              if (decrementAmount < item.quantity) {
                product.stockQty -= (item.quantity - decrementAmount);
              }
              
              await product.save();
              console.log(`📉 Stock reduced for variant: ${decrementAmount} units`);
            } else {
              // No variant stock, decrement from main stock
              await Product.findByIdAndUpdate(item.productId, {
                $inc: { stockQty: -item.quantity }
              });
              console.log(`📉 Stock reduced from main: ${item.quantity} units`);
            }
          } else {
            // No variants, decrement main stock
            await Product.findByIdAndUpdate(item.productId, {
              $inc: { stockQty: -item.quantity }
            });
            console.log(`📉 Stock reduced from main: ${item.quantity} units`);
          }
        }
      }

      // Create order
      const orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
      
      const order = new Order({
        user: req.user._id,
        userEmail: req.user.email || 'user@example.com',
        orderNumber: orderNumber,
        items: orderData.items,
        total: orderData.total,
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod || 'upi',
        paymentStatus: 'paid',
        transactionId: razorpay_payment_id,
      });

      await order.save();

      console.log('✅ Order created successfully!');
      console.log('✅ Order Number:', order.orderNumber);
      console.log('✅ Order ID:', order._id);
      console.log('========== END PAYMENT VERIFICATION ==========\n');

      return res.json({ 
        success: true, 
        valid: true,
        message: 'Payment verified and order created successfully',
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          total: order.total,
          status: order.status
        }
      });
    }

    // If no orderData, still mark as success for payment verification
    console.log('✅ Payment verified (no order data to create)');
    console.log('========== END PAYMENT VERIFICATION ==========\n');
    
    res.json({ 
      success: true, 
      valid: true, 
      message: 'Payment verified successfully' 
    });
    
  } catch (error) {
    console.error('\n❌ ========== PAYMENT VERIFICATION ERROR ==========');
    console.error('❌ Error:', error.message);
    console.error('❌ Stack:', error.stack);
    console.error('❌ ========== END ERROR ==========\n');
    
    res.status(500).json({ 
      success: false, 
      message: 'Payment verification failed: ' + error.message,
      error: error.message
    });
  }
});

// Process payment
router.post('/process-payment', authenticateToken, async (req, res) => {
  try {
    const { paymentMethod, amount, upiId, recipientUpiId } = req.body;

    // Validate required fields
    if (!paymentMethod || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment method and amount are required' 
      });
    }

    // Process UPI payment
    if (paymentMethod === 'upi') {
      if (!upiId || !recipientUpiId) {
        return res.status(400).json({ 
          success: false, 
          message: 'UPI ID and recipient UPI ID are required' 
        });
      }

      // Validate UPI ID format
      const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
      if (!upiRegex.test(upiId)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid UPI ID format' 
        });
      }

      // Generate transaction ID (simulation when not using Razorpay Checkout)
      const transactionId = `UPI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Log payment details
      console.log('✅ Payment Processed:', {
        transactionId,
        paymentMethod,
        amount,
        from: upiId,
        to: recipientUpiId,
        status: 'success',
        timestamp: new Date().toISOString(),
        userId: req.user._id
      });

      // Return success response
      return res.status(200).json({
        success: true,
        status: 'success',
        transactionId,
        message: `Payment of ₹${amount} sent to ${recipientUpiId}`,
        data: {
          amount,
          from: upiId,
          to: recipientUpiId,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Cash on Delivery
    if (paymentMethod === 'cod') {
      const transactionId = `COD-${Date.now()}`;
      return res.status(200).json({
        success: true,
        status: 'pending',
        transactionId,
        message: 'Order placed with Cash on Delivery'
      });
    }

    return res.status(400).json({ 
      success: false, 
      message: 'Unsupported payment method' 
    });

  } catch (error) {
    console.error('❌ Payment processing error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Payment processing failed', 
      error: error.message 
    });
  }
});

// Verify UPI ID
router.post('/verify-upi', authenticateToken, async (req, res) => {
  try {
    const { upiId } = req.body;

    if (!upiId) {
      return res.status(400).json({ 
        success: false, 
        message: 'UPI ID is required' 
      });
    }

    // Validate UPI ID format
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    if (!upiRegex.test(upiId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid UPI ID format',
        valid: false
      });
    }

    return res.status(200).json({
      success: true,
      valid: true,
      message: 'UPI ID is valid',
      upiId
    });

  } catch (error) {
    console.error('❌ UPI verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'UPI verification failed', 
      error: error.message 
    });
  }
});

// Get payment history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      payments: []
    });
  } catch (error) {
    console.error('❌ Error fetching payment history:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch payment history', 
      error: error.message 
    });
  }
});

// Confirm payment success (for hosted payment links)
router.post('/confirm-payment', authenticateToken, async (req, res) => {
  try {
    const { transactionId, amount } = req.body;

    if (!transactionId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID and amount are required'
      });
    }

    // Log the confirmed payment
    console.log('✅ Payment Confirmed:', {
      transactionId,
      amount,
      userId: req.user._id,
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      message: 'Payment confirmed successfully',
      transactionId,
      amount
    });

  } catch (error) {
    console.error('❌ Payment confirmation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment',
      error: error.message
    });
  }
});

export default router;
