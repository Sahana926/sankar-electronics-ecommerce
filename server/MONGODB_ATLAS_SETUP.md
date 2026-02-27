# MongoDB Atlas Migration Guide

## Quick Setup (3 Steps)

### Step 1: Create MongoDB Atlas Account & Get Connection String
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up (free tier available)
3. Create a cluster
4. Add your IP to Network Access (or use 0.0.0.0/0 for development)
5. Create a database user in Database Access
6. Click Connect → Copy connection string

### Step 2: Update Your .env File
Edit `/server/.env` and replace this line:
```
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER_NAME.mongodb.net/sankar_electrical?retryWrites=true&w=majority
```

Replace with your actual values:
- `USERNAME`: Your database user
- `PASSWORD`: Your database password
- `CLUSTER_NAME`: Your cluster name (e.g., `sankar-cluster-1`)

Example:
```
MONGODB_URI=mongodb+srv://admin:MyPassword123@sankar-cluster-1.mongodb.net/sankar_electrical?retryWrites=true&w=majority
```

### Step 3: Verify Connection
Run in `/server` directory:
```bash
node test-atlas-connection.js
```

✅ You should see: "Successfully connected to MongoDB Atlas!"

---

## Scripts Available

### Test Connection
```bash
cd server
node test-atlas-connection.js
```
Tests if your MongoDB Atlas connection is working properly.

### Migrate Data to Atlas
```bash
cd server
node migrate-to-atlas.js
```
Transfers data from local MongoDB to Atlas (if local data exists).

### Start Server
```bash
npm run dev
```
Starts your backend with MongoDB Atlas connection.

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Connection timeout | Add your IP to MongoDB Atlas Network Access |
| Authentication failed | Check username/password in connection string |
| Database not found | Ensure database name matches (sankar_electrical) |
| Cluster paused | Resume your cluster from MongoDB Atlas dashboard |

---

## File Structure
- `/server/.env` - Your environment variables (UPDATE THIS)
- `/server/.env.example` - Example configuration
- `/server/test-atlas-connection.js` - Connection test script
- `/server/migrate-to-atlas.js` - Data migration script
- `/server/server.js` - Main server (already configured)

---

## Next Steps After Connection
1. ✅ Update .env with MongoDB Atlas URI
2. ✅ Run test-atlas-connection.js
3. ✅ Run server with `npm run dev`
4. ✅ Your app is now using MongoDB Atlas!

---

## Environment Variables Reference
```bash
# MongoDB Atlas Connection String (REQUIRED)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# Server Port
PORT=5000

# Frontend URL
FRONTEND_URL=http://localhost:4000

# Razorpay Keys (for payments)
RAZORPAY_KEY_ID=your_key_here
RAZORPAY_KEY_SECRET=your_secret_here
```

---

## Security Tips
1. ⚠️ Never commit `.env` to git (already in .gitignore)
2. 🔐 Use strong passwords for MongoDB Atlas
3. 🔒 Don't share your MONGODB_URI with anyone
4. 🌐 Limit IP access to only your app servers

---

## Need Help?
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com/
- Mongoose Docs: https://mongoosejs.com/
- Check server logs: Look for connection messages when starting
