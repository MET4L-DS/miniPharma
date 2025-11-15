# file: ./medical_shop/api/views/search_views.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection, DatabaseError
import logging
import random
from django.views.decorators.http import require_GET

logger = logging.getLogger(__name__)

@csrf_exempt
def search_medicines_with_batches(request):
    """Search for medicines with their available batches"""
    if request.method == "GET":
        search_query = request.GET.get('search', '').strip()
        if not search_query:
            return JsonResponse({'error': 'Search query is required'}, status=400)

        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT p.product_id, p.generic_name, p.brand_name, p.gst,
                    b.id as batch_id, b.batch_number, b.expiry_date, 
                    b.average_purchase_price, b.selling_price, b.quantity_in_stock
                    FROM api_product p INNER JOIN api_batch b 
                    ON p.product_id = b.product_id
                    WHERE (LOWER(p.generic_name) LIKE %s OR LOWER(p.brand_name) LIKE %s)
                    AND b.quantity_in_stock > 0
                    AND b.expiry_date > CURRENT_DATE
                    ORDER BY p.brand_name, b.expiry_date ASC
                """, [f"%{search_query.lower()}%", f"%{search_query.lower()}%"])
                
                columns = [col[0] for col in cursor.description]
                results = [
                    {
                        **dict(zip(columns, row)),
                        'average_purchase_price': float(row[7]) if row[7] is not None else 0.0,
                        'selling_price': float(row[8]) if row[8] is not None else 0.0,
                        'quantity_in_stock': int(row[9]) if row[9] is not None else 0
                    }
                    for row in cursor.fetchall()
                ]

            return JsonResponse(results, safe=False, status=200)

        except DatabaseError as e:
            logger.error(f"Database error in medicine search: {str(e)}")
            return JsonResponse({'error': 'Database error occurred'}, status=500)
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
def get_medicine_suggestions(request):
    """Get medicine suggestions for autocomplete"""
    if request.method == "GET":
        search_query = request.GET.get('q', '').strip()
        if len(search_query) < 2:
            return JsonResponse([], safe=False)

        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT DISTINCT p.product_id, p.generic_name, p.brand_name,
                           MIN(b.selling_price) as min_price,
                           SUM(b.quantity_in_stock) as total_stock
                    FROM api_product p
                    INNER JOIN api_batch b ON p.product_id = b.product_id
                    WHERE (LOWER(p.generic_name) LIKE %s OR LOWER(p.brand_name) LIKE %s)
                    AND b.quantity_in_stock > 0
                    AND b.expiry_date > CURRENT_DATE
                    GROUP BY p.product_id, p.generic_name, p.brand_name
                    ORDER BY p.brand_name
                    LIMIT 10
                """, [f"%{search_query}%", f"%{search_query}%"])
                
                columns = [col[0] for col in cursor.description]
                results = [dict(zip(columns, row)) for row in cursor.fetchall()]

            return JsonResponse(results, safe=False, status=200)

        except Exception as e:
            logger.error(f"Medicine suggestions error: {str(e)}")
            return JsonResponse({'error': 'Failed to get suggestions'}, status=500)

    return JsonResponse({'error': 'Method not allowed. Use GET.'}, status=405)
