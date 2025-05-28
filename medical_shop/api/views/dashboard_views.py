from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
import logging

logger = logging.getLogger(__name__)

@csrf_exempt
def get_dashboard_stats(request):
    """Get dashboard statistics"""
    if request.method == 'GET':
        try:
            with connection.cursor() as cursor:
                # Get total products
                cursor.execute("SELECT COUNT(*) FROM api_product")
                total_products = cursor.fetchone()[0]
                
                # Get total batches
                cursor.execute("SELECT COUNT(*) FROM api_batch")
                total_batches = cursor.fetchone()[0]
                
                # Get total orders
                cursor.execute("SELECT COUNT(*) FROM api_orders")
                total_orders = cursor.fetchone()[0]
                
                # Get low stock items (quantity < 10)
                cursor.execute("""
                    SELECT COUNT(*) FROM api_batch WHERE quantity_in_stock < 10
                """)
                low_stock_items = cursor.fetchone()[0]
                
                # Get expired items
                cursor.execute("""
                    SELECT COUNT(*) FROM api_batch WHERE expiry_date < CURRENT_DATE
                """)
                expired_items = cursor.fetchone()[0]
                
                # Get today's orders
                cursor.execute("""
                    SELECT COUNT(*) FROM api_orders WHERE DATE(order_date) = CURRENT_DATE
                """)
                todays_orders = cursor.fetchone()[0]
                
                # Get today's revenue
                cursor.execute("""
                    SELECT COALESCE(SUM(total_amount), 0) FROM api_orders 
                    WHERE DATE(order_date) = CURRENT_DATE
                """)
                todays_revenue = cursor.fetchone()[0]

            stats = {
                'total_products': total_products,
                'total_batches': total_batches,
                'total_orders': total_orders,
                'low_stock_items': low_stock_items,
                'expired_items': expired_items,
                'todays_orders': todays_orders,
                'todays_revenue': float(todays_revenue) if todays_revenue else 0.0
            }
            
            return JsonResponse(stats, status=200)
            
        except Exception as e:
            logger.error(f"Error fetching dashboard stats: {str(e)}")
            return JsonResponse({'error': 'Failed to fetch dashboard statistics'}, status=500)
    
    return JsonResponse({'error': 'Method not allowed. Use GET.'}, status=405)

@csrf_exempt
def get_expiring_soon(request):
    """Get items expiring within next 30 days"""
    if request.method == 'GET':
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT p.generic_name, p.brand_name, b.batch_number, 
                           b.expiry_date, b.quantity_in_stock
                    FROM api_product p
                    INNER JOIN api_batch b ON p.product_id = b.product_id
                    WHERE b.expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
                    AND b.quantity_in_stock > 0
                    ORDER BY b.expiry_date ASC
                """)
                
                columns = [col[0] for col in cursor.description]
                results = [dict(zip(columns, row)) for row in cursor.fetchall()]
                
            return JsonResponse(results, safe=False, status=200)
            
        except Exception as e:
            logger.error(f"Error fetching expiring items: {str(e)}")
            return JsonResponse({'error': 'Failed to fetch expiring items'}, status=500)
    
    return JsonResponse({'error': 'Method not allowed. Use GET.'}, status=405)

@csrf_exempt
def get_low_stock(request):
    """Get items with low stock (quantity < 10)"""
    if request.method == 'GET':
        try:
            threshold = int(request.GET.get('threshold', 10))
            
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT p.generic_name, p.brand_name, b.batch_number, 
                           b.quantity_in_stock, b.expiry_date
                    FROM api_product p
                    INNER JOIN api_batch b ON p.product_id = b.product_id
                    WHERE b.quantity_in_stock < %s AND b.quantity_in_stock > 0
                    ORDER BY b.quantity_in_stock ASC
                """, [threshold])
                
                columns = [col[0] for col in cursor.description]
                results = [dict(zip(columns, row)) for row in cursor.fetchall()]
                
            return JsonResponse(results, safe=False, status=200)
            
        except Exception as e:
            logger.error(f"Error fetching low stock items: {str(e)}")
            return JsonResponse({'error': 'Failed to fetch low stock items'}, status=500)
    
    return JsonResponse({'error': 'Method not allowed. Use GET.'}, status=405)
