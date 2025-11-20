from django.core.management.base import BaseCommand
import pymysql

class Command(BaseCommand):
    help = 'Remove password column from api_shop table (shops do not log in)'

    def handle(self, *args, **options):
        try:
            conn = pymysql.connect(
                host='localhost',
                user='root',
                password='root',
                database='dbmsproj'
            )
            cursor = conn.cursor()
            
            # Check if password column exists
            cursor.execute("SHOW COLUMNS FROM api_shop LIKE 'password'")
            if not cursor.fetchone():
                self.stdout.write(self.style.SUCCESS('✓ password column already removed'))
                cursor.close()
                conn.close()
                return
            
            self.stdout.write('Removing password column from api_shop...')
            
            # Drop password column
            cursor.execute('ALTER TABLE api_shop DROP COLUMN password')
            
            conn.commit()
            
            self.stdout.write(self.style.SUCCESS('✓ Removed password column from api_shop'))
            
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
