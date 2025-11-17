# Railway Deployment Guide for miniPharma Django Backend

## Prerequisites
1. GitHub account
2. Railway.app account (sign up at https://railway.app)
3. Push your code to a GitHub repository

## Step 1: Push Code to GitHub

```bash
cd c:\vbox\miniPharma\medical_shop
git init
git add .
git commit -m "Initial commit for Railway deployment"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

## Step 2: Create Railway Project

1. Go to https://railway.app
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Authorize Railway to access your GitHub
5. Select your repository (`miniPharma` or whatever you named it)
6. Railway will detect it's a Python project

## Step 3: Add MySQL Database

1. In your Railway project, click "+ New"
2. Select "Database" → "MySQL"
3. Railway will create a MySQL instance
4. It will automatically set the `DATABASE_URL` environment variable

## Step 4: Set Environment Variables

In your Railway project settings, go to "Variables" and add:

```
SECRET_KEY=your-super-secret-key-here-generate-a-new-one
DEBUG=False
ALLOWED_HOSTS=*.railway.app
CORS_ALLOW_ALL=False
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com,https://another-domain.com
```

**Generate a new SECRET_KEY** using Python:
```python
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

## Step 5: Configure Build & Deploy

Railway should auto-detect the `Procfile` and `requirements.txt`.

The following files handle the deployment:
- `Procfile` - Tells Railway to run gunicorn
- `requirements.txt` - Python dependencies
- `runtime.txt` - Python version
- `railway.json` - Railway configuration

## Step 6: Run Migrations

After the first deployment, you need to run migrations:

1. In Railway dashboard, go to your service
2. Click on "Settings" tab
3. Scroll to "Deploy" section
4. You can run commands in the Railway CLI or add a startup script

**Option A: Use Railway CLI**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run migrations
railway run python manage.py migrate

# Create superuser (optional)
railway run python manage.py createsuperuser
```

**Option B: Add to Procfile (one-time setup)**
Create a separate migration command or use the Django admin to verify.

## Step 7: Populate Initial Data

```bash
# Run the dummy data script
railway run python scripts/create_dummy_shop.py
railway run python scripts/populate_dummy_data.py
```

## Step 8: Access Your API

Your backend will be available at:
```
https://your-service-name.railway.app
```

Test endpoints:
- `https://your-service-name.railway.app/api/products/`
- `https://your-service-name.railway.app/api/login/`
- `https://your-service-name.railway.app/admin/`

## Important Notes

1. **Database Connection**: Railway provides `DATABASE_URL` automatically. Don't manually configure MySQL credentials.

2. **Static Files**: WhiteNoise serves static files in production. Run `python manage.py collectstatic` before deployment (Railway does this automatically).

3. **CORS**: Update `CORS_ALLOWED_ORIGINS` with your frontend URL once deployed.

4. **Logs**: View logs in Railway dashboard under "Deployments" → "Logs"

5. **Domain**: Railway provides a free subdomain. You can add custom domains in settings.

## Environment Variables Summary

Railway will automatically set:
- `DATABASE_URL` (from MySQL service)
- `PORT` (Railway assigns this)

You must set:
- `SECRET_KEY` (generate new one)
- `DEBUG=False`
- `ALLOWED_HOSTS=*.railway.app` (or your custom domain)
- `CORS_ALLOWED_ORIGINS=https://your-frontend.com`

## Troubleshooting

**Build fails?**
- Check logs in Railway dashboard
- Verify `requirements.txt` has all dependencies
- Ensure Python version in `runtime.txt` is supported

**Database connection issues?**
- Verify MySQL service is running
- Check `DATABASE_URL` is set
- Review logs for connection errors

**Static files not loading?**
- Run `railway run python manage.py collectstatic`
- Check `STATIC_ROOT` and `STATIC_URL` settings

**Migration issues?**
- Run `railway run python manage.py migrate`
- Check database permissions

## Local Testing with Production Settings

Test production settings locally:
```bash
# Set DEBUG=False in .env
DEBUG=False

# Run collectstatic
python manage.py collectstatic --noinput

# Test with gunicorn
gunicorn medical_shop.wsgi
```

## Support

- Railway Docs: https://docs.railway.app
- Django Deployment: https://docs.djangoproject.com/en/5.2/howto/deployment/
