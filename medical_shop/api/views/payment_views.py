from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
import json
import logging
from decimal import Decimal

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
                
                # Validate transaction_amount is a valid number
                try:
                    float(payment['transaction_amount'])
                except (ValueError, TypeError):
                    return JsonResponse({'error': 'transaction_amount must be a valid number'}, status=400)

            # Get the last order_id
            with connection.cursor() as cursor:
                cursor.execute("SELECT MAX(order_id) FROM api_order")
                last_order_id = cursor.fetchone()[0]

                if not last_order_id:
                    return JsonResponse({'error': 'No orders found'}, status=400)

                # Insert payments
                for payment in payments:
                    cursor.execute("""
                        INSERT INTO api_payment (order_id, payment_type, transaction_amount)
                        VALUES (%s, %s, %s)
                    """, [last_order_id, payment['payment_type'], float(payment['transaction_amount'])])

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
                        if field == 'transaction_amount':
                            # Validate transaction_amount
                            try:
                                float(data[field])
                            except (ValueError, TypeError):
                                return JsonResponse({'error': 'transaction_amount must be a valid number'}, status=400)
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
    """Get all payments with improved null handling"""
    if request.method == 'GET':
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT 
                        p.order_id, 
                        p.payment_type, 
                        COALESCE(p.transaction_amount, 0) as transaction_amount,
                        COALESCE(o.customer_name, 'Unknown Customer') as customer_name, 
                        COALESCE(o.total_amount, 0) as total_amount, 
                        COALESCE(o.order_date, NOW()) as order_date
                    FROM api_payment p
                    LEFT JOIN api_order o ON p.order_id = o.order_id
                    ORDER BY o.order_date DESC
                """)
                columns = [col[0] for col in cursor.description]
                results = []
                
                for row in cursor.fetchall():
                    row_dict = dict(zip(columns, row))
                    
                    # Ensure numeric fields are properly handled
                    if row_dict['transaction_amount'] is None:
                        row_dict['transaction_amount'] = 0
                    else:
                        row_dict['transaction_amount'] = float(row_dict['transaction_amount'])
                    
                    if row_dict['total_amount'] is None:
                        row_dict['total_amount'] = 0
                    else:
                        row_dict['total_amount'] = float(row_dict['total_amount'])
                    
                    # Ensure string fields are not None
                    if row_dict['customer_name'] is None:
                        row_dict['customer_name'] = 'Unknown Customer'
                    
                    if row_dict['payment_type'] is None:
                        row_dict['payment_type'] = 'Unknown'
                    
                    # Convert datetime to string if needed
                    if row_dict['order_date']:
                        row_dict['order_date'] = row_dict['order_date'].strftime('%Y-%m-%d %H:%M:%S')
                    
                    results.append(row_dict)
                
            return JsonResponse(results, safe=False, status=200)
            
        except Exception as e:
            logger.error(f"Error fetching payments: {str(e)}")
            return JsonResponse({'error': 'Failed to fetch payments'}, status=500)
    
    return JsonResponse({'error': 'Method not allowed. Use GET.'}, status=405)

@csrf_exempt
def get_payment_summary(request):
    """Get payment summary statistics"""
    if request.method == 'GET':
        try:
            with connection.cursor() as cursor:
                # Get summary statistics
                cursor.execute("""
                    SELECT 
                        COUNT(DISTINCT p.order_id) as total_orders,
                        COALESCE(SUM(CASE WHEN o.total_amount IS NOT NULL THEN o.total_amount ELSE 0 END), 0) as total_revenue,
                        COALESCE(SUM(CASE WHEN p.payment_type = 'cash' THEN p.transaction_amount ELSE 0 END), 0) as total_cash,
                        COALESCE(SUM(CASE WHEN p.payment_type = 'upi' THEN p.transaction_amount ELSE 0 END), 0) as total_upi,
                        COALESCE(SUM(p.transaction_amount), 0) as total_payments
                    FROM api_payment p
                    LEFT JOIN api_order o ON p.order_id = o.order_id
                """)
                
                result = cursor.fetchone()
                if result:
                    summary = {
                        'total_orders': int(result[0]) if result[0] else 0,
                        'total_revenue': float(result[1]) if result[1] else 0.0,
                        'total_cash': float(result[2]) if result[2] else 0.0,
                        'total_upi': float(result[3]) if result[3] else 0.0,
                        'total_payments': float(result[4]) if result[4] else 0.0,
                    }
                else:
                    summary = {
                        'total_orders': 0,
                        'total_revenue': 0.0,
                        'total_cash': 0.0,
                        'total_upi': 0.0,
                        'total_payments': 0.0,
                    }
                
            return JsonResponse(summary, status=200)
            
        except Exception as e:
            logger.error(f"Error fetching payment summary: {str(e)}")
            return JsonResponse({'error': 'Failed to fetch payment summary'}, status=500)
    
    return JsonResponse({'error': 'Method not allowed. Use GET.'}, status=405)