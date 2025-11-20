# Frontend Multi-Shop Manager Features

## Overview

The frontend now supports managers owning multiple pharmacy shops with the ability to add new shops and switch between them seamlessly.

## New Features

### 1. Manager Registration with Name Field

**Location**: `/register`

Managers can now provide their name during registration:

-   Phone Number (required)
-   Name (optional)
-   Shop Name (required)
-   Password (required)

### 2. Shop Management Page

**Location**: `/shops`
**Access**: Manager only

Features:

-   View all shops owned by the manager
-   See which shop is currently active
-   Switch between shops
-   Add new shops

**UI Components**:

-   Grid layout showing all shops as cards
-   Current shop highlighted with primary border and checkmark
-   "Add New Shop" button to create additional shops

### 3. Add Shop Dialog

**Component**: `AddShopDialog`

Allows managers to add new pharmacy locations:

-   Phone Number (10 digits, required)
-   Shop Name (required)

**Usage**:

```tsx
import { AddShopDialog } from "@/components/shop/AddShopDialog";

<AddShopDialog onShopAdded={() => loadShops()} />;
```

### 4. Enhanced Shop Switcher

**Component**: `ShopSwitcher`
**Location**: Header of all pages

Features:

-   Dropdown showing all manager's shops
-   Only visible to managers
-   Only shows if manager has 2+ shops
-   Automatically refreshes page after switching

### 5. Updated Navigation

**Sidebar Navigation**:

For all users:

-   Dashboard
-   Medicine Management
-   Stock Management
-   Billing
-   Payments

Manager-only section:

-   Staff Management
-   My Shops (NEW)

## API Integration

### New API Methods

```typescript
// Add a new shop
await apiService.addShop({
	phone: "9876543210",
	shopname: "New Pharmacy Branch",
});

// Get all manager's shops
const shops = await apiService.getMyShops();

// Switch to a different shop
const response = await apiService.switchShop("9876543210");
// Returns new JWT token scoped to selected shop
```

### Updated Types

```typescript
interface RegisterRequest {
	phone: string;
	password: string;
	name?: string; // NEW: Manager's name
	shopname: string;
}

interface AddShopRequest {
	phone: string;
	shopname: string;
}

interface Shop {
	phone: string;
	shopname: string;
	manager: string;
}
```

## User Flows

### Manager Registration Flow

1. User navigates to `/register`
2. Fills in phone, name (optional), shop name, and password
3. Backend creates Manager account + first Shop
4. User auto-logged in and redirected to dashboard

### Adding Second Shop

1. Manager navigates to `/shops` or clicks "My Shops" in sidebar
2. Clicks "Add New Shop" button
3. Fills in phone and shop name in dialog
4. Shop is added and appears in the list
5. Manager can immediately switch to the new shop

### Switching Between Shops

1. Manager uses Shop Switcher dropdown in header (any page)
   OR clicks "Switch to This Shop" button on Shop Management page
2. System fetches new JWT token with updated shop context
3. Page automatically refreshes
4. All data now shows for the selected shop

### Staff User Experience

-   Staff users do NOT see:
    -   Shop Switcher
    -   "My Shops" menu item
    -   Shop Management page
-   Staff can only access their assigned shop's data
-   Attempting to access shop management returns 403

## Components Created/Updated

### New Components

-   `AddShopDialog.tsx` - Dialog for adding new shops
-   `ShopManagementPage.tsx` - Page to view and manage all shops

### Updated Components

-   `RegistrationPage.tsx` - Added name field
-   `AppSidebar.tsx` - Added "My Shops" navigation item
-   `App.tsx` - Added `/shops` route
-   `ShopService.ts` - Added `addShop()` method
-   `api.ts` - Exported `addShop()` method
-   `api.ts` types - Added `name` field to RegisterRequest

## Testing

### Manual Test Checklist

-   [ ] Register new manager with name
-   [ ] Login as manager
-   [ ] Navigate to "My Shops"
-   [ ] Add second shop
-   [ ] Verify second shop appears in list
-   [ ] Switch to second shop using card button
-   [ ] Verify page refreshes with new shop context
-   [ ] Use header dropdown to switch back to first shop
-   [ ] Add staff to first shop
-   [ ] Switch to second shop
-   [ ] Verify staff list is empty (data isolation)
-   [ ] Login as staff - verify no "My Shops" menu
-   [ ] Try accessing `/shops` as staff - should show access denied

### Automated Test (Backend)

Run the backend test script:

```bash
cd medical_shop
python scripts/test_multi_shop.py
```

## Known Behaviors

1. **Page Refresh on Shop Switch**: Intentional to ensure all components reload with new shop context
2. **Shop Switcher Visibility**: Only appears if manager has 2+ shops
3. **Current Shop Indicator**: Primary border and checkmark on shop card
4. **Name Field**: Optional during registration for backward compatibility

## Future Enhancements

Potential improvements:

-   Shop deletion/deactivation
-   Transfer shop ownership to another manager
-   Shop-level settings and configuration
-   Shop performance analytics
-   Bulk staff transfer between shops
-   Shop-specific branding/themes
