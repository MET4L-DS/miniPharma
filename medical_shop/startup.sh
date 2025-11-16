#!/usr/bin/env sh
set -e

echo "[startup] Running database migrations..."
python manage.py migrate --noinput

echo "[startup] Collecting static files..."
python manage.py collectstatic --noinput

# Create a superuser non-interactively if environment variables are provided
if [ -n "${DJANGO_SUPERUSER_USERNAME-}" ] && [ -n "${DJANGO_SUPERUSER_EMAIL-}" ] && [ -n "${DJANGO_SUPERUSER_PASSWORD-}" ]; then
  echo "[startup] Creating superuser ${DJANGO_SUPERUSER_USERNAME}..."
  # Django's createsuperuser with --noinput uses DJANGO_SUPERUSER_* env vars
  python manage.py createsuperuser --noinput || true
fi

# Optional: populate dummy data if requested via environment variable
if [ "${POPULATE_DUMMY_DATA}" = "1" ] || [ "${POPULATE_DUMMY_DATA}" = "true" ]; then
  echo "[startup] Populating dummy data..."
  if [ -f "scripts/populate_dummy_data.py" ]; then
    python scripts/populate_dummy_data.py || true
  else
    echo "[startup] No populate script found at scripts/populate_dummy_data.py"
  fi
fi

echo "[startup] Starting Gunicorn..."
PORT=${PORT:-8000}
GUNICORN_WORKERS=${GUNICORN_WORKERS:-3}
exec gunicorn medical_shop.wsgi:application --bind 0.0.0.0:${PORT} --workers ${GUNICORN_WORKERS} --log-file -
