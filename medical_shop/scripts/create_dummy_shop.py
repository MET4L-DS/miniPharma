import os
import sys
from pathlib import Path
import django

# Ensure project root is on sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "medical_shop.settings")
django.setup()

from api.models import Register
from django.contrib.auth.hashers import make_password

# Create dummy shop
shop_name = "miniPharma"
name = "atul"
phone = "9876543210"
password = "9876543210"

# Hash the password
hashed_password = make_password(password)

# Check if already exists
if Register.objects.filter(phone=phone).exists():
    shop = Register.objects.get(phone=phone)
    shop.shopname = shop_name
    shop.password = hashed_password
    shop.save()
    print(f"Updated existing shop: {shop_name}")
else:
    Register.objects.create(
        shopname=shop_name, phone=phone, password=hashed_password, manager=None
    )
    print(f"Created new shop: {shop_name}")

print(f"Shop Name: {shop_name}")
print(f"Owner: {name}")
print(f"Phone: {phone}")
print(f"Password: {password}")
