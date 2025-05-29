# file: ./medical_shop/api/views/search_views.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection, DatabaseError
import logging

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
