
}# Use Case Diagram - Sankar Electrical and Hardwares E-Commerce Platform

## System Actors
1. **User** - Regular customer/shopper
2. **Admin** - Administrator managing products and inventory

---

## Use Case Diagram (ASCII)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    E-COMMERCE STORE SYSTEM                                  │
│                                                                             │
│    ┌────────────┐                    ┌──────────────────────────────────┐  │
│    │   USER     │                    │         SYSTEM                   │  │
│    └────────────┘                    │                                  │ 
│         │                            │  ┌──────────────────────────┐   │  │
│         │                            │  │   Authentication         │   │  │
│         ├─────────────────────────────├→ │  - Sign Up              │   │  │
│         │                            │  │  - Login                 │   │  │
│         │                            │  │  - Logout                │   │  │
│         │                            │  └──────────────────────────┘   │  │
│         │                            │                                  │  │
│         │                            │  ┌──────────────────────────┐   │  │
│         ├─────────────────────────────├→ │   Shopping Features      │   │  │
│         │                            │  │  - Browse Products       │   │  │
│         │                            │  │  - View Product Details  │   │  │
│         │                            │  │  - Search by Category    │   │  │
│         │                            │  │  - Filter & Sort         │   │  │
│         │                            │  └──────────────────────────┘   │  │
│         │                            │                                  │  │
│         │                            │  ┌──────────────────────────┐   │  │
│         ├─────────────────────────────├→ │   Cart & Wishlist        │   │  │
│         │                            │  │  - Add to Cart           │   │  │
│         │                            │  │  - Remove from Cart      │   │  │
│         │                            │  │  - Update Quantities     │   │  │
│         │                            │  │  - Add to Wishlist       │   │  │
│         │                            │  │  - Remove from Wishlist  │   │  │
│         │                            │  └──────────────────────────┘   │  │
│         │                            │                                  │  │
│         │                            │  ┌──────────────────────────┐   │  │
│         ├─────────────────────────────├→ │   Checkout & Payment     │   │  │
│         │                            │  │  - Manage Addresses      │   │  │
│         │                            │  │  - Review Order Summary  │   │  │
│         │                            │  │  - Select Payment Method │   │  │
│         │                            │  │  - Place Order           │   │  │
│         │                            │  │  - View Payment Status   │   │  │
│         │                            │  └──────────────────────────┘   │  │
│         │                            │                                  │  │
│         │                            │  ┌──────────────────────────┐   │  │
│         ├─────────────────────────────├→ │   Order Management       │   │  │
│         │                            │  │  - View Order History    │   │  │
│         │                            │  │  - Track Order Status    │   │  │
│         │                            │  │  - Cancel Order          │   │  │
│         │                            │  └──────────────────────────┘   │  │
│         │                            │                                  │  │
│         │                            │  ┌──────────────────────────┐   │  │
│         ├─────────────────────────────├→ │   User Profile           │   │  │
│         │                            │  │  - View Profile          │   │  │
│         │                            │  │  - Edit Profile Info     │   │  │
│         │                            │  │  - Upload Picture        │   │  │
│         │                            │  │  - View Contact History  │   │  │
│         │                            │  └──────────────────────────┘   │  │
│         │                            │                                  │  │
│         │                            │  ┌──────────────────────────┐   │  │
│         ├─────────────────────────────├→ │   Contact & Support      │   │  │
│         │                            │  │  - Submit Contact Form   │   │  │
│         │                            │  │  - Send Messages         │   │  │
│         │                            │  └──────────────────────────┘   │  │
│         │                            │                                  │  │
│    ┌────────────┐                    │  ┌──────────────────────────┐   │  │
│    │   ADMIN    │                    │  │   Admin Operations       │   │  │
│    └────────────┘                    │  │  - Login (Admin)         │   │  │
│         │                            │  │  - Access Admin Panel    │   │  │
│         │                            │  └──────────────────────────┘   │  │
│         │                            │                                  │  │
│         │                            │  ┌──────────────────────────┐   │  │
│         ├─────────────────────────────├→ │   Product Management     │   │  │
│         │                            │  │  - Create Product        │   │  │
│         │                            │  │  - Edit Product          │   │  │
│         │                            │  │  - Delete Product        │   │  │
│         │                            │  │  - Restore Product       │   │  │
│         │                            │  └──────────────────────────┘   │  │
│         │                            │                                  │  │
│         │                            │  ┌──────────────────────────┐   │  │
│         ├─────────────────────────────├→ │   Inventory Management   │   │  │
│         │                            │  │  - Manage Stock Levels   │   │  │
│         │                            │  │  - Track Stock Changes   │   │  │
│         │                            │  │  - Set Product Prices    │   │  │
│         │                            │  └──────────────────────────┘   │  │
│         │                            │                                  │  │
│         │                            │  ┌──────────────────────────┐   │  │
│         ├─────────────────────────────├→ │   Category Management    │   │  │
│         │                            │  │  - Create Category       │   │  │
│         │                            │  │  - Edit Category         │   │  │
│         │                            │  │  - Manage Subcategories  │   │  │
│         │                            │  └──────────────────────────┘   │  │
│         │                            │                                  │  │
│         │                            │  ┌──────────────────────────┐   │  │
│         ├─────────────────────────────├→ │   Order Management       │   │  │
│         │                            │  │  - View All Orders       │   │  │
│         │                            │  │  - Monitor Order Status  │   │  │
│         │                            │  │  - Manage Fulfillment    │   │  │
│         │                            │  └──────────────────────────┘   │  │
│         │                            │                                  │  │
│         │                            │  ┌──────────────────────────┐   │  │
│         ├─────────────────────────────├→ │   User Management        │   │  │
│         │                            │  │  - View All Users        │   │  │
│         │                            │  │  - View Login History    │   │  │
│         │                            │  │  - Monitor User Activity │   │  │
│         │                            │  └──────────────────────────┘   │  │
│         │                            │                                  │  │
│         │                            │  ┌──────────────────────────┐   │  │
│         ├─────────────────────────────├→ │   Reporting & Analytics  │   │  │
│         │                            │  │  - View Contact Messages │   │  │
│         │                            │  │  - Track User Activity   │   │  │
│         │                            │  │  - Generate Reports      │   │  │
│         │                            │  └──────────────────────────┘   │  │
│         │                            │                                  │  │
│         │                            │  ┌──────────────────────────┐   │  │
│         └─────────────────────────────→ │   Payment Processing     │   │  │
│                                      │  │  - Process Payments      │   │  │
│                                      │  │  - Handle Refunds        │   │  │
│                                      │  └──────────────────────────┘   │  │
│                                      └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Detailed Use Cases by Actor

### **USER USE CASES**

| # | Use Case | Description | Priority |
|---|----------|-------------|----------|
| U1 | Sign Up | Create new user account with email, password, and phone | High |
| U2 | Login | Authenticate with email and password | High |
| U3 | Logout | End user session | High |
| U4 | Browse Products | View all products with pagination | High |
| U5 | Search Products | Find products by name or keyword | High |
| U6 | Filter by Category | Browse products by category (Switches, Wires, etc.) | High |
| U7 | View Product Details | See detailed product information including price, stock, specs | High |
| U8 | Add to Cart | Add selected products with quantity to shopping cart | High |
| U9 | Update Cart Quantity | Modify item quantities in cart | High |
| U10 | Remove from Cart | Delete items from shopping cart | High |
| U11 | View Cart | Display all items in shopping cart with total price | High |
| U12 | Add to Wishlist | Save favorite products for later | High |
| U13 | Remove from Wishlist | Remove products from wishlist | High |
| U14 | View Wishlist | Display all saved favorite products | High |
| U15 | Manage Addresses | Add, edit, and select delivery addresses | High |
| U16 | Checkout | Review order and proceed to payment | High |
| U17 | Select Payment Method | Choose from UPI, Card, COD, or Wallet | High |
| U18 | Place Order | Complete purchase and create order | High |
| U19 | View Order History | See all past orders | High |
| U20 | Track Order Status | Monitor order progress and delivery | High |
| U21 | Cancel Order | Request order cancellation | Medium |
| U22 | View Profile | Access user account information | Medium |
| U23 | Edit Profile | Update personal information | Medium |
| U24 | Upload Profile Picture | Add profile photo | Medium |
| U25 | Submit Contact Form | Send inquiries to support team | Medium |

---

### **ADMIN USE CASES**

| # | Use Case | Description | Priority |
|---|----------|-------------|----------|
| A1 | Admin Login | Authenticate as admin with email and password | High |
| A2 | Access Admin Panel | Enter protected admin dashboard | High |
| A3 | Create Product | Add new product to catalog with details | High |
| A4 | Edit Product | Modify existing product information | High |
| A5 | Delete Product | Remove product from catalog (soft delete) | High |
| A6 | Restore Product | Recover deleted products | High |
| A7 | View All Products | List all products in system | High |
| A8 | Manage Stock Levels | Update product inventory quantity | High |
| A9 | Set Product Price | Configure product pricing | High |
| A10 | Manage Categories | Create and edit product categories | High |
| A11 | Manage Subcategories | Organize products into subcategories | High |
| A12 | View All Orders | Monitor all customer orders | High |
| A13 | Track Order Status | Check order fulfillment progress | Medium |
| A14 | Manage Fulfillment | Update order shipping and delivery status | Medium |
| A15 | View All Users | List all registered users in system | High |
| A16 | View Login History | Track user login activity and patterns | High |
| A17 | Monitor User Activity | See user interactions on platform | Medium |
| A18 | View Contact Messages | Read customer inquiries and messages | High |
| A19 | Respond to Contacts | Reply to customer messages | Medium |
| A20 | Generate Reports | Analyze sales, user, and activity data | Medium |
| A21 | Bulk Upload Products | Import multiple products at once | Medium |
| A22 | Configure Payment | Set up payment gateway (Razorpay) | High |
| A23 | Process Refunds | Handle payment refunds for cancelled orders | Medium |

---

## Key Features by Actor

### **User Features**
- ✅ Authentication (Signup/Login/Logout)
- ✅ Product Discovery (Browse, Search, Filter by 6+ categories)
- ✅ Shopping Cart (Add, Update, Remove)
- ✅ Wishlist Management (Save, View, Remove)
- ✅ Checkout Experience (Address selection, payment options)
- ✅ Order Management (Place, Track, Cancel orders)
- ✅ User Profile (Edit, Upload picture)
- ✅ Contact Support (Submit inquiries)

### **Admin Features**
- ✅ Restricted Admin Authentication
- ✅ Complete Product CRUD (Create, Read, Update, Delete)
- ✅ Inventory Management (Stock control)
- ✅ Category Management (6+ product categories + subcategories)
- ✅ Order Monitoring & Fulfillment
- ✅ User Management & Activity Tracking
- ✅ Login History Monitoring
- ✅ Customer Contact Message Management
- ✅ Bulk Product Upload
- ✅ Reporting & Analytics

---

## System Constraints

1. **Authentication**: 
   - Users must have valid credentials (email + password with special characters)
   - Admin access restricted by role verification

2. **Authorization**:
   - Admin routes protected with JWT tokens
   - `requireAdmin` middleware checks user role

3. **Data Validation**:
   - Password: Minimum 8 characters, must contain letter, number, special character
   - Email: Valid format required
   - Phone: 10-digit number for users

4. **Data Persistence**:
   - All data stored in MongoDB database named `store`
   - Cart, wishlist, orders linked to user ID
   - Data persists across login/logout sessions

---

## Technology Stack

- **Frontend**: React (JavaScript) with Vite
- **Backend**: Express.js (Node.js)
- **Database**: MongoDB
- **Payment**: Razorpay integration
- **Authentication**: JWT (JSON Web Tokens)
