from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = 'Drop all API tables to start fresh migration'

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            cursor.execute('SET FOREIGN_KEY_CHECKS = 0')
            
            tables = [
                'api_payment',
                'api_orderitem', 
                'api_order',
                'api_batch',
                'api_product',
                'api_staff',
                'api_shop',
                'api_register',
                'api_manager'
            ]
            
            for table in tables:
                try:
                    cursor.execute(f'DROP TABLE IF EXISTS {table}')
                    self.stdout.write(f'Dropped table: {table}')
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f'Could not drop {table}: {e}'))
            
            cursor.execute('SET FOREIGN_KEY_CHECKS = 1')
            
        self.stdout.write(self.style.SUCCESS('All API tables dropped successfully'))
