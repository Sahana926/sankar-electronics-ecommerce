# UML Use Case Diagram - Sankar Electrical & Hardwares

This document contains the UML use case diagram for the e-commerce system.

## How to Render

### Option 1: Using PlantUML Online
1. Go to: https://www.plantuml.com/plantuml/uml/
2. Copy the content from `USE_CASE_DIAGRAM.puml`
3. Paste into the editor
4. The diagram will render automatically

### Option 2: Using VS Code
1. Install "PlantUML" extension (ID: jebbs.plantuml)
2. Open `USE_CASE_DIAGRAM.puml`
3. Right-click and select "Preview Diagram"

### Option 3: Using Local Tools
```bash
# Install plantuml
npm install -g plantuml

# Generate PNG
plantuml USE_CASE_DIAGRAM.puml -o output.png
```

---

## Use Case Diagram Structure

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  ┌─────────┐                                                    ┌─────────┐ │
│  │  Admin  │                    USE CASES                       │  User   │ │
│  └────┬────┘                       (Ovals)                     └────┬────┘ │
│       │                                                              │     │
│       │     ┌──────────────┐                                        │     │
│       ├────→│    Login     │←───────────────────────────────────────┤     │
│       │     └──────────────┘                                        │     │
│       │                                                              │     │
│       │     ┌──────────────────┐                                    │     │
│       ├────→│ Access Admin     │                                    │     │
│       │     │    Panel         │                                    │     │
│       │     └──────────────────┘                                    │     │
│       │                                                              │     │
│       │     ┌──────────────────┐     ┌──────────────────┐          │     │
│       ├────→│  Manage Products │     │ Browse Products  │←─────────┤     │
│       │     └──────────────────┘     └──────────────────┘          │     │
│       │                                                              │     │
│       │     ┌──────────────────┐     ┌──────────────────┐          │     │
│       ├────→│ Manage Inventory │     │ Search Products  │←─────────┤     │
│       │     └──────────────────┘     └──────────────────┘          │     │
│       │                                                              │     │
│       │     ┌──────────────────┐     ┌──────────────────┐          │     │
│       ├────→│ Manage Categories│     │View Product      │←─────────┤     │
│       │     └──────────────────┘     │    Details       │          │     │
│       │                              └──────────────────┘          │     │
│       │     ┌──────────────────┐                                    │     │
│       ├────→│ View All Orders  │                                    │     │
│       │     └──────────────────┘                                    │     │
│       │                                                              │     │
│       │     ┌──────────────────┐     ┌──────────────────┐          │     │
│       ├────→│ Process Order    │     │  Place Order     │←─────────┤     │
│       │     └──────────────────┘     └──────────────────┘          │     │
│       │                                                              │     │
│       │     ┌──────────────────┐     ┌──────────────────┐          │     │
│       ├────→│ Track Fulfillment│     │Track Order Status│←─────────┤     │
│       │     └──────────────────┘     └──────────────────┘          │     │
│       │                                                              │     │
│       │     ┌──────────────────┐     ┌──────────────────┐          │     │
│       ├────→│ View All Users   │     │  View Profile    │←─────────┤     │
│       │     └──────────────────┘     └──────────────────┘          │     │
│       │                                                              │     │
│       │     ┌──────────────────┐     ┌──────────────────┐          │     │
│       ├────→│ Login History    │     │  Edit Profile    │←─────────┤     │
│       │     └──────────────────┘     └──────────────────┘          │     │
│       │                                                              │     │
│       │     ┌──────────────────┐     ┌──────────────────┐          │     │
│       ├────→│ View Contact     │     │  Add to Cart     │←─────────┤     │
│       │     │   Messages       │     └──────────────────┘          │     │
│       │     └──────────────────┘                                    │     │
│       │                              ┌──────────────────┐          │     │
│       │                              │  Add to Wishlist │←─────────┤     │
│       │                              └──────────────────┘          │     │
│       │                                                              │     │
│       │                              ┌──────────────────┐          │     │
│       │                              │  View Cart       │←─────────┤     │
│       │                              └──────────────────┘          │     │
│       │                                                              │     │
│       │                              ┌──────────────────┐          │     │
│       │                              │  Checkout        │←─────────┤     │
│       │                              └──────────────────┘          │     │
│       │                                                              │     │
│       │                              ┌──────────────────┐          │     │
│       │                              │  View Orders     │←─────────┤     │
│       │                              └──────────────────┘          │     │
│       │                                                              │     │
│       │                              ┌──────────────────┐          │     │
│       └─────────────────────────────→│  Submit Contact  │←─────────┤     │
│                                      │     Form         │          │     │
│                                      └──────────────────┘          │     │
│                                                                      │     │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Actor: Admin

**Admin-Only Use Cases:**
- Login (Admin authentication)
- Access Admin Panel
- Manage Products (Create, Edit, Delete, Restore)
- Manage Inventory (Stock levels, Pricing)
- Manage Categories (Create, Edit Categories)
- View All Orders
- Process Order (Handle fulfillment)
- Track Fulfillment (Monitor delivery)
- View All Users
- View Login History
- Monitor User Activity
- View Contact Messages
- Bulk Upload Products
- Generate Reports
- Process Refunds

---

## Actor: User

**User-Only Use Cases:**
- Login (User authentication)
- Browse Products
- Search Products
- View Product Details
- Filter by Category
- Add to Cart
- Update Cart Quantity
- Remove from Cart
- View Cart
- Add to Wishlist
- Remove from Wishlist
- View Wishlist
- Manage Delivery Addresses
- Place Order
- Select Payment Method
- View Order History
- Track Order Status
- Cancel Order
- View Profile
- Edit Profile
- Upload Profile Picture
- Submit Contact Form

---

## Shared Use Cases

**Both Admin and User:**
- Login / Logout

---

## Included Use Cases (Dependencies)

The following show use cases that depend on others:

1. **Place Order** includes:
   - View Cart
   - Manage Addresses
   - Select Payment Method

2. **View Product Details** includes:
   - Add to Cart
   - Add to Wishlist

3. **Edit Product** (Admin) includes:
   - Manage Stock Levels

4. **Create Product** (Admin) includes:
   - Manage Categories

---

## Technology Stack (System Context)

```
┌─────────────────────────────────────────┐
│      Frontend: React (Vite)             │
│                                         │
│  - User Interface                       │
│  - Form Validation                      │
│  - Shopping Cart Management             │
│  - Order Placement                      │
│  - User Authentication (JWT)            │
└────────────────┬────────────────────────┘
                 │ API Calls (HTTP/REST)
┌────────────────▼────────────────────────┐
│    Backend: Express.js (Node.js)        │
│                                         │
│  - API Endpoints                        │
│  - Authentication Logic                 │
│  - Business Logic                       │
│  - Database Queries                     │
│  - Admin Authorization                  │
└────────────────┬────────────────────────┘
                 │ Database Queries
┌────────────────▼────────────────────────┐
│       Database: MongoDB                 │
│                                         │
│  - Users Collection                     │
│  - Products Collection                  │
│  - Orders Collection                    │
│  - Cart Collection                      │
│  - Wishlist Collection                  │
│  - Login History Collection             │
│  - Contact Messages Collection          │
└─────────────────────────────────────────┘
```

---

## Differences Between Actor Permissions

| Feature | User | Admin |
|---------|------|-------|
| **Authentication** | ✓ | ✓ |
| **Browse Products** | ✓ | - |
| **Shop/Order** | ✓ | - |
| **Manage Profile** | ✓ | Limited |
| **Create Products** | ✗ | ✓ |
| **Edit Products** | ✗ | ✓ |
| **Delete Products** | ✗ | ✓ |
| **Manage Inventory** | ✗ | ✓ |
| **View All Orders** | ✗ | ✓ |
| **View All Users** | ✗ | ✓ |
| **View Login History** | ✗ | ✓ |
| **Admin Panel Access** | ✗ | ✓ |

---

## Files to Reference

- **PlantUML Diagram**: [USE_CASE_DIAGRAM.puml](USE_CASE_DIAGRAM.puml)
- **Implementation**: See [README.md](README.md) for features
- **API Endpoints**: See [BACKEND_CONNECTION.md](BACKEND_CONNECTION.md)
- **Admin Features**: See [VALIDATION_REPORT.md](VALIDATION_REPORT.md)
