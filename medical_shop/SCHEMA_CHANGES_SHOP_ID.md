# Schema Update: Shop Table - Auto-Increment ID

## Overview

Replaced `api_shop.phone` (VARCHAR primary key) with `api_shop.shop_id` (auto-increment INT primary key). The phone field is now `contact_number` and is optional.

## Database Changes

### api_shop Table

**Before:**

-   `phone` VARCHAR(10) PRIMARY KEY
-   `shopname` VARCHAR(100)
-   `password` VARCHAR(100) ❌ (removed - shops don't log in)
-   `manager_id` VARCHAR(10) FK → api_manager.phone

**After:**

-   `shop_id` INT AUTO_INCREMENT PRIMARY KEY ✅
-   `shopname` VARCHAR(100)
-   `contact_number` VARCHAR(10) NULL ✅ (optional shop contact)
-   `manager_id` VARCHAR(10) FK → api_manager.phone

### Foreign Key Updates

All tables that referenced `api_shop.phone` now reference `api_shop.shop_id` (INT):

-   `api_staff.shop_id` VARCHAR(10) → INT
-   `api_product.shop_id` VARCHAR(10) → INT
-   `api_batch.shop_id` VARCHAR(10) → INT
-   `api_order.shop_id` VARCHAR(10) → INT

## Backend Changes

### Models (api/models.py)

```python
class Shop(models.Model):
    shop_id = models.AutoField(primary_key=True)  # Changed from phone
    shopname = models.CharField(max_length=100)
    contact_number = models.CharField(max_length=10, null=True, blank=True)  # Optional
    manager = models.ForeignKey(Manager, on_delete=models.CASCADE, related_name='shops')
```

### Authentication (api/auth.py)

-   JWT payload now uses `shop: shop_id` (INT) instead of `shop: phone` (VARCHAR)
-   `generate_token()` accepts `shop_id` parameter instead of `shop_phone`
-   `jwt_required()` resolves shop by `shop_id` instead of `phone`

### Views (api/views/user_views.py)

**Updated Functions:**

-   `register_user`: Returns `shop_id`, accepts optional `contact_number`
-   `login_user`: Returns `shop_id` in response
-   `get_users`: Returns `shop_id` and `contact_number` for each shop
-   `list_staffs(shop_id)`: Uses shop_id parameter
-   `my_shops`: Returns `shop_id` and `contact_number` for each shop
-   `switch_shop(shop_id)`: Uses shop_id parameter
-   `add_staff(shop_id)`: Uses shop_id parameter
-   `remove_staff(shop_id, staff_phone)`: Uses shop_id parameter
-   `add_shop`: Accepts `shopname` and optional `contact_number` (no phone required)
-   `update_shop(shop_id)`: NEW - replaces `update_user`, updates shopname/contact_number
-   `delete_shop(shop_id)`: NEW - replaces `delete_user`

### URL Patterns (api/urls.py)

**Changed:**

-   `/api/shops/<int:shop_id>/` (was `/api/users/<str:phone>/`)
-   `/api/shops/<int:shop_id>/delete/` (was `/api/users/<str:phone>/delete/`)
-   `/api/shops/<int:shop_id>/staffs/` (was `/api/shops/<str:shop_phone>/staffs/`)
-   `/api/shops/<int:shop_id>/staffs/add/` (was `/api/shops/<str:shop_phone>/staffs/add/`)
-   `/api/shops/<int:shop_id>/staffs/<str:staff_phone>/remove/` (was `/api/shops/<str:shop_phone>/staffs/<str:staff_phone>/remove/`)
-   `/api/shops/<int:shop_id>/switch/` (was `/api/shops/<str:shop_phone>/switch/`)

## Frontend Impact

### API Response Changes

**Registration Response:**

```json
{
	"message": "Manager and shop registered successfully",
	"token": "...",
	"shop_id": 1, // NEW - was not present before
	"shopname": "...",
	"manager": "..."
}
```

**Login Response:**

```json
{
	"message": "Login successful",
	"token": "...",
	"shop_id": 1, // NEW - was not present before
	"shopname": "...",
	"manager": "...",
	"is_manager": true
}
```

**My Shops Response:**

```json
[
	{
		"shop_id": 1, // NEW - was "phone"
		"shopname": "...",
		"contact_number": "...", // NEW - optional
		"manager": "..."
	}
]
```

### Required Frontend Updates

1. **API Types** - Update interfaces to use `shop_id` instead of `phone`:

    ```typescript
    interface Shop {
    	shop_id: number; // was: phone: string
    	shopname: string;
    	contact_number?: string; // NEW - optional
    	manager: string;
    }
    ```

2. **API Endpoints** - Update URL construction:

    ```typescript
    // Before: `/api/shops/${shopPhone}/staffs/`
    // After:  `/api/shops/${shopId}/staffs/`
    ```

3. **Context/State** - Update shop context to use `shop_id`:

    ```typescript
    // Store shop_id instead of shop phone
    const [currentShopId, setCurrentShopId] = useState<number>(1);
    ```

4. **Registration Form** - Add optional contact number field:
    ```typescript
    // Optional: Add contact_number field to registration form
    ```

## Migration Steps

1. ✅ Updated Django models
2. ✅ Updated authentication (JWT with shop_id)
3. ✅ Updated all view functions
4. ✅ Updated URL patterns
5. ✅ Ran database migration command
6. ⏳ **TODO:** Update frontend types and API calls

## Benefits

1. **Auto-increment IDs** - Simpler shop identification
2. **No phone duplication** - Cleaner separation of concerns
3. **Optional contact** - Shops don't need phone numbers
4. **Standard pattern** - Uses INT primary keys like other tables (Order, Batch, etc.)
5. **Cleaner schema** - Removed unnecessary password field from shops

## Testing Checklist

-   [ ] Manager registration with shop
-   [ ] Manager login
-   [ ] Staff login
-   [ ] Shop switching
-   [ ] Add new shop
-   [ ] Update shop (name/contact)
-   [ ] Add staff to shop
-   [ ] Remove staff from shop
-   [ ] List shops (my_shops)
-   [ ] All product/batch/order operations with new shop_id
