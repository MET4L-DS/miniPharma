# Pre-Deployment Checklist ✅

## Code Preparation

- [ ] All code committed to Git
- [ ] `.gitignore` includes `.env`, `__pycache__`, `staticfiles/`
- [ ] `requirements.txt` is up to date
- [ ] All environment variables documented in `.env.example`
- [ ] Database migrations created and tested locally
- [ ] Dummy data scripts tested

## Configuration Files

- [ ] `Procfile` exists with gunicorn command
- [ ] `runtime.txt` specifies Python version
- [ ] `nixpacks.toml` or `railway.json` configured
- [ ] `requirements.txt` includes all production dependencies
- [ ] `.gitignore` excludes sensitive files

## Django Settings

- [ ] `settings.py` uses environment variables
- [ ] `DEBUG` controlled by environment variable
- [ ] `SECRET_KEY` from environment variable
- [ ] `ALLOWED_HOSTS` configurable
- [ ] Database settings support `DATABASE_URL`
- [ ] Static files configured with WhiteNoise
- [ ] CORS settings configurable
- [ ] Security settings enabled for production

## Security

- [ ] Generate new `SECRET_KEY` for production
- [ ] Set `DEBUG=False` in production
- [ ] Configure proper `ALLOWED_HOSTS`
- [ ] Set specific `CORS_ALLOWED_ORIGINS` (not allow all)
- [ ] No hardcoded passwords in code
- [ ] No sensitive data in Git repository

## Database

- [ ] MySQL service added to Railway
- [ ] `DATABASE_URL` environment variable set
- [ ] Migrations tested locally
- [ ] Migration files committed to Git
- [ ] Initial data scripts ready

## Testing

- [ ] `python manage.py check` passes
- [ ] All API endpoints tested locally
- [ ] Database connections work
- [ ] Static files collect successfully
- [ ] Gunicorn runs locally

## Railway Setup

- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Railway account created
- [ ] Railway project created from GitHub
- [ ] MySQL database provisioned
- [ ] Environment variables configured
- [ ] Custom domain configured (if applicable)

## Post-Deployment

- [ ] Migrations run on production: `railway run python manage.py migrate`
- [ ] Static files collected: `railway run python manage.py collectstatic`
- [ ] Superuser created or dummy data loaded
- [ ] API endpoints tested on production URL
- [ ] Logs checked for errors: `railway logs`
- [ ] Frontend updated with production API URL
- [ ] CORS tested from frontend
- [ ] All features tested end-to-end

## Documentation

- [ ] README.md updated with deployment info
- [ ] Environment variables documented
- [ ] API endpoints documented
- [ ] Deployment guide created
- [ ] Team/client informed of URLs

## Monitoring

- [ ] Railway dashboard bookmarked
- [ ] Logs monitoring set up
- [ ] Error tracking configured (optional)
- [ ] Uptime monitoring (optional)

---

## Quick Deploy Commands

```bash
# 1. Push to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. Railway CLI Setup
npm install -g @railway/cli
railway login
railway link

# 3. Run Post-Deployment
railway run python manage.py migrate
railway run python scripts/create_dummy_shop.py
railway run python scripts/populate_dummy_data.py

# 4. Verify
railway logs
railway open
```

---

## Production Environment Variables

```env
# Required
SECRET_KEY=<generate-new-one>
DEBUG=False
ALLOWED_HOSTS=*.railway.app
DATABASE_URL=<auto-set-by-railway>

# CORS (set to your frontend domains)
CORS_ALLOW_ALL=False
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://your-domain.com
```

---

## Common Issues Checklist

- [ ] Build fails → Check `requirements.txt` and `nixpacks.toml`
- [ ] Database errors → Verify `DATABASE_URL` is set
- [ ] CORS errors → Update `CORS_ALLOWED_ORIGINS`
- [ ] 500 errors → Check `railway logs` for Python errors
- [ ] Static files 404 → Run `collectstatic`
- [ ] Import errors → Ensure all dependencies installed

---

## Contact & Support

- Railway Support: https://railway.app/help
- Django Docs: https://docs.djangoproject.com
- Project GitHub: [Your repo URL]

---

**Date Completed**: _______________

**Deployed URL**: _______________

**Notes**: _______________________________________________
