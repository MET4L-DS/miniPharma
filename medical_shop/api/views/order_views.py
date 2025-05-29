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
    """Get all orders with their items"""
    if request.method == 'GET':
        try:
            with connection.cursor() as cursor:
                # Query to get orders with their items
                cursor.execute("""
                    SELECT 
                        o.order_id,
                        o.customer_name,
                        o.customer_number,
                        o.doctor_name,
                        o.total_amount,
                        o.discount_percentage,
                        o.order_date,
                        oi.quantity,
                        oi.unit_price,
                        p.generic_name,
                        p.brand_name,
                        p.gst,
                        b.batch_number,
                        (oi.quantity * oi.unit_price) as amount
                    FROM api_order o
                    LEFT JOIN api_orderitem oi ON o.order_id = oi.order_id
                    LEFT JOIN api_product p ON oi.product_id = p.product_id
                    LEFT JOIN api_batch b ON oi.batch_id = b.id
                    ORDER BY o.order_date DESC
                """)
                rows = cursor.fetchall()
                
                # Group items by order
                orders_dict = {}
                for row in rows:
                    order_id = row[0]
                    if order_id not in orders_dict:
                        orders_dict[order_id] = {
                            'order_id': order_id,
                            'customer_name': row[1],
                            'customer_number': row[2],
                            'doctor_name': row[3],
                            'total_amount': float(row[4]) if row[4] else 0,
                            'discount_percentage': float(row[5]) if row[5] else 0,
                            'order_date': row[6].isoformat() if row[6] else None,
                            'items': []
                        }
                    
                    if row[7] is not None:  # If there are items
                        orders_dict[order_id]['items'].append({
                            'quantity': row[7],
                            'unit_price': float(row[8]) if row[8] else 0,
                            'medicine_name': row[9],
                            'brand_name': row[10],
                            'gst': float(row[11]) if row[11] else 0,
                            'batch_number': row[12],
                            'amount': float(row[13]) if row[13] else 0
                        })
                
                results = list(orders_dict.values())
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
            with connection.cursor() as cursor:
                cursor.execute("""
                SELECT
                    oi.quantity,
                    oi.unit_price,
                    COALESCE(p.generic_name, 'Unknown Medicine') as medicine_name,
                    COALESCE(p.brand_name, 'Unknown Brand') as brand_name,
                    COALESCE(p.gst, 0) as gst,
                    COALESCE(b.batch_number, 'Unknown') as batch_number,
                    (oi.quantity * oi.unit_price) as amount
                FROM api_orderitem oi
                LEFT JOIN api_product p ON oi.product_id = p.product_id
                LEFT JOIN api_batch b ON oi.batch_id = b.id
                WHERE oi.order_id = %s
                ORDER BY p.generic_name
                """, [order_id])
                
                rows = cursor.fetchall()
                
                items = []
                for row in rows:
                    items.append({
                        'quantity': int(row[0]) if row[0] else 0,
                        'unit_price': float(row[1]) if row[1] else 0.0,
                        'medicine_name': row[2],
                        'brand_name': row[3],
                        'gst': float(row[4]) if row[4] else 0.0,
                        'batch_number': row[5],
                        'amount': float(row[6]) if row[6] else 0.0
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
