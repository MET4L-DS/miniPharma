# file: ./medical_shop/api/views/search_views.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET
from django.db.models import Q, Min, Sum
from api.models import Product, Batch
from api.auth import jwt_required
import logging
import random
from datetime import date

logger = logging.getLogger(__name__)

@csrf_exempt
@jwt_required
def search_medicines_with_batches(request):
    """Search for medicines with their available batches in the authenticated shop"""
    if request.method == "GET":
        search_query = request.GET.get('search', '').strip()
        if not search_query:
            return JsonResponse({'error': 'Search query is required'}, status=400)

        try:
            shop = getattr(request, 'register_user', None)
            today = date.today()
            
            # Use Q objects for complex OR queries
            batches = Batch.objects.filter(
                Q(product__generic_name__icontains=search_query) |
                Q(product__brand_name__icontains=search_query),
                quantity_in_stock__gt=0,
                expiry_date__gt=today
            )
            if shop:
                batches = batches.filter(shop=shop)
            batches = batches.select_related('product').order_by('product__brand_name', 'expiry_date')
            
            results = []
            for b in batches:
                results.append({
                    'product_id': b.product.product_id,
                    'generic_name': b.product.generic_name,
                    'brand_name': b.product.brand_name,
                    'gst': float(b.product.gst) if b.product.gst else 0.0,
                    'batch_id': b.id,
                    'batch_number': b.batch_number,
                    'expiry_date': b.expiry_date,
                    'average_purchase_price': float(b.average_purchase_price) if b.average_purchase_price else 0.0,
                    'selling_price': float(b.selling_price),
                    'quantity_in_stock': b.quantity_in_stock
                })

            return JsonResponse(results, safe=False, status=200)

        except Exception as e:
            logger.error(f"Medicine search error: {str(e)}")
            return JsonResponse({'error': 'Search failed'}, status=500)

    return JsonResponse({'error': 'Method not allowed. Use GET.'}, status=405)


@csrf_exempt
@require_GET
def predict_salts(request):
    """
    Dummy prediction endpoint for salts needed by city and month.
    Accepts query params: month (1-12 or month name) and city (string).
    Returns a randomized list of salts (static dataset) each call.
    """
    month_param = request.GET.get('month', '').strip()
    city_param = request.GET.get('city', '').strip()

    # Basic validation
    if not city_param:
        return JsonResponse({'error': 'City parameter is required'}, status=400)

    # Helper: parse month into integer 1-12 if possible
    month_map = {
        'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
        'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
    }

    month = None
    if month_param:
        try:
            month = int(month_param)
            if not (1 <= month <= 12):
                month = None
        except ValueError:
            m = month_param[:3].lower()
            month = month_map.get(m)

    # Static dataset: for demo purposes only
    # Keys are lowercase city names; values map month -> list of salts
    static_dataset = {
        'mumbai': {
            1: ['Paracetamol', 'Amoxicillin', 'Cetirizine', 'Rabeprazole'],
            2: ['Azithromycin', 'Metformin', 'Pantoprazole'],
            3: ['Amlodipine', 'Cefixime', 'Levocetirizine'],
        },
        'delhi': {
            1: ['Cetirizine', 'Doxycycline', 'Pantoprazole'],
            2: ['Paracetamol', 'Ciprofloxacin', 'Metformin'],
            3: ['Amlodipine', 'Losartan', 'Omeprazole'],
        },
        'kolkata': {
            1: ['Paracetamol', 'Ranitidine', 'Azithromycin'],
            2: ['Levocetirizine', 'Amoxicillin', 'Metformin'],
            3: ['Cefixime', 'Atorvastatin', 'Ondansetron'],
        }
    }

    city_key = city_param.lower()
    city_data = static_dataset.get(city_key, {})

    # If month provided and we have data for it, use that; otherwise, flatten city data
    salts_pool = []
    if month and month in city_data:
        salts_pool = list(city_data[month])
    else:
        # collect all salts for the city or from all cities as fallback
        if city_data:
            for lst in city_data.values():
                salts_pool.extend(lst)
        else:
            # fallback: aggregate all salts across dataset
            for c in static_dataset.values():
                for lst in c.values():
                    salts_pool.extend(lst)

    # Ensure unique pool
    salts_pool = list(dict.fromkeys(salts_pool))

    # Randomize order every time and return a limited list
    random.shuffle(salts_pool)
    # choose first N (e.g., up to 6)
    suggested = salts_pool[:6]
    selected = suggested[0] if suggested else None

    response = {
        'month': month if month else None,
        'city': city_param,
        'predicted_salts': suggested,
        'selected_salt': selected,
        'note': 'This is a dummy prediction using a static dataset. Real model will replace this.'
    }

    return JsonResponse(response, status=200)

@csrf_exempt
@jwt_required
def get_medicine_suggestions(request):
    """Get medicine suggestions for autocomplete in the authenticated shop"""
    if request.method == "GET":
        search_query = request.GET.get('q', '').strip()
        if len(search_query) < 2:
            return JsonResponse([], safe=False)

        try:
            shop = getattr(request, 'register_user', None)
            today = date.today()
            
            # Get products with their batch information
            products = Product.objects.filter(
                Q(generic_name__icontains=search_query) |
                Q(brand_name__icontains=search_query),
                batch__quantity_in_stock__gt=0,
                batch__expiry_date__gt=today
            )
            if shop:
                products = products.filter(shop=shop)
            
            products = products.annotate(
                min_price=Min('batch__selling_price'),
                total_stock=Sum('batch__quantity_in_stock')
            ).values(
                'product_id', 'generic_name', 'brand_name', 'min_price', 'total_stock'
            ).distinct().order_by('brand_name')[:10]
            
            results = list(products)

            return JsonResponse(results, safe=False, status=200)

        except Exception as e:
            logger.error(f"Medicine suggestions error: {str(e)}")
            return JsonResponse({'error': 'Failed to get suggestions'}, status=500)

    return JsonResponse({'error': 'Method not allowed. Use GET.'}, status=405)
