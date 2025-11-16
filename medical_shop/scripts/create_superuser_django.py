import os
import sys
from pathlib import Path
import django

# Ensure project root is on sys.path so `import medical_shop` works
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "medical_shop.settings")
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()
username = "admin"
email = "admin@example.com"
password = "adminpass"

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username=username, email=email, password=password)
    print(f"Superuser '{username}' created with password '{password}'.")
else:
    print(f"Superuser '{username}' already exists.")
