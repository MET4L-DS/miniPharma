# Quick Start Guide: Testing Multi-Shop Features

## Prerequisites

1. **Backend Running**:

    ```bash
    cd medical_shop
    python manage.py runserver
    ```

    Server should be running at `http://localhost:8000`

2. **Frontend Running**:
    ```bash
    cd frontend
    npm run dev
    ```
    App should be running at `http://localhost:5173`

## Test Scenario: Complete Multi-Shop Workflow

### Step 1: Register as Manager

1. Navigate to `http://localhost:5173/register`
2. Fill in the form:
    - Phone: `1234567890`
    - Name: `John Doe` (optional)
    - Shop Name: `ABC Pharmacy`
    - Password: `password123`
    - Confirm Password: `password123`
3. Click "Register"
4. ✅ You should be automatically logged in and redirected to dashboard
5. ✅ Notice "My Shops" appears in the sidebar under "Management"

### Step 2: View Your Shops

1. Click "My Shops" in the sidebar
2. ✅ You should see your first shop "ABC Pharmacy" with:
    - Store icon
    - Shop name and phone
    - "Currently Active" button (disabled)
    - Primary border and checkmark indicating it's active

### Step 3: Add Second Shop

1. On the "My Shops" page, click "Add New Shop" button
2. In the dialog, fill in:
    - Phone: `9999999999`
    - Shop Name: `XYZ Medical Store`
3. Click "Add Shop"
4. ✅ Dialog closes and success toast appears
5. ✅ New shop card appears in the grid

### Step 4: Switch to Second Shop

1. On the "XYZ Medical Store" card, click "Switch to This Shop"
2. ✅ Success toast: "Switched to XYZ Medical Store"
3. ✅ Page reloads automatically
4. ✅ Notice the header now shows "XYZ Medical Store" in the shop switcher dropdown
5. ✅ On "My Shops" page, XYZ Medical Store now has primary border and "Currently Active" button

### Step 5: Use Header Shop Switcher

1. From any page (Dashboard, Medicines, etc.)
2. Look at the header - you'll see a dropdown with Store icon
3. Click the dropdown
4. ✅ You should see both shops listed:
    - ABC Pharmacy (1234567890)
    - XYZ Medical Store (9999999999)
5. Select "ABC Pharmacy"
6. ✅ Success toast appears
7. ✅ Page reloads with ABC Pharmacy context

### Step 6: Verify Data Isolation

1. While on ABC Pharmacy, go to "Staff Management"
2. Add a staff member:
    - Phone: `8888888888`
    - Name: `Staff One`
    - Password: `staff123`
3. ✅ Staff member appears in the list
4. Switch to XYZ Medical Store (using header or My Shops page)
5. Go to "Staff Management"
6. ✅ Staff list should be empty (data is isolated per shop)
7. Add a different staff member to XYZ Medical Store
8. Switch back to ABC Pharmacy
9. ✅ Original staff member is still there

### Step 7: Test Staff Access (Optional)

1. Logout
2. Login as staff:
    - Phone: `8888888888`
    - Password: `staff123`
    - Shop: `1234567890` (ABC Pharmacy)
3. ✅ You should be logged in successfully
4. ✅ Notice in the sidebar:
    - "My Shops" is NOT visible
    - "Staff Management" is NOT visible
5. ✅ Shop switcher in header is NOT visible
6. Try accessing `http://localhost:5173/shops` directly
7. ✅ Should show access denied message

## Expected Results Summary

| Feature              | Expected Behavior                            | Status |
| -------------------- | -------------------------------------------- | ------ |
| Manager Registration | Creates manager + first shop                 | ✅     |
| Name Field           | Optional, saves to backend                   | ✅     |
| My Shops Page        | Shows all manager's shops                    | ✅     |
| Add Shop Button      | Opens dialog, adds shop                      | ✅     |
| Shop Cards           | Shows shop details, current shop highlighted | ✅     |
| Switch from Card     | Reloads page with new shop                   | ✅     |
| Header Dropdown      | Shows all shops, allows switching            | ✅     |
| Data Isolation       | Staff lists separate per shop                | ✅     |
| Staff Access         | Cannot see shop management                   | ✅     |
| Sidebar Navigation   | "My Shops" only for managers                 | ✅     |

## Backend API Test (Alternative)

Run the automated backend test:

```bash
cd medical_shop
python scripts/test_multi_shop.py
```

This will test:

-   Manager registration
-   Manager login
-   Adding second shop
-   Listing all shops
-   Switching shops
-   Adding staff
-   Staff login
-   Permission checks

## Troubleshooting

### Shop Switcher Not Appearing

-   **Cause**: You only have 1 shop
-   **Solution**: Add a second shop first, then it will appear

### "My Shops" Not in Sidebar

-   **Cause**: Logged in as staff, not manager
-   **Solution**: Login with manager account (the one used for registration)

### Can't Switch Shops

-   **Cause**: Backend not running or token expired
-   **Solution**: Restart backend, re-login if needed

### Changes Not Reflected

-   **Cause**: Page didn't reload after switch
-   **Solution**: Shop switching triggers page reload automatically - if it doesn't, manually refresh

### 403 Permission Denied

-   **Cause**: Trying to access shop you don't own, or logged in as staff
-   **Solution**: Use manager account and ensure you own the shop

## Next Steps

After successful testing:

1. Test with production data
2. Add more shops (test with 5+ shops)
3. Test switching rapidly between shops
4. Verify all pages (medicines, orders, etc.) show correct shop data
5. Test staff workflows completely
6. Consider adding shop deletion/deactivation if needed

## Clean Up Test Data

To start fresh:

```sql
-- Connect to MySQL
mysql -u root -p dbmsproj

-- Clear all data
DELETE FROM api_staff;
DELETE FROM api_register;
DELETE FROM api_manager;
```

Then re-run the test workflow from Step 1.
