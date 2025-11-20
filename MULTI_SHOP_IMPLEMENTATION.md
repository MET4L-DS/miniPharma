# Multi-Shop & Staff Management - Implementation Summary

## 🎯 Features Implemented

### Backend (Django)

✅ **Staff Model** - Created with phone, name, password, shop FK, is_active
✅ **JWT Token Enhancement** - Token now contains both `account` (actor) and `shop` (context)
✅ **Staff Management Endpoints**

-   `GET /api/shops/<shop_phone>/staffs/` - List all staff
-   `POST /api/shops/<shop_phone>/staffs/add/` - Add staff (manager only)
-   `DELETE /api/shops/<shop_phone>/staffs/<staff_phone>/remove/` - Remove staff (manager only)

✅ **Shop Management Endpoints**

-   `GET /api/shops/mine/` - List manager's shops
-   `POST /api/shops/<shop_phone>/switch/` - Switch active shop (returns new token)

✅ **Enhanced Login** - Staff can login with shop context

### Frontend (React + ShadCN UI)

✅ **Updated LoginPage**

-   Toggle between Manager and Staff login modes
-   Staff login requires both staff phone and shop phone
-   Automatic role detection from JWT token

✅ **ShopSwitcher Component**

-   Displays in header for managers with multiple shops
-   Uses ShadCN Select component
-   Updates token and reloads page on switch

✅ **StaffManagementPage**

-   Full CRUD for staff members
-   Add staff with dialog form
-   View staff in table with status badges
-   Remove staff with confirmation dialog
-   Manager-only access

✅ **Updated Navigation**

-   "Staff Management" menu item (visible to managers only)
-   Role-based sidebar rendering

✅ **Enhanced AuthContext**

-   Stores role (manager/staff)
-   Tracks accountPhone and shopPhone separately
-   `updateShop()` method for shop switching
-   `isManager` computed property

## 🔐 Token Structure

### New Token Format

```json
{
	"account": "1234567890", // The actual user (staff or manager)
	"shop": "9876543210", // The shop context
	"exp": 1732147200,
	"iat": 1732143600
}
```

### Backward Compatibility

Old tokens with `"phone"` field still work for existing managers.

## 📋 Testing Checklist

1. **Manager Registration**

    - Register a new pharmacy manager
    - Login as manager
    - Verify dashboard access

2. **Staff Management**

    - Navigate to Staff Management page
    - Add a new staff member (phone, name, password)
    - Verify staff appears in table
    - Remove staff member

3. **Staff Login**

    - Click "Staff" toggle on login page
    - Enter staff phone, password, and shop phone
    - Verify successful login
    - Confirm staff can only see their shop's data

4. **Multi-Shop Management**

    - Register second pharmacy with same manager phone
    - Login as manager
    - View shop switcher in header
    - Switch between shops
    - Verify data changes after switch

5. **Authorization**
    - Login as staff
    - Verify "Staff Management" is not visible
    - Try accessing /staff directly → should redirect

## 🚀 API Examples

### Add Staff (Manager Only)

```bash
POST /api/shops/9876543210/staffs/add/
Authorization: Bearer <manager_token>
Content-Type: application/json

{
  "phone": "1234567890",
  "password": "staff123",
  "name": "John Doe"
}
```

### Staff Login

```bash
POST /api/login/
Content-Type: application/json

{
  "phone": "1234567890",
  "password": "staff123",
  "shop": "9876543210"
}
```

### Switch Shop

```bash
POST /api/shops/9876543210/switch/
Authorization: Bearer <manager_token>

Response:
{
  "success": true,
  "token": "eyJ...",
  "shop": {
    "phone": "9876543210",
    "shopname": "HealthPlus Pharmacy",
    "manager": "9999999999"
  }
}
```

## 📁 Files Created/Modified

### Backend

-   `api/models.py` - Added Staff model
-   `api/auth.py` - Enhanced JWT with account+shop
-   `api/views/user_views.py` - Added 5 new endpoints
-   `api/urls.py` - Added 5 new routes
-   `api/migrations/0002_staff_and_shop_relations.py` - Custom migration

### Frontend

-   `src/services/api/staff.ts` - StaffService (new)
-   `src/services/api/shop.ts` - ShopService (new)
-   `src/services/api.ts` - Integrated new services
-   `src/contexts/AuthContext.tsx` - Added role, updateShop
-   `src/pages/LoginPage.tsx` - Added staff login mode
-   `src/pages/StaffManagementPage.tsx` - Staff CRUD page (new)
-   `src/components/layout/ShopSwitcher.tsx` - Shop selector (new)
-   `src/components/layout/DashboardLayout.tsx` - Added ShopSwitcher
-   `src/components/layout/AppSidebar.tsx` - Role-based navigation
-   `src/App.tsx` - Added /staff route

## 🎨 UI Components Used

-   ShadCN Select - For shop switcher
-   ShadCN Dialog - For add staff form
-   ShadCN AlertDialog - For delete confirmation
-   ShadCN Table - For staff list
-   ShadCN Card - For page layout
-   ShadCN Button - Throughout

## ✨ Key Features

-   **Instant Shop Switching** - Managers change context without re-login
-   **Role-Based UI** - Different navigation for managers vs staff
-   **JWT Security** - Separate account and shop context in token
-   **Data Isolation** - Each shop sees only their own data
-   **Backward Compatible** - Old tokens still work
-   **Comprehensive Staff Management** - Full CRUD with validation

---

**Status**: ✅ All features implemented and ready for testing!
**Server**: Running on http://localhost:8000
**Frontend**: Ready to build and test
