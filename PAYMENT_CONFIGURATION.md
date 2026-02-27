# Payment Configuration

## Owner UPI ID

**UPI ID for receiving payments:** `owner@paytm`

This is the UPI ID where all customer payments will be received.

## How to Update Owner UPI ID

### Frontend (Checkout.jsx)
```javascript
const OWNER_UPI_ID = 'owner@paytm' // Change this to your actual UPI ID
```

### Backend (server/routes/orders.js)
The payment processing happens in the backend. When a customer completes a UPI payment, the transaction details are logged showing payment sent to the owner's UPI ID.

## Payment Flow

1. **Customer enters UPI ID** - Customer enters their UPI ID on the checkout page
2. **UPI Verification** - The UPI ID format is validated
3. **Payment Processing** - When customer clicks "Pay ₹{amount}", the payment is processed
4. **Transaction Created** - A transaction ID is generated and logged
5. **Order Created** - Order is created with payment details and transaction ID
6. **Payment Confirmation** - Customer sees confirmation with transaction ID

## Payment Methods Supported

- ✅ **UPI** - Fully implemented with verification
- ⏳ **Credit/Debit Card** - Coming soon
- ✅ **Cash on Delivery** - Available
- ❌ **Wallet** - Not implemented yet
- ❌ **EMI** - Not implemented yet

## Real Payment Gateway Integration

To integrate with a real payment gateway (Razorpay, Paytm, PhonePe, etc.):

1. Sign up for a payment gateway account
2. Get API keys
3. Add keys to `.env` file:
   ```
   RAZORPAY_KEY_ID=your_key_id
   RAZORPAY_KEY_SECRET=your_key_secret
   ```
4. Install payment gateway SDK:
   ```bash
   npm install razorpay
   ```
5. Update `server/routes/orders.js` to use the payment gateway API
6. Update frontend to show payment gateway's checkout interface

## Testing Payments

Currently, the system simulates payment processing. To test:

1. Go to checkout page
2. Select UPI payment method
3. Enter any valid UPI ID format (e.g., `test@paytm`, `user@phonepe`)
4. Click "Verify"
5. Click "Pay ₹{amount}"
6. Check console logs to see payment details

## Security Notes

- Never expose payment gateway API keys in frontend code
- Always validate payment status on the backend
- Store transaction IDs for reference
- Implement webhook handlers for payment confirmations
- Use HTTPS in production

## Transaction Logs

Payment transactions are currently logged to console. In production:
- Store in database
- Send email confirmations
- Update order status based on payment status
- Implement refund handling
