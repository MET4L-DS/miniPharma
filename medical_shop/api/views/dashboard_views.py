from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Count, Sum, Q, F
from django.utils import timezone
from datetime import timedelta, date
from api.models import Product, Batch, Order
import logging

logger = logging.getLogger(__name__)

@csrf_exempt
def get_dashboard_stats(request):
    """Get dashboard statistics"""
    if request.method == 'GET':
        try:
            # Get total products
            total_products = Product.objects.count()
            
            # Get total batches
            total_batches = Batch.objects.count()
            
            # Get total orders
            total_orders = Order.objects.count()
            
            # Get low stock items (quantity < 10)
            low_stock_items = Batch.objects.filter(quantity_in_stock__lt=10).count()
            
            # Get expired items
            today = date.today()
            expired_items = Batch.objects.filter(expiry_date__lt=today).count()
            
            # Get today's orders
            todays_orders = Order.objects.filter(order_date__date=today).count()
            
            # Get today's revenue
            todays_revenue_data = Order.objects.filter(
                order_date__date=today
            ).aggregate(total=Sum('total_amount'))
            todays_revenue = float(todays_revenue_data['total']) if todays_revenue_data['total'] else 0.0

            stats = {
                'total_products': total_products,
                'total_batches': total_batches,
                'total_orders': total_orders,
                'low_stock_items': low_stock_items,
                'expired_items': expired_items,
                'todays_orders': todays_orders,
                'todays_revenue': todays_revenue
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
            today = date.today()
            thirty_days_later = today + timedelta(days=30)
            
            batches = Batch.objects.filter(
                expiry_date__range=(today, thirty_days_later),
                quantity_in_stock__gt=0
            ).select_related('product').order_by('expiry_date')
            
            results = [{
                'generic_name': b.product.generic_name,
                'brand_name': b.product.brand_name,
                'batch_number': b.batch_number,
                'expiry_date': b.expiry_date,
                'quantity_in_stock': b.quantity_in_stock
            } for b in batches]
            
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
            
            batches = Batch.objects.filter(
                quantity_in_stock__lt=threshold,
                quantity_in_stock__gt=0
            ).select_related('product').order_by('quantity_in_stock')
            
            results = [{
                'generic_name': b.product.generic_name,
                'brand_name': b.product.brand_name,
                'batch_number': b.batch_number,
                'quantity_in_stock': b.quantity_in_stock,
                'expiry_date': b.expiry_date
            } for b in batches]
            
            return JsonResponse(results, safe=False, status=200)
            
        except Exception as e:
            logger.error(f"Error fetching low stock items: {str(e)}")
            return JsonResponse({'error': 'Failed to fetch low stock items'}, status=500)
    
    return JsonResponse({'error': 'Method not allowed. Use GET.'}, status=405)

@csrf_exempt
def get_sales_data(request):
    """Get daily sales revenue for the past N days"""
    if request.method == 'GET':
        try:
            days = int(request.GET.get('days', 30))
            
            # Calculate the date N days ago
            start_date = date.today() - timedelta(days=days)
            
            # Query to get daily revenue using ORM
            from django.db.models.functions import TruncDate
            
            sales_data = Order.objects.filter(
                order_date__gte=start_date
            ).annotate(
                date=TruncDate('order_date')
            ).values('date').annotate(
                revenue=Sum('total_amount')
            ).order_by('date')
            
            results = []
            for item in sales_data:
                results.append({
                    'date': item['date'].isoformat() if item['date'] else None,
                    'revenue': float(item['revenue']) if item['revenue'] else 0.0
                })
            
            return JsonResponse(results, safe=False, status=200)
            
        except Exception as e:
            logger.error(f"Error fetching sales data: {str(e)}")
            return JsonResponse({'error': 'Failed to fetch sales data'}, status=500)
    
    return JsonResponse({'error': 'Method not allowed. Use GET.'}, status=405)
