from django.core.management.base import BaseCommand
import pymysql

class Command(BaseCommand):
    help = 'Replace phone with auto-increment shop_id in api_shop table'

    def handle(self, *args, **options):
        try:
            conn = pymysql.connect(
                host='localhost',
                user='root',
                password='root',
                database='dbmsproj'
            )
            cursor = conn.cursor()
            
            # Check if shop_id already exists
            cursor.execute("SHOW COLUMNS FROM api_shop LIKE 'shop_id'")
            if cursor.fetchone():
                self.stdout.write(self.style.SUCCESS('✓ shop_id column already exists'))
                cursor.close()
                conn.close()
                return
            
            self.stdout.write('Restructuring api_shop table...')
            
            # Step 1: Drop foreign key constraints referencing api_shop.phone
            self.stdout.write('  - Dropping foreign key constraints...')
            
            # Get all foreign keys referencing api_shop
            cursor.execute("""
                SELECT TABLE_NAME, CONSTRAINT_NAME 
                FROM information_schema.KEY_COLUMN_USAGE 
                WHERE REFERENCED_TABLE_NAME = 'api_shop' 
                AND TABLE_SCHEMA = 'dbmsproj'
            """)
            foreign_keys = cursor.fetchall()
            
            for table_name, constraint_name in foreign_keys:
                cursor.execute(f'ALTER TABLE {table_name} DROP FOREIGN KEY {constraint_name}')
                self.stdout.write(f'    Dropped {constraint_name} from {table_name}')
            
            # Step 2: Drop primary key on phone
            self.stdout.write('  - Dropping primary key on phone...')
            cursor.execute('ALTER TABLE api_shop DROP PRIMARY KEY')
            
            # Step 3: Add shop_id as auto-increment primary key
            self.stdout.write('  - Adding shop_id auto-increment column...')
            cursor.execute('''
                ALTER TABLE api_shop 
                ADD COLUMN shop_id INT AUTO_INCREMENT PRIMARY KEY FIRST
            ''')
            
            # Step 4: Rename phone to contact_number and make it nullable
            self.stdout.write('  - Renaming phone to contact_number...')
            cursor.execute('''
                ALTER TABLE api_shop 
                CHANGE COLUMN phone contact_number VARCHAR(10) NULL
            ''')
            
            # Step 5: Update foreign key columns in dependent tables
            self.stdout.write('  - Updating dependent tables...')
            
            # Helper function to check if constraint exists
            def constraint_exists(table_name, constraint_name):
                cursor.execute(f"""
                    SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
                    WHERE TABLE_SCHEMA = 'dbmsproj'
                    AND TABLE_NAME = '{table_name}'
                    AND CONSTRAINT_NAME = '{constraint_name}'
                """)
                return cursor.fetchone()[0] > 0
            
            # Update api_staff: Change shop_id (varchar) to shop_id (int)
            if constraint_exists('api_staff', 'api_staff_shop_id_fkey'):
                cursor.execute('ALTER TABLE api_staff DROP FOREIGN KEY api_staff_shop_id_fkey')
            cursor.execute('ALTER TABLE api_staff CHANGE COLUMN shop_id shop_id_old VARCHAR(10)')
            cursor.execute('ALTER TABLE api_staff ADD COLUMN shop_id INT NOT NULL AFTER shop_id_old')
            # Note: No data to migrate since tables are empty
            cursor.execute('ALTER TABLE api_staff DROP COLUMN shop_id_old')
            cursor.execute('''
                ALTER TABLE api_staff 
                ADD CONSTRAINT api_staff_shop_id_fkey 
                FOREIGN KEY (shop_id) REFERENCES api_shop(shop_id) ON DELETE CASCADE
            ''')
            
            # Update api_product
            if constraint_exists('api_product', 'api_product_shop_id_fkey'):
                cursor.execute('ALTER TABLE api_product DROP FOREIGN KEY api_product_shop_id_fkey')
            cursor.execute('ALTER TABLE api_product CHANGE COLUMN shop_id shop_id_old VARCHAR(10)')
            cursor.execute('ALTER TABLE api_product ADD COLUMN shop_id INT NOT NULL AFTER shop_id_old')
            cursor.execute('ALTER TABLE api_product DROP COLUMN shop_id_old')
            cursor.execute('''
                ALTER TABLE api_product 
                ADD CONSTRAINT api_product_shop_id_fkey 
                FOREIGN KEY (shop_id) REFERENCES api_shop(shop_id) ON DELETE CASCADE
            ''')
            
            # Update api_batch
            if constraint_exists('api_batch', 'api_batch_shop_id_fkey'):
                cursor.execute('ALTER TABLE api_batch DROP FOREIGN KEY api_batch_shop_id_fkey')
            cursor.execute('ALTER TABLE api_batch CHANGE COLUMN shop_id shop_id_old VARCHAR(10)')
            cursor.execute('ALTER TABLE api_batch ADD COLUMN shop_id INT NOT NULL AFTER shop_id_old')
            cursor.execute('ALTER TABLE api_batch DROP COLUMN shop_id_old')
            cursor.execute('''
                ALTER TABLE api_batch 
                ADD CONSTRAINT api_batch_shop_id_fkey 
                FOREIGN KEY (shop_id) REFERENCES api_shop(shop_id) ON DELETE CASCADE
            ''')
            
            # Update api_order
            if constraint_exists('api_order', 'api_order_shop_id_fkey'):
                cursor.execute('ALTER TABLE api_order DROP FOREIGN KEY api_order_shop_id_fkey')
            cursor.execute('ALTER TABLE api_order CHANGE COLUMN shop_id shop_id_old VARCHAR(10)')
            cursor.execute('ALTER TABLE api_order ADD COLUMN shop_id INT NOT NULL AFTER shop_id_old')
            cursor.execute('ALTER TABLE api_order DROP COLUMN shop_id_old')
            cursor.execute('''
                ALTER TABLE api_order 
                ADD CONSTRAINT api_order_shop_id_fkey 
                FOREIGN KEY (shop_id) REFERENCES api_shop(shop_id) ON DELETE CASCADE
            ''')
            
            conn.commit()
            
            self.stdout.write(self.style.SUCCESS('✓ Successfully restructured api_shop table'))
            
            # Show updated structure
            cursor.execute('SHOW COLUMNS FROM api_shop')
            columns = cursor.fetchall()
            self.stdout.write('\nUpdated api_shop columns:')
            for col in columns:
                self.stdout.write(f'  - {col[0]} ({col[1]})')
            
            cursor.close()
            conn.close()
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error: {str(e)}'))
            raise
