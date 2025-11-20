# Multi-Shop Manager Schema Implementation - Summary

## ✅ Completed Implementation

### 1. Database Schema Changes

#### New Manager Model

```python
class Manager(models.Model):
    phone = models.CharField(max_length=10, primary_key=True)
    name = models.CharField(max_length=100, null=True)
    password = models.CharField(max_length=100, null=True)
    db_table = 'api_manager'
```

#### Updated Register (Shop) Model

```python
class Register(models.Model):
    phone = models.CharField(max_length=10, primary_key=True)
    shopname = models.CharField(max_length=100, null=True)
    manager = models.ForeignKey(Manager, on_delete=models.CASCADE, related_name='shops', null=True)
    db_table = 'api_register'
    # Note: password field removed (managers have passwords, not shops)
```

### 2. Backend Changes

#### Updated Files:

-   **api/models.py**: Added Manager model, updated Register model
-   **api/auth.py**: Updated to support Manager authentication and token generation
-   **api/views/user_views.py**: Updated all functions to work with Manager model
    -   `register_user()`: Creates Manager + first Shop
    -   `login_user()`: Checks Manager or Staff login
    -   `my_shops()`: Returns all shops for a manager
    -   `add_shop()`: NEW - Allows manager to add additional shops
    -   `switch_shop()`: Allows manager to switch between shops
    -   `add_staff()`, `remove_staff()`, `list_staffs()`: Updated permission checks
-   **api/urls.py**: Added route for `/api/shops/add/`
-   **api/views/**init**.py**: Exported `add_shop` function

### 3. API Endpoints

#### New/Updated Endpoints:

1. **POST /api/register/** - Register Manager + First Shop

    - Creates Manager account
    - Creates first shop (shop.phone = manager.phone initially)
    - Returns JWT token

2. **POST /api/login/** - Login as Manager or Staff

    - Manager: Just phone + password
    - Staff: phone + password + shop (context)

3. **POST /api/shops/add/** - Add Additional Shop (NEW)

    - Manager can create new shops with different phone numbers
    - Requires authentication as Manager

4. **GET /api/shops/mine/** - Get Manager's Shops

    - Returns all shops owned by the authenticated manager
    - Staff users get 403 Forbidden

5. **POST /api/shops/{shop_phone}/switch/** - Switch Shop Context

    - Returns new JWT token with updated shop context
    - Manager can switch between their shops

6. **POST /api/shops/{shop_phone}/staffs/add/** - Add Staff

    - Permission: Only the shop's manager

7. **DELETE /api/shops/{shop_phone}/staffs/{staff_phone}/remove/** - Remove Staff

    - Permission: Only the shop's manager

8. **GET /api/shops/{shop_phone}/staffs/** - List Staff
    - Permission: Shop's manager or staff member of that shop

### 4. Migration Strategy

#### Created Migration Scripts:

-   `scripts/migrate_to_manager_shop.py`: Python script for safe migration
-   `scripts/migrate_to_manager_schema.sql`: SQL migration script
-   Django migration: `0003_manager_remove_register_password_product_id_and_more.py`

#### Migration Applied:

-   Created `api_manager` table
-   Updated `api_register` table (removed password, updated FK)
-   Migration was faked since database was clean

### 5. Testing

#### Created Test Script:

-   `scripts/test_multi_shop.py`: Comprehensive test suite covering:
    -   Manager registration
    -   Manager login
    -   Adding second shop
    -   Listing all shops
    -   Switching between shops
    -   Adding staff
    -   Staff login
    -   Permission checks

### 6. Documentation

#### Created Documentation Files:

-   `MULTI_SHOP_SCHEMA.md`: Complete schema design documentation including:
    -   Model relationships
    -   API endpoint details
    -   Request/response examples
    -   Permission system
    -   Migration guide
    -   Testing checklist

## How It Works

### Manager Registration Flow:

1. User submits phone, password, name, shopname
2. System creates Manager record
3. System creates first Shop record (phone = manager.phone)
4. Returns JWT token with account=manager.phone, shop=shop.phone

### Manager Adding New Shop:

1. Manager authenticates with JWT token
2. Manager calls POST /api/shops/add/ with new phone and shopname
3. System creates new Shop with manager FK pointing to authenticated manager
4. Manager can now switch between shops

### Shop Switching:

1. Manager calls POST /api/shops/{phone}/switch/
2. System verifies manager owns the shop
3. Returns new JWT token with updated shop context (same account, different shop)
4. Frontend updates token and reloads data for new shop

### Permission System:

-   **Managers**: Can manage multiple shops, add/remove staff, switch between shops
-   **Staff**: Tied to one shop, cannot manage shops or other staff

## Next Steps for Frontend

### Required UI Updates:

1. **Add Shop Button** (For Managers)

    - Create a dialog/form to add new shop
    - Fields: phone (10 digits), shopname
    - Call POST /api/shops/add/

2. **Shop Switcher Enhancement**

    - Already exists but may need styling updates
    - Should show all manager's shops from /api/shops/mine/
    - On switch, update token and reload page

3. **Role-Based UI**
    - Show "Add Shop" button only for managers
    - Hide shop switcher for staff users

### Sample Frontend Service Method:

```typescript
// Add to services/api/shop.ts
async addShop(phone: string, shopname: string) {
  const response = await this.apiClient.post('/shops/add/', {
    phone,
    shopname
  });
  return response.data;
}
```

## Schema Benefits

1. **Clean Separation**: Managers and Shops are distinct entities
2. **Scalability**: Managers can have unlimited shops
3. **Data Integrity**: Proper foreign key relationships
4. **Flexibility**: Easy to add manager-level or shop-level features
5. **Security**: Clear permission boundaries between managers and staff

## Testing Instructions

1. Start Django server:

    ```bash
    cd medical_shop
    python manage.py runserver
    ```

2. Run test script:

    ```bash
    python scripts/test_multi_shop.py
    ```

3. Or test manually:
    - Register a manager
    - Login
    - Add a second shop
    - List shops
    - Switch shops
    - Add staff to shops

## Status: ✅ COMPLETE

All backend changes have been implemented, tested, and documented. The schema now fully supports:

-   ✅ Manager accounts with authentication
-   ✅ Multiple shops per manager
-   ✅ Shop creation and management
-   ✅ Shop context switching
-   ✅ Staff management with proper permissions
-   ✅ JWT tokens with account + shop context
-   ✅ Data isolation between shops
