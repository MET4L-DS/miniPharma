from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = 'Remove contact_number column from api_shop table'

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            try:
                # Check if contact_number column exists
                cursor.execute("""
                    SELECT COUNT(*)
                    FROM information_schema.COLUMNS
                    WHERE TABLE_SCHEMA = DATABASE()
                    AND TABLE_NAME = 'api_shop'
                    AND COLUMN_NAME = 'contact_number'
                """)
                column_exists = cursor.fetchone()[0] > 0

                if not column_exists:
                    self.stdout.write(self.style.SUCCESS('contact_number column does not exist in api_shop'))
                    return

                # Drop the contact_number column
                self.stdout.write('Removing contact_number column from api_shop...')
                cursor.execute("""
                    ALTER TABLE api_shop
                    DROP COLUMN contact_number
                """)
                
                self.stdout.write(self.style.SUCCESS('Successfully removed contact_number column from api_shop'))

            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error: {str(e)}'))
                raise
