# 🔐 Razorpay API Keys Setup

## Quick Setup (5 Minutes)

### Step 1: Create Razorpay Account
1. Go to https://razorpay.com/
2. Click **Sign Up** (top right)
3. Fill in:
   - Email
   - Password
   - Business name (e.g., "Sankar Electrical")
4. Verify your email

### Step 2: Get Test API Keys
1. Login to Razorpay Dashboard
2. Go to **Settings** → **API Keys**
   - Or direct link: https://dashboard.razorpay.com/app/website-app-settings/api-keys
3. Click **Generate Test Key** (if not already generated)
4. You'll see two keys:
   - **Key ID**: `rzp_test_xxxxxxxxxxxxx` (starts with `rzp_test_`)
   - **Key Secret**: `xxxxxxxxxxxxxxxxxx` (click "Show" to reveal)

### Step 3: Add Keys to .env File
1. Open `server/.env` file
2. Replace the placeholder values:
   ```env
   RAZORPAY_KEY_ID=rzp_test_YOUR_ACTUAL_KEY_ID_HERE
   RAZORPAY_KEY_SECRET=YOUR_ACTUAL_SECRET_KEY_HERE
   ```
3. Save the file

### Step 4: Restart Server
```bash
# Stop the server (Ctrl+C)
# Start again
cd server
npm start
```

### Step 5: Test Payment
1. Go to checkout page
2. Verify UPI ID
3. Click "Pay ₹249"
4. Razorpay modal will open
5. Use test UPI ID or test card for testing

---

## 🧪 Test Mode Details

### Test UPI IDs (Razorpay Sandbox)
- **Success**: Use any valid UPI format (e.g., `test@paytm`)
- In test mode, no real money is charged
- You can simulate success/failure scenarios

### Test Cards for Razorpay
| Card Number | Result |
|-------------|--------|
| 4111 1111 1111 1111 | Success |
| 4012 0000 3333 0026 | Success with 3DS |
| 5104 0600 0000 0008 | Insufficient Funds |

**CVV**: Any 3 digits  
**Expiry**: Any future date

---

## ✅ Verification Checklist

After adding keys:
- [ ] Server starts without errors
- [ ] No "UPI payments not configured" error
- [ ] Razorpay modal opens when clicking Pay button
- [ ] Can select UPI/Card payment methods in modal
- [ ] Test payment completes successfully
- [ ] Order appears in Orders page after payment

---

## 🚀 Going Live (Production)

When ready for real payments:
1. Complete KYC verification on Razorpay
2. Switch to **Live Mode** in dashboard
3. Generate **Live API Keys** (starts with `rzp_live_`)
4. Update .env with live keys
5. Test thoroughly before going live

---

## 🔒 Security Notes

- ✅ Never commit .env file to GitHub
- ✅ .env is already in .gitignore
- ✅ Never share your Secret Key
- ✅ Only Key ID is used in frontend
- ✅ Secret Key stays on server only

---

## ❓ Troubleshooting

### "UPI payments not configured" error
- Check if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set in .env
- Make sure there are no extra spaces
- Restart the server after editing .env

### Razorpay modal doesn't open
- Check browser console for errors
- Verify internet connection
- Make sure Key ID starts with `rzp_test_` or `rzp_live_`

### Payment verification fails
- Verify RAZORPAY_KEY_SECRET is correct
- Check server logs for errors
- Ensure you're using matching test/live keys

---

## 📞 Support

- Razorpay Docs: https://razorpay.com/docs/
- API Reference: https://razorpay.com/docs/api/
- Support: support@razorpay.com
