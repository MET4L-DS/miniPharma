# Multi-Shop Manager Schema Design

## Overview

This document describes the updated schema that supports managers owning multiple shops.

## Schema Changes

### 1. New Manager Model

```python
class Manager(models.Model):
    """Manager account - can manage multiple shops"""
    phone = models.CharField(max_length=10, primary_key=True)
    name = models.CharField(max_length=100, null=True)
    password = models.CharField(max_length=100, null=True)
```

**Purpose**: Represents the actual manager accounts who can own and manage multiple pharmacies.

### 2. Updated Register (Shop) Model

```python
class Register(models.Model):
    """Pharmacy/Shop registration - each entry represents a pharmacy"""
    phone = models.CharField(max_length=10, primary_key=True)
    shopname = models.CharField(max_length=100, null=True)
    manager = models.ForeignKey(Manager, on_delete=models.CASCADE, related_name='shops', null=True)
```

**Changes**:

-   Removed `password` field (now only managers have passwords)
-   Changed `manager` from self-referential FK to FK pointing to Manager model
-   Each shop belongs to exactly one manager

### 3. Staff Model (Unchanged)

```python
class Staff(models.Model):
    """Staff accounts tied to a specific shop"""
    phone = models.CharField(max_length=10, primary_key=True)
    name = models.CharField(max_length=100, null=True)
    password = models.CharField(max_length=100, null=True)
    shop = models.ForeignKey(Register, on_delete=models.CASCADE, related_name='staffs')
    is_active = models.BooleanField(default=True)
```

**Purpose**: Staff members work at a specific shop and cannot manage multiple shops.

## Relationships

```
Manager (1) ----< (N) Register/Shop (1) ----< (N) Staff
```

-   One Manager can have multiple Shops
-   One Shop belongs to one Manager
-   One Shop can have multiple Staff members
-   One Staff member works at one Shop

## API Endpoints

### Authentication & Registration

#### 1. Register Manager (POST /api/register/)

Creates a new manager account and their first shop.

**Request**:

```json
{
	"phone": "1234567890",
	"password": "password123",
	"name": "John Doe",
	"shopname": "ABC Pharmacy"
}
```

**Response**:

```json
{
	"message": "Manager and shop registered successfully",
	"token": "jwt_token_here",
	"shopname": "ABC Pharmacy",
	"manager_phone": "1234567890"
}
```

**Behavior**:

-   Creates Manager with given phone, name, and password
-   Creates first Shop with same phone as manager
-   Returns JWT token with account=manager.phone and shop=shop.phone

#### 2. Login (POST /api/login/)

Login as Manager or Staff.

**Manager Login**:

```json
{
	"phone": "1234567890",
	"password": "password123"
}
```

**Staff Login** (requires shop context):

```json
{
	"phone": "9876543210",
	"password": "staffpass",
	"shop": "1234567890"
}
```

**Response**:

```json
{
	"message": "Login successful",
	"token": "jwt_token",
	"shopname": "ABC Pharmacy",
	"manager_phone": "1234567890",
	"is_manager": true
}
```

### Shop Management

#### 3. Add Shop (POST /api/shops/add/)

Manager can add additional shops.

**Request**:

```json
{
	"phone": "9999999999",
	"shopname": "XYZ Pharmacy"
}
```

**Response**:

```json
{
	"message": "Shop added successfully",
	"shop": {
		"phone": "9999999999",
		"shopname": "XYZ Pharmacy",
		"manager": "1234567890"
	}
}
```

**Permission**: Only authenticated managers

#### 4. My Shops (GET /api/shops/mine/)

Get all shops owned by the authenticated manager.

**Response**:

```json
[
	{
		"phone": "1234567890",
		"shopname": "ABC Pharmacy",
		"manager": "1234567890"
	},
	{
		"phone": "9999999999",
		"shopname": "XYZ Pharmacy",
		"manager": "1234567890"
	}
]
```

**Permission**: Only managers (staff will get 403)

#### 5. Switch Shop (POST /api/shops/{shop_phone}/switch/)

Switch active shop context and get a new JWT token.

**Response**:

```json
{
	"success": true,
	"token": "new_jwt_token_with_updated_shop",
	"shop": {
		"phone": "9999999999",
		"shopname": "XYZ Pharmacy",
		"manager": "1234567890"
	}
}
```

**Permission**: Manager must own the target shop

### Staff Management

#### 6. List Staff (GET /api/shops/{shop_phone}/staffs/)

**Permission**: Shop's manager or staff member of that shop

#### 7. Add Staff (POST /api/shops/{shop_phone}/staffs/add/)

**Request**:

```json
{
	"phone": "8888888888",
	"name": "Staff Member",
	"password": "staffpass"
}
```

**Permission**: Only the shop's manager

#### 8. Remove Staff (DELETE /api/shops/{shop_phone}/staffs/{staff_phone}/remove/)

**Permission**: Only the shop's manager

## JWT Token Structure

```json
{
	"account": "1234567890", // Manager or Staff phone
	"shop": "9999999999", // Current shop context
	"exp": 1234567890, // Expiration timestamp
	"iat": 1234567890 // Issued at timestamp
}
```

**Token Resolution**:

1. `shop` → Resolves to Register instance (attached to `request.register_user`)
2. `account` → Resolves to Manager or Staff instance (attached to `request.account_user`)

## Permission System

### Manager Permissions

-   Create multiple shops
-   Switch between their shops
-   Add/remove staff for their shops
-   Access all endpoints scoped to their shops

### Staff Permissions

-   Login with shop context
-   Access endpoints scoped to their specific shop
-   Cannot manage other shops or staff
-   Cannot switch shops

## Migration from Old Schema

### Before (Self-Referential)

```python
class Register(models.Model):
    phone = models.CharField(max_length=10, primary_key=True)
    shopname = models.CharField(max_length=100, null=True)
    password = models.CharField(max_length=100, null=True)
    manager = models.ForeignKey('self', ...)  # Self-reference
```

### After (Separated Manager and Shop)

```python
class Manager(models.Model):
    phone = models.CharField(max_length=10, primary_key=True)
    name = models.CharField(max_length=100, null=True)
    password = models.CharField(max_length=100, null=True)

class Register(models.Model):
    phone = models.CharField(max_length=10, primary_key=True)
    shopname = models.CharField(max_length=100, null=True)
    manager = models.ForeignKey(Manager, ...)  # Points to Manager
```

### Migration Steps

1. Run `python scripts/migrate_to_manager_shop.py`
2. This will:
    - Create `api_manager` table
    - Extract managers from existing `api_register` records
    - Update foreign key relationships
    - Preserve all existing data

## Frontend Integration

### Required Updates

1. **Registration Page**: Already compatible (creates manager + first shop)

2. **Login Page**: Already compatible (detects manager vs staff)

3. **Shop Switcher Component**: Use `/api/shops/mine/` and `/api/shops/{phone}/switch/`

4. **Add Shop Feature**: Create UI to call `/api/shops/add/`

5. **Staff Management**: Update permission checks to use manager ownership

## Testing Checklist

-   [ ] Register new manager → creates Manager + first Shop
-   [ ] Manager login → returns token with first shop context
-   [ ] Add second shop → manager can create additional shops
-   [ ] Switch shop → token updates to new shop context
-   [ ] Add staff to shop → only manager can add staff
-   [ ] Staff login → requires shop context
-   [ ] Staff permissions → cannot access other shops
-   [ ] Manager with 3 shops → can switch between all 3
-   [ ] Data isolation → shop data is properly isolated

## Benefits of New Schema

1. **Clear Separation**: Managers and Shops are distinct entities
2. **Scalability**: Managers can easily add unlimited shops
3. **Better Permissions**: Clear ownership model
4. **Data Integrity**: Proper foreign key relationships
5. **Flexibility**: Easy to add manager-level features (notifications, billing, etc.)
