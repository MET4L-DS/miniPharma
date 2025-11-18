# Multi-Pharmacy Implementation Guide

## Overview

The system has been upgraded from single-shop to multi-pharmacy support. Each pharmacy (identified by a `Register` entry) now has its own isolated inventory, products, orders, and payments.

## Changes Made

### 1. Model Updates (`api/models.py`)

**Register Model** - Moved to top (must be first since other models reference it)

-   No changes to fields, but now serves as the primary pharmacy identifier

**Product Model**

-   Removed `primary_key=True` from `product_id`
-   Added `shop` ForeignKey to Register
-   Added `unique_together = ('product_id', 'shop')` - same product_id can exist across different shops

**Batch Model**

-   Added `shop` ForeignKey to Register
-   Updated `unique_together = ('batch_number', 'product', 'shop')`

**Order Model**

-   Added `shop` ForeignKey to Register

**Payment Model**

-   No direct changes (inherits shop through Order relationship)

### 2. Database Schema Changes

**SQL Migration Script** (`update_views_for_multishop.sql`):

```sql
-- Add shop_id columns
ALTER TABLE api_product ADD COLUMN shop_id VARCHAR(10) NULL;
ALTER TABLE api_batch ADD COLUMN shop_id VARCHAR(10) NULL;
ALTER TABLE api_order ADD COLUMN shop_id VARCHAR(10) NULL;

-- Migrate existing data (assign to first shop)
UPDATE api_product SET shop_id = (SELECT phone FROM api_register ORDER BY phone LIMIT 1);
UPDATE api_batch SET shop_id = (SELECT phone FROM api_register ORDER BY phone LIMIT 1);
UPDATE api_order SET shop_id = (SELECT phone FROM api_register ORDER BY phone LIMIT 1);

-- Make NOT NULL after migration
ALTER TABLE api_product MODIFY COLUMN shop_id VARCHAR(10) NOT NULL;
ALTER TABLE api_batch MODIFY COLUMN shop_id VARCHAR(10) NOT NULL;
ALTER TABLE api_order MODIFY COLUMN shop_id VARCHAR(10) NOT NULL;

-- Add foreign keys
ALTER TABLE api_product ADD CONSTRAINT api_product_shop_id_fkey
FOREIGN KEY (shop_id) REFERENCES api_register(phone) ON DELETE CASCADE;

ALTER TABLE api_batch ADD CONSTRAINT api_batch_shop_id_fkey
FOREIGN KEY (shop_id) REFERENCES api_register(phone) ON DELETE CASCADE;

ALTER TABLE api_order ADD CONSTRAINT api_order_shop_id_fkey
FOREIGN KEY (shop_id) REFERENCES api_register(phone) ON DELETE CASCADE;

-- Update primary key and unique constraints
ALTER TABLE api_product DROP PRIMARY KEY;
ALTER TABLE api_product ADD PRIMARY KEY (product_id, shop_id);

ALTER TABLE api_batch DROP INDEX api_batch_batch_number_product_id_3f7b710c_uniq;
ALTER TABLE api_batch ADD UNIQUE KEY api_batch_batch_product_shop_uniq (batch_number, product_id, shop_id);
```

### 3. View Updates

All API views now filter data by the authenticated user's shop:

**product_views.py**

-   GET: Shows only products for authenticated shop
-   POST: Creates product assigned to authenticated shop
-   PUT/DELETE: Only allows modifications to shop's own products

**batch_views.py**

-   GET: Shows only batches for authenticated shop
-   POST: Creates batch assigned to authenticated shop (validates product exists in shop)
-   PUT/DELETE: Only allows modifications to shop's own batches

**order_views.py**

-   `create_order`: Assigns order to authenticated shop
-   `get_orders`: Filters by shop
-   `get_order_items`: Filters by shop
-   `update_order`/`delete_order`: Only allows modifications to shop's own orders
-   `add_order_items`: Uses shop's last order, validates batches belong to shop

**payment_views.py**

-   `get_payments`: Filters by shop through order relationship
-   `get_payment_summary`: Aggregates only shop's data
-   All modifications validated through order's shop

**dashboard_views.py**

-   `get_dashboard_stats`: All counters filtered by shop
-   `get_expiring_soon`: Shows only shop's expiring items
-   `get_low_stock`: Shows only shop's low stock items
-   `get_sales_data`: Shows only shop's sales data

**search_views.py**

-   `search_medicines_with_batches`: Searches only in shop's inventory
-   `get_medicine_suggestions`: Suggests only from shop's products

## Implementation Steps

### Step 1: Backup Database

```bash
mysqldump -u root -p dbmsproj > backup_$(date +%Y%m%d).sql
```

### Step 2: Apply Database Changes

Run the SQL migration script:

```bash
mysql -u root -p dbmsproj < update_views_for_multishop.sql
```

### Step 3: Install Dependencies (if not already done)

```bash
cd medical_shop
pip install PyJWT==2.8.0
```

### Step 4: Test the System

**Register Multiple Pharmacies:**

```bash
# Pharmacy 1
curl -X POST http://localhost:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{"phone":"1234567890","password":"test123","shopname":"Pharmacy A"}'

# Pharmacy 2
curl -X POST http://localhost:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{"phone":"0987654321","password":"test123","shopname":"Pharmacy B"}'
```

**Login and Get Tokens:**

```bash
# Login as Pharmacy A
curl -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"phone":"1234567890","password":"test123"}'
# Save the token from response

# Login as Pharmacy B
curl -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"phone":"0987654321","password":"test123"}'
# Save the token from response
```

**Test Data Isolation:**

```bash
# Create product for Pharmacy A
curl -X POST http://localhost:8000/api/products/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <PHARMACY_A_TOKEN>" \
  -d '{"product_id":"MED001","brand_name":"Med A","generic_name":"Generic A","composition_id":1}'

# Try to access with Pharmacy B (should not see Pharmacy A's product)
curl -X GET http://localhost:8000/api/products/ \
  -H "Authorization: Bearer <PHARMACY_B_TOKEN>"
```

### Step 5: Frontend Testing

1. Start backend: `python manage.py runserver`
2. Start frontend: `npm run dev`
3. Register/login with different pharmacy accounts
4. Verify each pharmacy only sees its own data

## Security Features

1. **JWT Authentication**: All write operations require valid JWT token
2. **Shop Isolation**: Queries automatically filtered by authenticated user's shop
3. **Permission Checks**: Update/delete operations validate ownership
4. **Cascading Deletes**: Deleting a pharmacy removes all its data

## Data Migration Notes

-   Existing data in database is assigned to the first registered pharmacy
-   To properly distribute existing data across pharmacies, manually update `shop_id` in:
    -   `api_product`
    -   `api_batch`
    -   `api_order`

## Troubleshooting

**Issue**: "Product not found in your shop"

-   **Cause**: Trying to access product from different pharmacy
-   **Solution**: Ensure correct authentication token is being used

**Issue**: "manager_id" column error

-   **Cause**: Database schema not updated from previous session
-   **Solution**: Run the `fix_manager_column.sql` script first

**Issue**: Migration conflicts

-   **Cause**: Django migrations out of sync with manual SQL changes
-   **Solution**: Use `python manage.py migrate --fake` if needed, or reset migrations

## API Changes

All API endpoints now support multi-pharmacy automatically through JWT authentication:

**No URL changes** - same endpoints work for all pharmacies
**Authentication required** - JWT token in Authorization header
**Automatic filtering** - data filtered by token's shop
**Cross-shop protection** - cannot access other pharmacy's data

## Performance Considerations

-   Indexes added on `shop_id` columns for faster filtering
-   Select_related/prefetch_related used to minimize queries
-   Composite keys used where appropriate

## Future Enhancements

1. **Manager Roles**: Implement hierarchy where managers can view employee data
2. **Shop Groups**: Allow franchise/chain management across multiple shops
3. **Data Sharing**: Optional product catalog sharing between shops
4. **Analytics**: Cross-shop analytics for franchise owners
5. **Backup/Restore**: Per-shop backup and restore capabilities
