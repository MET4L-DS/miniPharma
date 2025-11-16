# Railway Deployment Quick Reference

## 🚀 Initial Setup (One-time)

### 1. Prepare Git Repository
```bash
cd c:\vbox\miniPharma\medical_shop
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 2. Create Railway Project
- Go to https://railway.app
- Click "New Project" → "Deploy from GitHub"
- Select your repository
- Railway auto-detects Python and starts building

### 3. Add MySQL Database
- In Railway project, click "+ New"
- Select "Database" → "MySQL"
- Railway automatically creates `DATABASE_URL` variable

### 4. Set Environment Variables
Go to your service → Variables tab:

```env
SECRET_KEY=<generate-new-secret-key>
DEBUG=False
ALLOWED_HOSTS=*.railway.app
CORS_ALLOW_ALL=False
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

**Generate SECRET_KEY:**
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 5. Deploy & Run Migrations

Install Railway CLI:
```bash
npm install -g @railway/cli
```

Login and setup:
```bash
railway login
railway link  # Select your project
```

Run migrations:
```bash
railway run python manage.py migrate
```

Load initial data:
```bash
railway run python scripts/create_dummy_shop.py
railway run python scripts/populate_dummy_data.py
```

### 6. Get Your URL
- Go to Settings → Networking → Generate Domain
- Your API: `https://your-service.up.railway.app`

---

## 📝 Environment Variables Reference

### Production (Railway) - Required
| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | Auto-set by Railway | MySQL connection string |
| `SECRET_KEY` | Generate new one | Use Django's get_random_secret_key() |
| `DEBUG` | `False` | Always False in production |
| `ALLOWED_HOSTS` | `*.railway.app` | Add custom domains if needed |
| `CORS_ALLOWED_ORIGINS` | `https://frontend.com` | Comma-separated list |

### Optional
| Variable | Default | Purpose |
|----------|---------|---------|
| `CORS_ALLOW_ALL` | `False` | Allow all origins (not recommended) |
| `PORT` | Auto-set | Railway assigns this automatically |

---

## 🔧 Common Commands

### Deploy New Changes
```bash
git add .
git commit -m "Your changes"
git push origin main
# Railway auto-deploys
```

### View Logs
```bash
railway logs
```

### Run Management Commands
```bash
railway run python manage.py <command>
```

### Open Railway Dashboard
```bash
railway open
```

### Connect to MySQL
```bash
railway connect MySQL
```

---

## 🐛 Troubleshooting

### Build Fails
**Error**: `mysqlclient` build error
**Fix**: Already handled in `nixpacks.toml` with pkg-config

**Error**: Module not found
**Fix**: Ensure all dependencies in `requirements.txt`

### Database Connection Failed
**Check**:
1. MySQL service is running in Railway
2. `DATABASE_URL` variable exists
3. View logs: `railway logs`

### Static Files Not Loading
**Fix**:
```bash
railway run python manage.py collectstatic --noinput
```

### CORS Errors in Frontend
**Fix**: Update `CORS_ALLOWED_ORIGINS` in Railway variables:
```
https://your-frontend.vercel.app,https://your-other-domain.com
```

### 500 Internal Server Error
**Debug**:
```bash
railway logs --tail 100
```
Check for Python errors, database issues, or missing migrations.

---

## 📊 Health Check

### Test API Endpoints
```bash
# Health check (if you add one)
curl https://your-service.railway.app/api/products/

# Login
curl -X POST https://your-service.railway.app/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210","password":"9876543210"}'
```

### Database Check
```bash
railway run python manage.py dbshell
```

---

## 🔄 Update Process

1. Make changes locally
2. Test locally: `python manage.py runserver`
3. Commit: `git commit -am "Your message"`
4. Push: `git push origin main`
5. Railway auto-deploys
6. Run migrations if needed: `railway run python manage.py migrate`

---

## 💰 Railway Free Tier

- **$5/month free credits**
- Enough for small projects
- Sleeps after inactivity (can disable)
- 512MB RAM, 1GB storage

---

## 🔗 Important URLs

| Resource | URL |
|----------|-----|
| Railway Dashboard | https://railway.app/dashboard |
| Railway Docs | https://docs.railway.app |
| Your Service | https://your-service.up.railway.app |
| MySQL Admin | Use Railway dashboard or CLI |

---

## 📞 Need Help?

1. Check Railway logs: `railway logs`
2. View build logs in Railway dashboard
3. Railway Discord: https://discord.gg/railway
4. Django docs: https://docs.djangoproject.com

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Railway project created
- [ ] MySQL database added
- [ ] Environment variables set
- [ ] SECRET_KEY generated (new one)
- [ ] DEBUG=False
- [ ] ALLOWED_HOSTS configured
- [ ] CORS_ALLOWED_ORIGINS set
- [ ] Migrations run
- [ ] Initial data loaded
- [ ] API tested
- [ ] Frontend updated with API URL

---

## 🎯 Quick Copy-Paste Commands

```bash
# Complete setup (after Railway project created)
railway login
railway link
railway run python manage.py migrate
railway run python scripts/create_dummy_shop.py
railway run python scripts/populate_dummy_data.py
railway open
```

---

**Your Backend URL**: `https://your-service.up.railway.app`

Update this URL in your frontend's API configuration! 🚀
