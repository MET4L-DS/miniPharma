from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
import json
import logging

logger = logging.getLogger(__name__)

@csrf_exempt
def add_payment(request):
    """Add payment for an order"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            payments = data.get('payments', [])

            if not payments:
                return JsonResponse({'error': 'Payment data is required'}, status=400)

            # Validate each payment
            for payment in payments:
                if not all(key in payment for key in ['payment_type', 'transaction_amount']):
                    return JsonResponse({'error': 'Each payment must have payment_type and transaction_amount'}, status=400)

            # Get the last order_id
            with connection.cursor() as cursor:
                cursor.execute("SELECT MAX(order_id) FROM api_orders")
                last_order_id = cursor.fetchone()[0]

                if not last_order_id:
                    return JsonResponse({'error': 'No orders found'}, status=400)

                # Insert payments
                for payment in payments:
                    cursor.execute("""
                        INSERT INTO api_payment (order_id, payment_type, transaction_amount)
                        VALUES (%s, %s, %s)
                    """, [last_order_id, payment['payment_type'], payment['transaction_amount']])

            return JsonResponse({'message': 'Payments added successfully', 'order_id': last_order_id}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
        except Exception as e:
            logger.error(f"Error adding payment: {str(e)}")
            return JsonResponse({'error': 'Failed to add payment'}, status=500)

    return JsonResponse({'error': 'Method not allowed. Use POST.'}, status=405)

@csrf_exempt
def update_payment(request, order_id):
    """Update payment for an order"""
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            
            with connection.cursor() as cursor:
                # Check if payment exists
                cursor.execute("SELECT 1 FROM api_payment WHERE order_id = %s", [order_id])
                if not cursor.fetchone():
                    return JsonResponse({'error': 'Payment not found'}, status=404)
                
                # Build dynamic update query
                update_fields = []
                values = []
                
                for field in ['payment_type', 'transaction_amount']:
                    if field in data:
                        update_fields.append(f"{field} = %s")
                        values.append(data[field])
                
                if not update_fields:
                    return JsonResponse({'error': 'No fields to update'}, status=400)
                
                values.append(order_id)
                cursor.execute(f"""
                    UPDATE api_payment 
                    SET {', '.join(update_fields)}
                    WHERE order_id = %s
                """, values)

            return JsonResponse({'message': 'Payment updated successfully'}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
        except Exception as e:
            logger.error(f"Error updating payment: {str(e)}")
            return JsonResponse({'error': 'Failed to update payment'}, status=500)

    return JsonResponse({'error': 'Method not allowed. Use PUT.'}, status=405)

@csrf_exempt
def delete_payment(request, order_id):
    """Delete payment for an order"""
    if request.method == 'DELETE':
        try:
            with connection.cursor() as cursor:
                # Check if payment exists
                cursor.execute("SELECT 1 FROM api_payment WHERE order_id = %s", [order_id])
                if not cursor.fetchone():
                    return JsonResponse({'error': 'Payment not found'}, status=404)
                
                cursor.execute("DELETE FROM api_payment WHERE order_id = %s", [order_id])

            return JsonResponse({'message': 'Payment deleted successfully'}, status=200)

        except Exception as e:
            logger.error(f"Error deleting payment: {str(e)}")
            return JsonResponse({'error': 'Failed to delete payment'}, status=500)

    return JsonResponse({'error': 'Method not allowed. Use DELETE.'}, status=405)

@csrf_exempt
def get_payments(request):
    """Get all payments"""
    if request.method == 'GET':
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT p.order_id, p.payment_type, p.transaction_amount,
                           o.customer_name, o.total_amount, o.order_date
                    FROM api_payment p
                    LEFT JOIN api_orders o ON p.order_id = o.order_id
                    ORDER BY o.order_date DESC
                """)
                columns = [col[0] for col in cursor.description]
                results = [dict(zip(columns, row)) for row in cursor.fetchall()]
                
            return JsonResponse(results, safe=False, status=200)
            
        except Exception as e:
            logger.error(f"Error fetching payments: {str(e)}")
            return JsonResponse({'error': 'Failed to fetch payments'}, status=500)
    
    return JsonResponse({'error': 'Method not allowed. Use GET.'}, status=405)
