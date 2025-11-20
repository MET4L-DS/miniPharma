from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = 'Add id column to api_product table as primary key'

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            try:
                # First check the current structure
                cursor.execute("SHOW CREATE TABLE api_product")
                create_table = cursor.fetchone()[1]
                self.stdout.write(f'Current table structure:\n{create_table}\n')

                # Check if id column exists
                cursor.execute("""
                    SELECT COUNT(*)
                    FROM information_schema.COLUMNS
                    WHERE TABLE_SCHEMA = DATABASE()
                    AND TABLE_NAME = 'api_product'
                    AND COLUMN_NAME = 'id'
                """)
                id_exists = cursor.fetchone()[0] > 0

                if id_exists:
                    self.stdout.write(self.style.SUCCESS('id column already exists in api_product'))
                    return

                # Check for existing primary key
                cursor.execute("""
                    SELECT COLUMN_NAME
                    FROM information_schema.KEY_COLUMN_USAGE
                    WHERE TABLE_SCHEMA = DATABASE()
                    AND TABLE_NAME = 'api_product'
                    AND CONSTRAINT_NAME = 'PRIMARY'
                """)
                pk_columns = [row[0] for row in cursor.fetchall()]
                
                if pk_columns:
                    self.stdout.write(f'Found existing primary key on: {", ".join(pk_columns)}')
                    self.stdout.write('Dropping existing primary key...')
                    cursor.execute("ALTER TABLE api_product DROP PRIMARY KEY")
                
                # Add id column as auto-increment primary key
                self.stdout.write('Adding id column to api_product...')
                cursor.execute("""
                    ALTER TABLE api_product
                    ADD COLUMN id INT AUTO_INCREMENT PRIMARY KEY FIRST
                """)
                
                self.stdout.write(self.style.SUCCESS('Successfully added id column to api_product'))

            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error: {str(e)}'))
                raise
