from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection, DatabaseError
import logging

logger = logging.getLogger(__name__)

@csrf_exempt
def search_items(request):
    """Search for products and their batches"""
    if request.method == "GET":
        search_query = request.GET.get('search', '').strip()
        if not search_query:
            return JsonResponse({'error': 'Search query is required'}, status=400)

        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT p.product_id, p.generic_name, p.brand_name,
                           b.batch_number, b.expiry_date, b.average_purchase_price, 
                           b.selling_price, b.quantity_in_stock
                    FROM api_product p
                    INNER JOIN api_batch b ON p.product_id = b.product_id
                    WHERE p.generic_name ILIKE %s OR p.brand_name ILIKE %s
                    ORDER BY b.expiry_date DESC
                """, [f"%{search_query}%", f"%{search_query}%"])
                
                columns = [col[0] for col in cursor.description]
                results = [dict(zip(columns, row)) for row in cursor.fetchall()]

            return JsonResponse(results, safe=False, status=200)

        except DatabaseError as e:
            logger.error(f"Database error in search: {str(e)}")
            return JsonResponse({'error': 'Database error occurred'}, status=500)
        except Exception as e:
            logger.error(f"Search error: {str(e)}")
            return JsonResponse({'error': 'Search failed'}, status=500)

    return JsonResponse({'error': 'Method not allowed. Use GET.'}, status=405)
