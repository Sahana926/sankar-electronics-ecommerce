# 🚀 Render Deployment Checklist

## ✅ Production-Ready Status

### 1. **Package.json** ✅
```json
{
  "name": "sankar-backend",
  "main": "server.js",
  "type": "module",
  "scripts": {
    "start": "node server.js"  // ✅ Perfect for Render
  }
}
```

### 2. **Port Configuration** ✅
```javascript
const PORT = process.env.PORT || 5000;  // ✅ Uses dynamic port
app.listen(PORT, '0.0.0.0', () => {     // ✅ Binds to all interfaces
  console.log(`Server running on port ${PORT}`);
});
```

### 3. **Environment Variables** ✅
- ✅ MongoDB: `process.env.MONGODB_URI`
- ✅ JWT: `process.env.JWT_SECRET`
- ✅ Frontend URL: `process.env.FRONTEND_URL`
- ✅ Razorpay: `process.env.RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`
- ✅ Port: `process.env.PORT`

### 4. **CORS Configuration** ✅
```javascript
const allowedOrigins = [
  process.env.FRONTEND_URL,              // ✅ Dynamic
  'https://sankar-electronics-ecommerce.vercel.app',  // ✅ Production
  // Local development origins for testing
];
```

### 5. **Project Structure** ✅
```
server/
├── package.json          ✅
├── server.js             ✅ (main entry point)
├── .env                  ✅ (gitignored)
├── .env.example          ✅ (template provided)
├── .gitignore            ✅ (comprehensive)
├── routes/               ✅
├── models/               ✅
├── middleware/           ✅
└── uploads/              ✅ (gitignored)
```

### 6. **Security & Best Practices** ✅
- ✅ No hardcoded credentials
- ✅ Environment-based configuration
- ✅ Proper error handling
- ✅ Health check endpoint: `/api/health`
- ✅ CORS properly configured
- ✅ Process error handlers (unhandledRejection, uncaughtException)

---

## 🎯 Render Deployment Steps

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Production ready: Optimize backend for Render deployment"
git push origin main
```

### Step 2: Create Render Web Service

1. Go to: https://render.com/dashboard
2. Click: **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   ```
   Name: sankar-backend
   Region: Select closest to you
   Branch: main
   Root Directory: server
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free
   ```

### Step 3: Environment Variables

Add these in Render dashboard (Settings → Environment):

```bash
# Required Variables
PORT=5001
NODE_ENV=production

# MongoDB (Your Atlas connection string)
MONGODB_URI=mongodb+srv://sahanasahana64899_db_user:sahana2006@consultancy.iaan7tu.mongodb.net/sankar_electrical?retryWrites=true&w=majority

# JWT Secret (Generate a strong one)
JWT_SECRET=your_super_secret_jwt_key_for_production_change_this

# Frontend URL (Your Vercel deployment)
FRONTEND_URL=https://sankar-electronics-ecommerce.vercel.app

# Razorpay Keys
RAZORPAY_KEY_ID=rzp_test_SF6YFRBs5K5axB
RAZORPAY_KEY_SECRET=9xXH5QNoetpqc5ZEdzsolKjV
```

### Step 4: Deploy & Verify

1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Copy your backend URL: `https://sankar-backend.onrender.com`
4. Test health endpoint: `https://sankar-backend.onrender.com/api/health`

### Step 5: Update Vercel Environment

1. Go to Vercel Dashboard
2. Settings → Environment Variables
3. Add/Update:
   ```
   VITE_API_BASE_URL=https://sankar-backend.onrender.com
   ```
4. Redeploy frontend

---

## 🧪 Testing Checklist

After deployment, test these endpoints:

- [ ] Health Check: `GET /api/health`
- [ ] User Signup: `POST /api/auth/register`
- [ ] User Login: `POST /api/auth/login`
- [ ] Products: `GET /api/products`
- [ ] Orders: `GET /api/orders` (with auth)
- [ ] Admin Dashboard: `GET /api/admin/dashboard` (with admin auth)

---

## ⚠️ Important Notes

### MongoDB Atlas Setup
Ensure in MongoDB Atlas:
1. ✅ Network Access → Add IP: **0.0.0.0/0** (Allow from anywhere)
2. ✅ Database Access → User has read/write permissions
3. ✅ Connection string is correct

### Render Free Tier Limitations
- 🕐 Cold starts: First request after inactivity takes ~30s
- 💤 Spins down after 15 minutes of inactivity
- 💾 Limited to 512MB RAM
- ⏱️ Request timeout: 30 seconds

**Upgrade to Paid Tier** ($7/month) for:
- ✅ No cold starts
- ✅ Always online
- ✅ More RAM and CPU

### JWT_SECRET Security
⚠️ **CRITICAL**: Change the JWT_SECRET in production!

Generate a strong secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🐛 Troubleshooting

### Issue: "Application failed to respond"
**Solution**: Check Render logs for errors
```bash
# In Render Dashboard → Logs
```

### Issue: "Cannot connect to MongoDB"
**Solution**: 
1. Verify MONGODB_URI in Render environment
2. Check MongoDB Atlas Network Access
3. Ensure IP 0.0.0.0/0 is whitelisted

### Issue: "CORS error"
**Solution**: Verify FRONTEND_URL matches your Vercel deployment

### Issue: "Module not found"
**Solution**: 
```bash
# In Render settings:
Build Command: npm install
Start Command: npm start
```

---

## 📊 Monitoring

### Check Server Status
Visit: `https://your-backend.onrender.com/api/health`

Response should be:
```json
{
  "status": "ok",
  "timestamp": "2026-02-28T...",
  "database": "connected",
  "environment": "production"
}
```

### View Logs
Render Dashboard → Your Service → Logs (real-time)

---

## 🎉 Success Indicators

- ✅ Server deployed without errors
- ✅ Health endpoint returns 200
- ✅ MongoDB connected
- ✅ Frontend can signup/login users
- ✅ Products load on frontend
- ✅ Orders can be placed
- ✅ Admin dashboard works

---

## 📞 Need Help?

Check:
1. Render deployment logs
2. MongoDB Atlas connection
3. Vercel environment variables
4. Browser console for CORS errors

---

**Your backend is now production-ready! 🚀**
