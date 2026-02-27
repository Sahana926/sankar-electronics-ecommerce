# Product & System Status Guide 📋

## Product Status Meanings

### **Active** ✅
- **What it means:** Product is **available for purchase** on the user store
- **Where users see it:** Visible in `/shop`, search results, category pages
- **Visibility:** Searchable and browsable by customers
- **Operations allowed:** 
  - Can be added to cart
  - Can be ordered
  - Stock can be managed
  - Can be edited or deleted (soft delete)

**Example:**
```
Product: LED Bulb 10W
Status: Active ✅
- Users can see it in shop
- Users can add to cart and buy
- Admin can update stock
```

---

### **Inactive** ⏸️
- **What it means:** Product is **hidden/not available for purchase**
- **Where users see it:** NOT visible in shop, search, or categories
- **Visibility:** Hidden from customer view
- **Operations allowed:**
  - Cannot be ordered by customers
  - Still stored in database
  - Admin can reactivate anytime
  - Useful for temporary unavailability

**Example:**
```
Product: Vintage Switch
Status: Inactive ⏸️
- Users CANNOT see it
- Users CANNOT add to cart
- Product data is preserved
- Admin can reactivate later
```

---

## Stock Status Meanings

### **In Stock** 💚
- **Condition:** Stock quantity > 0
- **User sees:** "Add to Cart" button available
- **Color in dashboard:** Green
- **Meaning:** Product is available for immediate purchase

---

### **Low Stock** 🟡⚠️
- **Condition:** Stock quantity > 0 BUT less than 10 units
- **Appears in:** Low Stock Report (accessible from dashboard)
- **Color in dashboard:** Yellow/Amber warning
- **Action needed:** 
  - Admin should reorder soon
  - Prevents stockouts
  - Helps maintain supply continuity

**Examples of Low Stock:**
- 1 unit remaining
- 5 units remaining
- 9 units remaining

---

### **Out of Stock** ❌
- **Condition:** Stock quantity = 0
- **User sees:** "Out of Stock" message (no purchase button)
- **Appears in:** Out of Stock Report (accessible from dashboard)
- **Color in dashboard:** Red/Danger
- **Action needed:**
  - Urgent reordering required
  - Users cannot purchase
  - Best to notify for pre-orders (optional feature)

---

## Dashboard Status Indicators

### Product Status in Reports

```
┌─────────────────────────────────────┐
│ Product Status Colors & Meanings    │
├─────────────────────────────────────┤
│ 🟢 Active    = Available for purchase
│ 🔴 Inactive  = Hidden from users
│
│ Stock Levels:
│ 🟢 Green     = Healthy stock (10+)
│ 🟡 Amber     = Low stock (1-9)
│ 🔴 Red       = Out of stock (0)
└─────────────────────────────────────┘
```

---

## Order Status Meanings

### **Pending**
- Order placed but not yet processed
- Payment not confirmed yet
- Next step: Confirmation

### **Processing**
- Payment received ✅
- Order being prepared
- Admin preparing items for shipment

### **Confirmed**
- Order confirmed and ready
- Items picked and packed
- Next step: Shipment

### **Shipped**
- Order dispatched to delivery partner
- User can track delivery
- Next step: Delivery

### **Delivered**
- Order reached customer
- Delivery completed ✅
- Order fulfilled

### **Cancelled**
- Order cancelled by user or admin
- Refund may be initiated
- Final status

---

## Payment Status Meanings

### **Pending** 🕐
- Payment not yet initiated
- Awaiting user action
- No money deducted

### **Paid / Success** ✅
- Payment verified and successful
- Money received
- Order can be processed
- Stock automatically reduced

### **Failed** ❌
- Payment rejected/declined
- No money charged
- User can retry
- Stock NOT reduced

---

## How Stock Automatically Changes

### Stock Reduction Workflow:
```
Customer Completes Payment
    ↓
✅ Payment Verified (Status: Paid)
    ↓
📦 Validate Stock Available
    ↓
💾 Order Created in Database
    ↓
📉 Stock AUTOMATICALLY REDUCED by quantity ordered
    ↓
📊 Dashboard Metrics Update
```

### Example:
```
Before Order:
- Product: USB Cable
- Stock: 50 units
- Status: Active

Customer Orders: 2 units
Payment: Completed ✅

After Order:
- Product: USB Cable
- Stock: 48 units (50 - 2)
- Status: Still Active
- Order: Created successfully
```

---

## When Products Should Be Inactive

| Scenario | Action | Status |
|----------|--------|--------|
| Temporarily out of stock | Set to Inactive | ⏸️ Inactive |
| Supplier ran out | Set to Inactive | ⏸️ Inactive |
| Product discontinued | Soft Delete OR Set to Inactive | ❌ Deleted or ⏸️ Inactive |
| Seasonal product (off-season) | Set to Inactive | ⏸️ Inactive |
| Coming soon | Set to Inactive until ready | ⏸️ Inactive |
| Damaged/Defective lot | Reduce stock OR Set to Inactive | Adjust accordingly |

---

## Dashboard Reports & What They Show

### **Products Report**
- All products (Active + Inactive)
- Shows status of each product
- Stock levels
- Pricing info

### **Low Stock Report**
- Only products with 1-9 units
- Sorted by lowest stock first
- ⚠️ Warning: "Reorder soon"

### **Out of Stock Report**
- Only products with 0 units
- ❌ Red alert: "Urgent reordering needed"

### **Active vs Visible**
- **Active** = Status in database
- **Visible to users** = Active + Not soft-deleted

---

## Quick Reference Table

| Status | User Sees | Can Buy | Stock Changes | Dashboard |
|--------|-----------|---------|---------------|-----------|
| **Active + In Stock** | ✅ Yes | ✅ Yes | ✅ Auto reduced | 🟢 Green |
| **Active + Low Stock** | ✅ Yes | ✅ Yes | ✅ Auto reduced | 🟡 Amber |
| **Active + Out Stock** | ✅ Yes | ❌ No | N/A | ❌ Red |
| **Inactive** | ❌ No | ❌ No | N/A | ⏸️ Hidden |
| **Soft Deleted** | ❌ No | ❌ No | N/A | ❌ Removed |

---

## Common Questions

### Q: If I mark a product as Inactive, does it delete from database?
**A:** No. Inactive just hides it from users. Data remains in database. You can reactivate anytime.

### Q: When does stock automatically reduce?
**A:** Only when:
1. Customer completes payment ✅
2. Payment status = "Paid" ✅
3. Order is successfully created ✅

### Q: What if payment fails?
**A:** Stock does NOT reduce. No order created. Customer can try again.

### Q: Can admin manually adjust stock?
**A:** Yes, in Products/Inventory management page. Edit product and change stock quantity.

### Q: Can stock go negative?
**A:** No. System prevents selling more than available stock. You'll get error: "Insufficient stock"

### Q: Low Stock at 10 units - why this number?
**A:** This is a common inventory threshold to allow reordering buffer before actually running out.

---

## Summary

✅ **Active** = Available for purchase
⏸️ **Inactive** = Hidden from users
📉 **Low Stock** = 1-9 units (reorder soon)
❌ **Out of Stock** = 0 units (urgent reorder)
💰 **Paid Status** = Stock automatically reduces

**Remember:** Stock only changes when payment is successfully verified! 🎯
