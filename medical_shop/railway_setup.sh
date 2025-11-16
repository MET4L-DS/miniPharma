#!/bin/bash
# Railway deployment setup script
# Run this after deploying to Railway

echo "=== Railway Django Setup ==="
echo ""

# Run migrations
echo "Running database migrations..."
railway run python manage.py migrate

echo ""
echo "Creating superuser..."
railway run python scripts/create_superuser_django.py

echo ""
echo "Populating dummy data..."
railway run python scripts/create_dummy_shop.py
railway run python scripts/populate_dummy_data.py

echo ""
echo "=== Setup Complete! ==="
echo ""
echo "Your API should be ready at: https://your-service.railway.app"
echo ""
echo "Next steps:"
echo "1. Update CORS_ALLOWED_ORIGINS with your frontend URL"
echo "2. Set a new SECRET_KEY in Railway dashboard"
echo "3. Verify DEBUG=False in Railway environment variables"
