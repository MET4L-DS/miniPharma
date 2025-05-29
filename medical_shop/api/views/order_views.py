from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection, transaction
import json
import logging

logger = logging.getLogger(__name__)

@csrf_exempt
def create_order(request):
    """Create a new order"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO api_order (customer_name, customer_number, doctor_name, 
                                          total_amount, discount_percentage)
                    VALUES (%s, %s, %s, %s, %s)
                """, [
                    data.get('customer_name'), data.get('customer_number'), 
                    data.get('doctor_name'), data.get('total_amount', 0),
                    data.get('discount_percentage', 0)
                ])
                
                # Get the created order ID
                cursor.execute("SELECT LAST_INSERT_ID()")
                order_id = cursor.fetchone()[0]

            return JsonResponse({'message': 'Order created successfully', 'order_id': order_id}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
        except Exception as e:
            logger.error(f"Error creating order: {str(e)}")
            return JsonResponse({'error': 'Failed to create order'}, status=500)

    return JsonResponse({'error': 'Method not allowed. Use POST.'}, status=405)

@csrf_exempt
def get_orders(request):
    """Get all orders"""
    if request.method == 'GET':
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT order_id, customer_name, customer_number, doctor_name, 
                           total_amount, discount_percentage, order_date
                    FROM api_order
                    ORDER BY order_date DESC
                """)
                columns = [col[0] for col in cursor.description]
                results = [dict(zip(columns, row)) for row in cursor.fetchall()]
                
            return JsonResponse(results, safe=False, status=200)
            
        except Exception as e:
            logger.error(f"Error fetching orders: {str(e)}")
            return JsonResponse({'error': 'Failed to fetch orders'}, status=500)
    
    return JsonResponse({'error': 'Method not allowed. Use GET.'}, status=405)

@csrf_exempt
def update_order(request, order_id):
    """Update an existing order"""
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            
            with connection.cursor() as cursor:
                # Check if order exists
                cursor.execute("SELECT 1 FROM api_order WHERE order_id = %s", [order_id])
                if not cursor.fetchone():
                    return JsonResponse({'error': 'Order not found'}, status=404)
                
                # Build dynamic update query
                update_fields = []
                values = []
                
                for field in ['customer_name', 'customer_number', 'doctor_name', 'total_amount', 'discount_percentage']:
                    if field in data:
                        update_fields.append(f"{field} = %s")
                        values.append(data[field])
                
                if not update_fields:
                    return JsonResponse({'error': 'No fields to update'}, status=400)
                
                values.append(order_id)
                cursor.execute(f"""
                    UPDATE api_order 
                    SET {', '.join(update_fields)}
                    WHERE order_id = %s
                """, values)

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
            with connection.cursor() as cursor:
                # Check if order exists
                cursor.execute("SELECT 1 FROM api_order WHERE order_id = %s", [order_id])
                if not cursor.fetchone():
                    return JsonResponse({'error': 'Order not found'}, status=404)
                
                # Delete in order: payment -> order_items -> order
                cursor.execute("DELETE FROM api_payment WHERE order_id = %s", [order_id])
                cursor.execute("DELETE FROM api_orderitem WHERE order_id = %s", [order_id])
                cursor.execute("DELETE FROM api_order WHERE order_id = %s", [order_id])

            return JsonResponse({'message': 'Order deleted successfully'}, status=200)

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

            # Get the last order_id
            with connection.cursor() as cursor:
                cursor.execute("SELECT MAX(order_id) FROM api_order")
                last_order_id = cursor.fetchone()[0]
                
                if not last_order_id:
                    return JsonResponse({'error': 'No orders found'}, status=400)

                # Use transaction for data consistency
                with transaction.atomic():
                    for item in order_items:
                        # Insert order item with product_id
                        cursor.execute("""
                            INSERT INTO api_orderitem 
                            (order_id, batch_id, product_id, unit_price, quantity)
                            VALUES (%s, %s, %s, %s, %s)
                        """, [
                            last_order_id, 
                            item['batch_id'],
                            item['product_id'],
                            item['unit_price'], 
                            item['quantity']
                        ])

                        # Update batch stock
                        cursor.execute("""
                            UPDATE api_batch
                            SET quantity_in_stock = quantity_in_stock - %s
                            WHERE id = %s
                        """, [item['quantity'], item['batch_id']])

                        # Check if stock is sufficient
                        cursor.execute("""
                            SELECT quantity_in_stock
                            FROM api_batch
                            WHERE id = %s
                        """, [item['batch_id']])
                        
                        result = cursor.fetchone()
                        if not result or result[0] < 0:
                            return JsonResponse({
                                'error': f'Insufficient stock for product {item["product_id"]}, batch {item["batch_id"]}'
                            }, status=400)

            return JsonResponse({'message': 'Order items added successfully', 'order_id': last_order_id}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
        except Exception as e:
            logger.error(f"Error adding order items: {str(e)}")
            return JsonResponse({'error': 'Failed to add order items'}, status=500)

    return JsonResponse({'error': 'Method not allowed. Use POST.'}, status=405)
