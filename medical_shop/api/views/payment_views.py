from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Sum, Q, Count, F
from api.models import Payment, Order
from api.auth import jwt_required
import json
import logging
from decimal import Decimal

logger = logging.getLogger(__name__)

@csrf_exempt
@jwt_required
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

            # Get the last order
            last_order = Order.objects.order_by('-order_id').first()

            if not last_order:
                return JsonResponse({'error': 'No orders found'}, status=400)

            # Insert payments
            for payment in payments:
                Payment.objects.create(
                    order=last_order,
                    payment_type=payment['payment_type'],
                    transaction_amount=float(payment['transaction_amount'])
                )

            return JsonResponse({'message': 'Payments added successfully', 'order_id': last_order.order_id}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
        except Exception as e:
            logger.error(f"Error adding payment: {str(e)}")
            return JsonResponse({'error': 'Failed to add payment'}, status=500)

    return JsonResponse({'error': 'Method not allowed. Use POST.'}, status=405)

@csrf_exempt
@jwt_required
def update_payment(request, order_id):
    """Update payment for an order"""
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            
            try:
                payment = Payment.objects.get(order_id=order_id)
            except Payment.DoesNotExist:
                return JsonResponse({'error': 'Payment not found'}, status=404)
            
            # Update fields if provided
            updated = False
            
            if 'payment_type' in data:
                payment.payment_type = data['payment_type']
                updated = True
            
            if 'transaction_amount' in data:
                try:
                    payment.transaction_amount = float(data['transaction_amount'])
                    updated = True
                except (ValueError, TypeError):
                    return JsonResponse({'error': 'transaction_amount must be a valid number'}, status=400)
            
            if not updated:
                return JsonResponse({'error': 'No fields to update'}, status=400)
            
            payment.save()
            return JsonResponse({'message': 'Payment updated successfully'}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
        except Exception as e:
            logger.error(f"Error updating payment: {str(e)}")
            return JsonResponse({'error': 'Failed to update payment'}, status=500)

    return JsonResponse({'error': 'Method not allowed. Use PUT.'}, status=405)

@csrf_exempt
@jwt_required
def delete_payment(request, order_id):
    """Delete payment for an order"""
    if request.method == 'DELETE':
        try:
            try:
                payment = Payment.objects.get(order_id=order_id)
                payment.delete()
                return JsonResponse({'message': 'Payment deleted successfully'}, status=200)
            except Payment.DoesNotExist:
                return JsonResponse({'error': 'Payment not found'}, status=404)

        except Exception as e:
            logger.error(f"Error deleting payment: {str(e)}")
            return JsonResponse({'error': 'Failed to delete payment'}, status=500)

    return JsonResponse({'error': 'Method not allowed. Use DELETE.'}, status=405)

@csrf_exempt
def get_payments(request):
    """Get all payments with improved null handling"""
    if request.method == 'GET':
        try:
            payments = Payment.objects.select_related('order').order_by('-order__order_date')
            
            results = []
            for p in payments:
                results.append({
                    'order_id': p.order_id,
                    'payment_type': p.payment_type or 'Unknown',
                    'transaction_amount': float(p.transaction_amount) if p.transaction_amount else 0.0,
                    'customer_name': p.order.customer_name or 'Unknown Customer',
                    'total_amount': float(p.order.total_amount) if p.order.total_amount else 0.0,
                    'order_date': p.order.order_date.strftime('%Y-%m-%d %H:%M:%S') if p.order.order_date else None
                })
                
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
            # Get summary statistics using ORM aggregation
            summary = Payment.objects.select_related('order').aggregate(
                total_orders=Count('order_id', distinct=True),
                total_revenue=Sum('order__total_amount'),
                total_cash=Sum('transaction_amount', filter=Q(payment_type='CASH')),
                total_upi=Sum('transaction_amount', filter=Q(payment_type='UPI')),
                total_payments=Sum('transaction_amount')
            )
            
            # Convert to proper format with defaults
            result = {
                'total_orders': summary['total_orders'] or 0,
                'total_revenue': float(summary['total_revenue']) if summary['total_revenue'] else 0.0,
                'total_cash': float(summary['total_cash']) if summary['total_cash'] else 0.0,
                'total_upi': float(summary['total_upi']) if summary['total_upi'] else 0.0,
                'total_payments': float(summary['total_payments']) if summary['total_payments'] else 0.0,
            }
            
            return JsonResponse(result, status=200)
            
        except Exception as e:
            logger.error(f"Error fetching payment summary: {str(e)}")
            return JsonResponse({'error': 'Failed to fetch payment summary'}, status=500)
    
    return JsonResponse({'error': 'Method not allowed. Use GET.'}, status=405)