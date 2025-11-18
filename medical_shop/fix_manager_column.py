"""
Script to add the missing manager_id column to the database.
Run this from the medical_shop directory with your activated virtual environment.
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medical_shop.settings')
django.setup()

from django.db import connection

def add_manager_column():
    """Add the manager_id column to api_register table if it doesn't exist."""
    with connection.cursor() as cursor:
        # Check if the column exists
        cursor.execute("""
            SELECT COUNT(*) 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'api_register' 
            AND COLUMN_NAME = 'manager_id'
        """)
        
        exists = cursor.fetchone()[0]
        
        if exists == 0:
            print("Adding manager_id column...")
            
            # Add the column
            cursor.execute("""
                ALTER TABLE api_register 
                ADD COLUMN manager_id VARCHAR(10) NULL
            """)
            
            # Add foreign key constraint
            cursor.execute("""
                ALTER TABLE api_register
                ADD CONSTRAINT api_register_manager_id_fkey 
                FOREIGN KEY (manager_id) REFERENCES api_register(phone)
                ON DELETE CASCADE
            """)
            
            print("✓ manager_id column added successfully!")
        else:
            print("✓ manager_id column already exists.")
        
        # Show current structure
        cursor.execute("DESCRIBE api_register")
        columns = cursor.fetchall()
        print("\nCurrent api_register table structure:")
        for col in columns:
            print(f"  {col}")

if __name__ == '__main__':
    try:
        add_manager_column()
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
