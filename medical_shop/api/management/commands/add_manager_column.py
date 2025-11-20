from django.core.management.base import BaseCommand
import pymysql

class Command(BaseCommand):
    help = 'Add manager_id column to api_shop table'

    def handle(self, *args, **options):
        try:
            conn = pymysql.connect(
                host='localhost',
                user='root',
                password='root',
                database='dbmsproj'
            )
            cursor = conn.cursor()
            
            # Check if column exists
            cursor.execute("SHOW COLUMNS FROM api_shop LIKE 'manager_id'")
            if cursor.fetchone():
                self.stdout.write(self.style.SUCCESS('✓ manager_id column already exists'))
                cursor.close()
                conn.close()
                return
            
            self.stdout.write('Adding manager_id column to api_shop...')
            
            # Add manager_id column
            cursor.execute('''
                ALTER TABLE api_shop 
                ADD COLUMN manager_id VARCHAR(10) NOT NULL
            ''')
            
            # Add foreign key constraint
            cursor.execute('''
                ALTER TABLE api_shop
                ADD CONSTRAINT api_shop_manager_id_fk
                FOREIGN KEY (manager_id) REFERENCES api_manager(phone)
                ON DELETE CASCADE
            ''')
            
            # Add index on manager_id
            cursor.execute('''
                CREATE INDEX api_shop_manager_id_idx ON api_shop(manager_id)
            ''')
            
            conn.commit()
            
            self.stdout.write(self.style.SUCCESS('✓ Added manager_id column with foreign key constraint'))
            
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
