"""
Migration script to transform the schema from self-referential Register model
to separate Manager and Register (Shop) models.

This script:
1. Creates the api_manager table
2. Migrates existing data
3. Updates relationships
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medical_shop.settings')
django.setup()

from django.db import connection
from api.models import Manager, Register, Staff
from django.contrib.auth.hashers import make_password

def run_migration():
    """Execute the migration from old schema to new schema"""
    
    print("Starting migration to Manager + Shop schema...")
    
    with connection.cursor() as cursor:
        # Step 1: Create api_manager table
        print("\n1. Creating api_manager table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS api_manager (
                phone VARCHAR(10) PRIMARY KEY,
                name VARCHAR(100),
                password VARCHAR(100)
            )
        """)
        
        # Step 2: Check if we have existing data in api_register
        cursor.execute("SELECT COUNT(*) FROM api_register")
        register_count = cursor.fetchone()[0]
        print(f"   Found {register_count} records in api_register")
        
        if register_count == 0:
            print("   No existing data to migrate. Starting fresh.")
            return
        
        # Step 3: Create backup
        print("\n2. Creating backup of api_register...")
        cursor.execute("DROP TABLE IF EXISTS api_register_backup")
        cursor.execute("CREATE TABLE api_register_backup AS SELECT * FROM api_register")
        
        # Step 4: Identify and migrate root managers (those without a manager)
        print("\n3. Migrating root managers to api_manager...")
        cursor.execute("""
            SELECT phone, shopname, password
            FROM api_register
            WHERE manager_id IS NULL
        """)
        
        root_managers = cursor.fetchall()
        for phone, shopname, password in root_managers:
            cursor.execute("""
                INSERT INTO api_manager (phone, name, password)
                VALUES (%s, %s, %s)
                ON DUPLICATE KEY UPDATE phone=phone
            """, [phone, shopname or 'Manager', password or ''])
        
        print(f"   Migrated {len(root_managers)} root managers")
        
        # Step 5: Migrate referenced managers who don't have their own records
        print("\n4. Checking for referenced managers...")
        cursor.execute("""
            SELECT DISTINCT manager_id
            FROM api_register
            WHERE manager_id IS NOT NULL
        """)
        
        referenced_managers = [row[0] for row in cursor.fetchall()]
        new_managers = 0
        
        for manager_phone in referenced_managers:
            # Check if this manager already exists
            cursor.execute("SELECT COUNT(*) FROM api_manager WHERE phone = %s", [manager_phone])
            if cursor.fetchone()[0] == 0:
                # Create a basic manager entry
                cursor.execute("""
                    INSERT INTO api_manager (phone, name, password)
                    VALUES (%s, %s, %s)
                """, [manager_phone, 'Manager', ''])
                new_managers += 1
        
        print(f"   Created {new_managers} additional manager entries")
        
        # Step 6: Update foreign key constraint
        print("\n5. Updating foreign key constraints...")
        
        # Drop old self-referential constraint
        cursor.execute("""
            SELECT CONSTRAINT_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE TABLE_NAME = 'api_register'
              AND COLUMN_NAME = 'manager_id'
              AND CONSTRAINT_NAME != 'PRIMARY'
        """)
        
        constraints = cursor.fetchall()
        for (constraint_name,) in constraints:
            try:
                cursor.execute(f"ALTER TABLE api_register DROP FOREIGN KEY {constraint_name}")
                print(f"   Dropped constraint: {constraint_name}")
            except Exception as e:
                print(f"   Could not drop constraint {constraint_name}: {e}")
        
        # Remove password column from api_register
        print("\n6. Removing password column from api_register...")
        try:
            cursor.execute("ALTER TABLE api_register DROP COLUMN password")
            print("   Password column removed")
        except Exception as e:
            print(f"   Could not remove password column: {e}")
        
        # Add new foreign key to api_manager
        print("\n7. Adding new foreign key constraint...")
        cursor.execute("""
            ALTER TABLE api_register
            ADD CONSTRAINT api_register_manager_id_fk_api_manager
            FOREIGN KEY (manager_id) REFERENCES api_manager(phone)
            ON DELETE CASCADE
        """)
        
        # Step 7: Update shops to have proper manager references
        print("\n8. Updating shop-manager relationships...")
        cursor.execute("""
            UPDATE api_register r
            INNER JOIN api_manager m ON r.phone = m.phone
            SET r.manager_id = m.phone
            WHERE r.manager_id IS NULL
        """)
        
        # Verify migration
        print("\n9. Verification:")
        cursor.execute("SELECT COUNT(*) FROM api_manager")
        manager_count = cursor.fetchone()[0]
        print(f"   Managers: {manager_count}")
        
        cursor.execute("SELECT COUNT(*) FROM api_register")
        shop_count = cursor.fetchone()[0]
        print(f"   Shops: {shop_count}")
        
        cursor.execute("SELECT COUNT(*) FROM api_staff")
        staff_count = cursor.fetchone()[0]
        print(f"   Staff: {staff_count}")
        
    print("\n✅ Migration completed successfully!")
    print("\nNote: All existing users are now in api_manager table.")
    print("Each manager's first shop has the same phone number as the manager.")

if __name__ == '__main__':
    try:
        run_migration()
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
