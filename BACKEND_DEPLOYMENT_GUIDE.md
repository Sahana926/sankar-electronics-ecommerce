# Backend Deployment Guide

## 🚨 Current Issue
Your frontend on Vercel is trying to connect to `http://127.0.0.1:5001` (localhost), which doesn't work in production.

**Error**: "Failed to connect to server. Please try again."

---

## ✅ Solution: Deploy Backend to Render.com

### Step 1: Deploy Backend to Render (Free Tier)

1. **Go to**: https://render.com
2. **Sign in** with GitHub
3. **Click**: "New +" → "Web Service"
4. **Select**: Your repository `sankar-electronics-ecommerce`
5. **Configure**:
   ```
   Name: sankar-backend
   Region: Choose closest to you
   Branch: main
   Root Directory: server
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   ```

6. **Add Environment Variables**:
   Click "Advanced" → Add environment variables:
   ```
   PORT=5001
   MONGODB_URI=mongodb+srv://sahanasahana64899_db_user:sahana2006@consultancy.iaan7tu.mongodb.net/sankar_electrical?retryWrites=true&w=majority
   FRONTEND_URL=https://sankar-electronics-ecommerce.vercel.app
   RAZORPAY_KEY_ID=rzp_test_SF6YFRBs5K5axB
   RAZORPAY_KEY_SECRET=9xXH5QNoetpqc5ZEdzsolKjV
   ```

7. **Click**: "Create Web Service"
8. **Wait** for deployment (5-10 minutes)
9. **Copy** your backend URL (e.g., `https://sankar-backend.onrender.com`)

---

### Step 2: Update Vercel Environment Variable

1. **Go to**: https://vercel.com/dashboard
2. **Select**: Your project `sankar-electronics-ecommerce`
3. **Click**: Settings → Environment Variables
4. **Add**:
   ```
   Variable name: VITE_API_BASE_URL
   Value: https://sankar-backend.onrender.com
   Environment: Production, Preview, Development
   ```
5. **Click**: "Save"
6. **Redeploy**: Go to Deployments → Click "..." → Redeploy

---

### Step 3: Test

1. Visit: https://sankar-electronics-ecommerce.vercel.app/signup
2. Try signing up - it should work now! ✅

---

## 🎯 What This Fixes

✅ Backend is accessible from Vercel  
✅ API calls work in production  
✅ Signup, login, and all features work  
✅ CORS properly configured  

---

## 📝 Alternative: Deploy Backend to Railway

If you prefer Railway.app:

1. Go to: https://railway.app
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Configure:
   - Root directory: `server`
   - Start command: `npm start`
6. Add same environment variables
7. Copy the generated URL and update Vercel

---

## 🔧 Local Development

For local development, keep your local `.env`:
```
VITE_API_BASE_URL=http://127.0.0.1:5001
```

The fallback in the code will use localhost when VITE_API_BASE_URL is not set.

---

## ⚠️ Important Notes

- ✅ CORS is already configured for Vercel frontend
- ✅ Backend code is ready for deployment
- ⏱️ Render free tier: Cold starts (first request takes 30s)
- 💡 Upgrade to paid tier for instant response

---

## 🆘 Still Having Issues?

1. Check Render logs for errors
2. Verify environment variables are set correctly
3. Make sure MongoDB URI is correct
4. Check Vercel deployment logs
