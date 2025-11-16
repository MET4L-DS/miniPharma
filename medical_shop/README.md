# miniPharma Django Backend

Medical shop management system backend built with Django and MySQL.

## Features

- 🔐 User authentication and registration
- 💊 Product and batch management
- 🛒 Order processing and billing
- 💳 Payment tracking (UPI/Cash)
- 📊 Sales analytics and dashboard data
- 🔍 Product search functionality

## Tech Stack

- **Framework**: Django 5.2.8
- **Database**: MySQL
- **API**: Django REST Framework
- **CORS**: django-cors-headers
- **Production Server**: Gunicorn
- **Static Files**: WhiteNoise

## Local Development Setup

### Prerequisites

- Python 3.13+
- MySQL Server
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd miniPharma/medical_shop
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

5. **Create database**
   ```bash
   python scripts/drop_and_create_db.py
   ```

6. **Run migrations**
   ```bash
   python manage.py migrate
   ```

7. **Create superuser**
   ```bash
   python scripts/create_superuser_django.py
   # Or manually: python manage.py createsuperuser
   ```

8. **Load dummy data (optional)**
   ```bash
   python scripts/create_dummy_shop.py
   python scripts/populate_dummy_data.py
   ```

9. **Run development server**
   ```bash
   python manage.py runserver
   ```

The API will be available at http://localhost:8000/

## API Endpoints

### Authentication
- `POST /api/register/` - Register new user
- `POST /api/login/` - User login
- `GET /api/users/` - Get all users

### Products
- `GET /api/products/` - List all products
- `POST /api/products/create/` - Create product
- `PUT /api/products/<id>/update/` - Update product
- `DELETE /api/products/<id>/delete/` - Delete product

### Batches
- `GET /api/batches/` - List all batches
- `GET /api/batches/product/<product_id>/` - Get batches for product
- `POST /api/batches/create/` - Create batch
- `PUT /api/batches/<id>/update/` - Update batch
- `DELETE /api/batches/<id>/delete/` - Delete batch

### Orders
- `GET /api/orders/` - List all orders
- `GET /api/orders/<id>/` - Get order details
- `POST /api/orders/create/` - Create order
- `GET /api/orders/recent/` - Get recent orders

### Payments
- `GET /api/payments/` - List all payments
- `POST /api/payments/create/` - Create payment
- `GET /api/payments/order/<order_id>/` - Get payment for order

### Dashboard
- `GET /api/dashboard/stats/` - Get dashboard statistics
- `GET /api/dashboard/sales/` - Get sales data

### Search
- `GET /api/search/?q=<query>` - Search products

## Railway Deployment

See [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md) for detailed deployment instructions.

**Quick steps:**

1. Push code to GitHub
2. Create Railway project from GitHub repo
3. Add MySQL database service
4. Set environment variables in Railway dashboard
5. Deploy automatically
6. Run migrations using Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and link project
railway login
railway link

# Run migrations
railway run python manage.py migrate

# Setup initial data
bash railway_setup.sh
```

## Environment Variables

### Required for Production (Railway)

```env
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=*.railway.app,your-domain.com
DATABASE_URL=mysql://... (Railway provides this)
CORS_ALLOWED_ORIGINS=https://your-frontend.com
```

### Local Development

```env
SECRET_KEY=django-insecure-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DB_NAME=DBMSProj
DB_USER=root
DB_PASSWORD=root
DB_HOST=localhost
DB_PORT=3306
CORS_ALLOW_ALL=True
```

## Project Structure

```
medical_shop/
├── api/                    # Main API app
│   ├── models.py          # Database models
│   ├── urls.py            # API routes
│   └── views/             # API views
│       ├── user_views.py
│       ├── product_views.py
│       ├── batch_views.py
│       ├── order_views.py
│       ├── payment_views.py
│       ├── dashboard_views.py
│       └── search_views.py
├── medical_shop/          # Project settings
│   ├── settings.py        # Django settings
│   ├── urls.py            # Main URL config
│   └── wsgi.py            # WSGI config
├── scripts/               # Utility scripts
│   ├── create_db.py
│   ├── create_dummy_shop.py
│   ├── create_superuser_django.py
│   └── populate_dummy_data.py
├── requirements.txt       # Python dependencies
├── Procfile              # Railway/Heroku config
├── runtime.txt           # Python version
├── nixpacks.toml         # Railway build config
└── manage.py             # Django CLI
```

## Database Models

- **Product** - Medicine products with brand/generic names
- **Batch** - Product batches with expiry, price, stock
- **Order** - Customer orders with billing info
- **OrderItem** - Line items in orders
- **Payment** - Payment records (UPI/Cash)
- **Register** - Shop/user registration

## Scripts

### create_db.py / drop_and_create_db.py
Creates or recreates the MySQL database.

### create_dummy_shop.py
Creates a test shop account:
- Shop: miniPharma
- Phone: 9876543210
- Password: 9876543210

### populate_dummy_data.py
Populates database with:
- 20 medicine products
- 48 product batches
- 30 orders with payments
- Realistic sales data

### create_superuser_django.py
Creates Django admin superuser:
- Username: admin
- Password: adminpass

## Testing

```bash
# Run Django checks
python manage.py check

# Test database connection
python manage.py dbshell

# Collect static files
python manage.py collectstatic

# Test with gunicorn (production server)
gunicorn medical_shop.wsgi
```

## Common Issues

### Database Connection Error
- Ensure MySQL is running
- Check database credentials in `.env`
- Verify database `DBMSProj` exists

### Module Import Errors
- Activate virtual environment
- Install dependencies: `pip install -r requirements.txt`

### CORS Issues
- Add frontend URL to `CORS_ALLOWED_ORIGINS`
- Or set `CORS_ALLOW_ALL=True` for development

### Static Files Not Loading
- Run `python manage.py collectstatic`
- Check `STATIC_ROOT` setting
- Verify WhiteNoise middleware is enabled

## License

[Your License Here]

## Support

For issues and questions, please open an issue on GitHub.
