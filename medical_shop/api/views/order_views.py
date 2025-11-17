from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction
from django.db.models import F, Q, Prefetch
from api.models import Order, OrderItem, Batch, Product
import json
import logging

logger = logging.getLogger(__name__)

@csrf_exempt
def create_order(request):
    """Create a new order"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            order = Order.objects.create(
                customer_name=data.get('customer_name'),
                customer_number=data.get('customer_number'),
                doctor_name=data.get('doctor_name'),
                total_amount=data.get('total_amount', 0),
                discount_percentage=data.get('discount_percentage', 0)
            )

            return JsonResponse({'message': 'Order created successfully', 'order_id': order.order_id}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
        except Exception as e:
            logger.error(f"Error creating order: {str(e)}")
            return JsonResponse({'error': 'Failed to create order'}, status=500)

    return JsonResponse({'error': 'Method not allowed. Use POST.'}, status=405)

@csrf_exempt
def get_orders(request):
    """Get all orders with their items"""
    if request.method == 'GET':
        try:
            orders = Order.objects.prefetch_related(
                Prefetch('orderitem_set',
                        queryset=OrderItem.objects.select_related('batch__product'))
            ).order_by('-order_date')
            
            results = []
            for order in orders:
                order_data = {
                    'order_id': order.order_id,
                    'customer_name': order.customer_name,
                    'customer_number': order.customer_number,
                    'doctor_name': order.doctor_name,
                    'total_amount': float(order.total_amount) if order.total_amount else 0,
                    'discount_percentage': float(order.discount_percentage) if order.discount_percentage else 0,
                    'order_date': order.order_date.isoformat() if order.order_date else None,
                    'items': []
                }
                
                for item in order.orderitem_set.all():
                    order_data['items'].append({
                        'quantity': item.quantity,
                        'unit_price': float(item.unit_price) if item.unit_price else 0,
                        'medicine_name': item.batch.product.generic_name if item.batch and item.batch.product else 'Unknown',
                        'brand_name': item.batch.product.brand_name if item.batch and item.batch.product else 'Unknown',
                        'gst': float(item.batch.product.gst) if item.batch and item.batch.product and item.batch.product.gst else 0,
                        'batch_number': item.batch.batch_number if item.batch else 'Unknown',
                        'amount': float(item.quantity * item.unit_price) if item.quantity and item.unit_price else 0
                    })
                
                results.append(order_data)
                
            return JsonResponse(results, safe=False, status=200)
            
        except Exception as e:
            logger.error(f"Error fetching orders: {str(e)}")
            return JsonResponse({'error': 'Failed to fetch orders'}, status=500)
    
    return JsonResponse({'error': 'Method not allowed. Use GET.'}, status=405)

@csrf_exempt
def get_order_items(request, order_id):
    """Get all items for a specific order"""
    if request.method == 'GET':
        try:
            order_items = OrderItem.objects.filter(
                order_id=order_id
            ).select_related('batch__product').order_by('batch__product__generic_name')
            
            items = []
            for item in order_items:
                items.append({
                    'quantity': int(item.quantity) if item.quantity else 0,
                    'unit_price': float(item.unit_price) if item.unit_price else 0.0,
                    'medicine_name': item.batch.product.generic_name if item.batch and item.batch.product else 'Unknown Medicine',
                    'brand_name': item.batch.product.brand_name if item.batch and item.batch.product else 'Unknown Brand',
                    'gst': float(item.batch.product.gst) if item.batch and item.batch.product and item.batch.product.gst else 0.0,
                    'batch_number': item.batch.batch_number if item.batch else 'Unknown',
                    'amount': float(item.quantity * item.unit_price) if item.quantity and item.unit_price else 0.0
                })
            
            return JsonResponse(items, safe=False, status=200)
                
        except Exception as e:
            logger.error(f"Error fetching order items for order {order_id}: {str(e)}")
            return JsonResponse({'error': 'Failed to fetch order items'}, status=500)
    
    return JsonResponse({'error': 'Method not allowed. Use GET.'}, status=405)


@csrf_exempt
def update_order(request, order_id):
    """Update an existing order"""
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            
            try:
                order = Order.objects.get(order_id=order_id)
            except Order.DoesNotExist:
                return JsonResponse({'error': 'Order not found'}, status=404)
            
            # Update fields if provided
            updated = False
            
            for field in ['customer_name', 'customer_number', 'doctor_name', 'total_amount', 'discount_percentage']:
                if field in data:
                    setattr(order, field, data[field])
                    updated = True
            
            if not updated:
                return JsonResponse({'error': 'No fields to update'}, status=400)
            
            order.save()
            return JsonResponse({'message': 'Order updated successfully'}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
        except Exception as e:
            logger.error(f"Error updating order: {str(e)}")
            return JsonResponse({'error': 'Failed to update order'}, status=500)

    return JsonResponse({'error': 'Method not allowed. Use PUT.'}, status=405)

@csrf_exempt
def delete_order(request, order_id):
    """Delete an order and its related items"""
    if request.method == 'DELETE':
        try:
            try:
                order = Order.objects.get(order_id=order_id)
                # Django will cascade delete related items (payment, orderitems) automatically
                order.delete()
                return JsonResponse({'message': 'Order deleted successfully'}, status=200)
            except Order.DoesNotExist:
                return JsonResponse({'error': 'Order not found'}, status=404)

        except Exception as e:
            logger.error(f"Error deleting order: {str(e)}")
            return JsonResponse({'error': 'Failed to delete order'}, status=500)

    return JsonResponse({'error': 'Method not allowed. Use DELETE.'}, status=405)

@csrf_exempt
def add_order_items(request):
    """Add items to an order"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            order_items = data.get('items', [])

            if not order_items:
                return JsonResponse({'error': 'Order items are required'}, status=400)

            # Validate each item
            for item in order_items:
                required_fields = ['product_id', 'batch_id', 'quantity', 'unit_price']
                if not all(key in item for key in required_fields):
                    return JsonResponse({'error': f'Each item must have: {", ".join(required_fields)}'}, status=400)

            # Get the last order
            last_order = Order.objects.order_by('-order_id').first()
            
            if not last_order:
                return JsonResponse({'error': 'No orders found'}, status=400)

            # Use transaction for data consistency
            with transaction.atomic():
                for item in order_items:
                    # Get the batch
                    try:
                        batch = Batch.objects.select_for_update().get(id=item['batch_id'])
                    except Batch.DoesNotExist:
                        return JsonResponse({'error': f'Batch {item["batch_id"]} not found'}, status=400)
                    
                    # Check if stock is sufficient before updating
                    if batch.quantity_in_stock < item['quantity']:
                        return JsonResponse({
                            'error': f'Insufficient stock for product {item["product_id"]}, batch {item["batch_id"]}. Available: {batch.quantity_in_stock}'
                        }, status=400)
                    
                    # Create order item
                    OrderItem.objects.create(
                        order=last_order,
                        batch=batch,
                        unit_price=item['unit_price'],
                        quantity=item['quantity']
                    )
                    
                    # Update batch stock
                    batch.quantity_in_stock = F('quantity_in_stock') - item['quantity']
                    batch.save()

            return JsonResponse({'message': 'Order items added successfully', 'order_id': last_order.order_id}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
        except Exception as e:
            logger.error(f"Error adding order items: {str(e)}")
            return JsonResponse({'error': 'Failed to add order items'}, status=500)

    return JsonResponse({'error': 'Method not allowed. Use POST.'}, status=405)
