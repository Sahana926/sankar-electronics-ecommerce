# Razorpay Payment Integration

## Setup Complete ✓

Your Razorpay payment link has been integrated into the checkout system.

### Payment Link
**URL:** `https://rzp.io/rzp/Sp1hS91`

### How It Works

1. **User clicks "Pay Now"** on the Checkout page
2. **Payment window opens** - User is redirected to your Razorpay hosted payment link
3. **User completes payment** - They enter UPI ID and complete the transaction
4. **Order is created automatically** - After returning from payment, the order is created with:
   - Payment status: `success`
   - Transaction ID from Razorpay
   - Delivery address
   - Order items

### Features

✅ **UPI Payments** - Customers can pay via UPI (Google Pay, PhonePe, BHIM, etc.)
✅ **Automatic Order Creation** - Order is created immediately after successful payment
✅ **Transaction Tracking** - Each payment has a unique transaction ID
✅ **COD Option** - Cash on Delivery still available as fallback
✅ **Mobile Responsive** - Works on all devices

### Payment Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Checkout Page                         │
│  - Select address                                           │
│  - Choose payment method (UPI or COD)                       │
│  - Click "Place Order"                                      │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │  UPI Selected?      │
         └────┬─────────┬──────┘
              │         │
         YES  │         │  NO (COD)
              ▼         ▼
         ┌────────────┐ ┌──────────────────┐
         │ Razorpay   │ │ Create Order     │
         │ Link Opens │ │ (pending status) │
         └─────┬──────┘ │                  │
               │        └────────┬─────────┘
               ▼                 │
         ┌──────────────┐        ▼
         │ User Pays    │    ┌─────────┐
         │ via UPI      │    │ Orders  │
         └──────┬───────┘    └─────────┘
                │
                ▼
         ┌──────────────────┐
         │ Payment Success  │
         │ (Return to app)  │
         └──────┬───────────┘
                │
                ▼
         ┌──────────────────┐
         │ Create Order     │
         │ (success status) │
         └──────┬───────────┘
                │
                ▼
         ┌──────────────────┐
         │ Show Confirmation│
         │ Redirect to      │
         │ Orders Page      │
         └──────────────────┘
```

### Integration Points

#### 1. **Checkout.jsx** (`src/pages/Checkout.jsx`)
- Razorpay link constant: Line 39
- Payment method selection: UPI or COD
- Order creation on return from payment

#### 2. **Backend** (`server/routes/payments.js`)
- Order creation endpoint
- Payment confirmation endpoint
- Payment verification

#### 3. **Orders Route** (`server/routes/orders.js`)
- Creates orders with payment details
- Stores transaction ID
- Stores payment status (success/pending)

### Testing the Payment Flow

#### Test UPI Payment:
1. Go to Checkout page
2. Select delivery address
3. Select "UPI" as payment method
4. Click "Place Order"
5. You'll be redirected to Razorpay payment link
6. Complete the payment using any UPI app
7. After payment, you'll return and order will be created

#### Test Cash on Delivery:
1. Go to Checkout page
2. Select delivery address
3. Select "Cash on Delivery" as payment method
4. Click "Place Order"
5. Order will be created immediately with pending status

### Order Status After Payment

**For UPI:**
```json
{
  "paymentMethod": "upi",
  "paymentStatus": "success",
  "transactionId": "RZP-1704067200000-a1b2c3d4",
  "items": [...],
  "totalAmount": 1299
}
```

**For COD:**
```json
{
  "paymentMethod": "cod",
  "paymentStatus": "pending",
  "transactionId": "COD-1704067200000",
  "items": [...],
  "totalAmount": 1299
}
```

### Admin Dashboard

Orders created from Razorpay payments will appear in the Admin Dashboard with:
- Payment status: "Success"
- Transaction ID
- All payment details

### Environment Variables

No additional environment variables needed for the hosted payment link. However, for full Razorpay integration, you can set:

```env
RAZORPAY_KEY_ID=your_key_id  (optional)
RAZORPAY_KEY_SECRET=your_key_secret  (optional)
```

### Support

If payment window doesn't open:
1. Check browser popup blocker settings
2. Ensure internet connection is working
3. Try a different browser
4. Fall back to Cash on Delivery option

### Notes

- The payment link is hosted on Razorpay servers
- All sensitive payment data is handled by Razorpay
- Your application never stores payment card/UPI details
- Payments are secured with industry-standard encryption
- Transaction IDs allow tracking of all payments
