# Sankar Electrical and Hardwares - React Website

A modern React website for Sankar Electrical and Hardwares built with React Router, Vite, Express.js, and MongoDB.

## Features

- 🏠 **Home Page** - Beautiful hero section with product showcase
- 🛍️ **Shop Page** - Browse and add products to cart
- 📦 **Products Page** - View all available products
- 📞 **Contact Page** - Contact form with validation and MongoDB storage
- 🔐 **Login/Signup** - User authentication with password validation and MongoDB
- � **Shopping Cart** - Add/remove items, update quantities
- ❤️ **Wishlist** - Save favorite products
- 📋 **Orders Page** - View order history
- 👤 **User Profile** - Edit profile information with picture upload
- 🏪 **Category Pages** - Browse products by category:
  - Switches & Sockets
  - Wires & Cables
  - Lighting
  - Fans
  - MCB Distribution
  - Electrical Accessories
- 💳 **Checkout Page** - Flipkart-like checkout with:
  - Address management
  - Order summary with quantity controls
  - Payment method selection
  - Real-time price calculation
  - Discount and delivery fee display
- �📱 **Responsive Design** - Works on all devices
- ✅ **Form Validation** - Comprehensive validation for all forms
- 🔒 **Password Security** - Password must contain letter, number, and special character
- 🔄 **Auto Redirect** - Signup → Login, Login → Shop page

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (MongoDB Compass or MongoDB server)

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://127.0.0.1:4000`

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sankar-electrical
JWT_SECRET=your-secret-key-change-in-production
```

4. Make sure MongoDB is running:
   - Open MongoDB Compass
   - Connect to `mongodb://localhost:27017`
   - Or update `MONGODB_URI` in `.env` to your MongoDB connection string

5. Start the backend server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

### Running Both Servers

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd server
npm start
```

### Build for Production

**Frontend:**
```bash
npm run build
```

The built files will be in the `dist` directory.

**Backend:**
The backend server runs with `npm start` in production mode.

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── pages/
│   │   │   ├── Home.jsx              # Homepage
│   │   │   ├── Login.jsx             # Login page
│   │   │   ├── Signup.jsx            # Signup page
│   │   │   ├── Products.jsx          # Products listing page
│   │   │   ├── Contact.jsx           # Contact page
│   │   │   ├── Shop.jsx              # Shop page
│   │   │   ├── ProductDetail.jsx     # Product detail page
│   │   │   ├── Cart.jsx              # Shopping cart page
│   │   │   ├── Wishlist.jsx          # Wishlist page
│   │   │   ├── Orders.jsx            # Orders page
│   │   │   ├── Profile.jsx           # User profile page
│   │   │   ├── EditProfile.jsx       # Edit profile page
│   │   │   ├── Checkout.jsx          # Checkout page (NEW)
│   │   │   ├── Fans.jsx              # Fans category
│   │   │   ├── Lighting.jsx          # Lighting category
│   │   │   ├── SwitchesAndSockets.jsx # Switches & Sockets category
│   │   │   ├── WiresAndCables.jsx    # Wires & Cables category
│   │   │   ├── MCBDistribution.jsx   # MCB Distribution category
│   │   │   └── ElectricalAccessories.jsx # Electrical Accessories category
│   │   ├── styles/
│   │   │   ├── Checkout.css          # Checkout page styling (NEW)
│   │   │   └── ...                   # Other component styles
│   │   ├── Header.jsx                # Navigation header component
│   │   ├── App.jsx                   # Main app component with routing
│   │   ├── main.jsx                  # Entry point
│   │   └── index.css                 # Global styles
│   ├── index.html                    # HTML template
│   ├── package.json                  # Dependencies
│   └── vite.config.js                # Vite configuration
```

## 🛒 Checkout Page Features

The checkout page is designed similar to Flipkart with the following features:

### Checkout Sections (4-Step Process)
1. **Login Section** - Display logged-in user information
2. **Delivery Address** - Select/Add delivery address with validation
3. **Order Summary** - View items with quantity controls and remove option
4. **Payment Method** - Choose from UPI, Credit/Debit Card, COD, Wallet

### Price Breakdown
- Item price calculation
- Discount display
- Free delivery for orders above ₹500
- Total savings display
- Clear price breakdown

### Features
- ✅ Address management (view, select, add new)
- ✅ Real-time price calculations
- ✅ Quantity controls (+/−)
- ✅ Item removal
- ✅ Payment method selection
- ✅ Form validation
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Professional Flipkart-like UI

### How to Use
1. Click "BUY NOW" on any product
2. Review the checkout page sections
3. Select or add a delivery address
4. Adjust quantities if needed
5. Choose a payment method
6. Click "CONTINUE" to place order

For detailed information, see [CHECKOUT_QUICK_START.md](CHECKOUT_QUICK_START.md) or [CHECKOUT_IMPLEMENTATION.md](CHECKOUT_IMPLEMENTATION.md).

## Form Validation

### Signup Form
- Full Name: Required, minimum 2 characters
- Email: Required, valid email format
- Phone: Required, 10-digit number
- Password: Required, minimum 8 characters, must contain:
  - At least one letter (a-z, A-Z)
  - At least one number (0-9)
  - At least one special character (!@#$%^&*(),.?":{}|<>)
- Confirm Password: Must match password

### Login Form
- Email: Required, valid email format
- Password: Required, minimum 6 characters

### Contact Form
- Name: Required, minimum 2 characters
- Email: Required, valid email format
- Phone: Required, 10-digit number
- Message: Required, minimum 10 characters

## Technologies Used

### Frontend
- **React** - UI library
- **React Router DOM** - Client-side routing
- **Vite** - Build tool and dev server
- **CSS3** - Styling

### Backend
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **CORS** - Cross-origin resource sharing

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## License

This project is created for Sankar Electrical and Hardwares.

