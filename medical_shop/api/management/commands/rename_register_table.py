from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = 'Rename api_register table to api_shop'

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            # Check if api_register exists and api_shop doesn't
            cursor.execute("SHOW TABLES LIKE 'api_register'")
            register_exists = cursor.fetchone()
            
            cursor.execute("SHOW TABLES LIKE 'api_shop'")
            shop_exists = cursor.fetchone()
            
            if register_exists and not shop_exists:
                self.stdout.write('Renaming api_register to api_shop...')
                cursor.execute('RENAME TABLE api_register TO api_shop')
                self.stdout.write(self.style.SUCCESS('✓ Renamed api_register to api_shop'))
            elif shop_exists and not register_exists:
                self.stdout.write(self.style.SUCCESS('✓ Table api_shop already exists'))
            elif register_exists and shop_exists:
                self.stdout.write(self.style.WARNING('⚠ Both api_register and api_shop exist!'))
            else:
                self.stdout.write(self.style.ERROR('✗ Neither table exists'))
                
            # Show all tables
            self.stdout.write('\nCurrent tables:')
            cursor.execute("SHOW TABLES LIKE 'api_%'")
            for table in cursor.fetchall():
                self.stdout.write(f'  - {table[0]}')
