from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.db.models import ProtectedError
from api.models import Batch, Product
from api.auth import jwt_required
import logging

logger = logging.getLogger(__name__)

@method_decorator(csrf_exempt, name='dispatch')
@method_decorator(jwt_required, name='post')
@method_decorator(jwt_required, name='put')
@method_decorator(jwt_required, name='delete')
class BatchView(APIView):
    """Handle Batch CRUD operations"""
    
    def get(self, request, batch_id=None):
        """Get all batches or a specific batch"""
        try:
            if batch_id:
                try:
                    batch = Batch.objects.select_related('product').get(id=batch_id)
                    batch_data = {
                        'id': batch.id,
                        'batch_number': batch.batch_number,
                        'product_id': batch.product.product_id,
                        'expiry_date': batch.expiry_date,
                        'average_purchase_price': float(batch.average_purchase_price) if batch.average_purchase_price else None,
                        'selling_price': float(batch.selling_price),
                        'quantity_in_stock': batch.quantity_in_stock,
                        'generic_name': batch.product.generic_name,
                        'brand_name': batch.product.brand_name
                    }
                    return Response(batch_data, status=status.HTTP_200_OK)
                except Batch.DoesNotExist:
                    return Response({'error': 'Batch not found'}, status=status.HTTP_404_NOT_FOUND)
            else:
                batches = Batch.objects.select_related('product').all().order_by('-expiry_date')
                results = [{
                    'id': b.id,
                    'batch_number': b.batch_number,
                    'product_id': b.product.product_id,
                    'expiry_date': b.expiry_date,
                    'average_purchase_price': float(b.average_purchase_price) if b.average_purchase_price else None,
                    'selling_price': float(b.selling_price),
                    'quantity_in_stock': b.quantity_in_stock,
                    'generic_name': b.product.generic_name,
                    'brand_name': b.product.brand_name
                } for b in batches]
                return Response(results, status=status.HTTP_200_OK)
        
        except Exception as e:
            logger.error(f"Unexpected error in BatchView GET: {str(e)}")
            return Response({'error': 'An unexpected error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        """Create a new batch"""
        data = request.data
        
        required_fields = ['batch_number', 'product_id', 'expiry_date']
        for field in required_fields:
            if field not in data or data[field] == '':
                return Response({'error': f'{field} is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Check if product exists
            try:
                product = Product.objects.get(product_id=data['product_id'])
            except Product.DoesNotExist:
                return Response({'error': 'Product does not exist'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if batch already exists for this product
            if Batch.objects.filter(batch_number=data['batch_number'], product=product).exists():
                return Response({'error': 'Batch already exists for this product'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Create new batch
            Batch.objects.create(
                batch_number=data['batch_number'],
                product=product,
                expiry_date=data['expiry_date'],
                average_purchase_price=data.get('average_purchase_price', 0.0),
                selling_price=data.get('selling_price', 0.0),
                quantity_in_stock=data.get('quantity_in_stock', 0)
            )

            return Response({'message': 'Batch created successfully'}, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error creating batch: {str(e)}")
            return Response({'error': 'Failed to create batch'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, batch_id):
        """Update an existing batch"""
        data = request.data
        
        try:
            try:
                batch = Batch.objects.get(id=batch_id)
            except Batch.DoesNotExist:
                return Response({'error': 'Batch not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Update fields if provided
            updated = False
            
            for field in ['batch_number', 'expiry_date', 'average_purchase_price', 'selling_price', 'quantity_in_stock']:
                if field in data:
                    setattr(batch, field, data[field])
                    updated = True
            
            if not updated:
                return Response({'error': 'No fields to update'}, status=status.HTTP_400_BAD_REQUEST)
            
            batch.save()
            return Response({'message': 'Batch updated successfully'}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error updating batch: {str(e)}")
            return Response({'error': 'Failed to update batch'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, batch_id):
        """Delete a batch"""
        try:
            try:
                batch = Batch.objects.get(id=batch_id)
            except Batch.DoesNotExist:
                return Response({'error': 'Batch not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Check if batch is used in any orders
            if batch.orderitem_set.exists():
                return Response({'error': 'Cannot delete batch with existing orders'}, status=status.HTTP_400_BAD_REQUEST)
            
            batch.delete()
            return Response({'message': 'Batch deleted successfully'}, status=status.HTTP_200_OK)

        except ProtectedError:
            return Response({'error': 'Cannot delete batch with existing orders'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error deleting batch: {str(e)}")
            return Response({'error': 'Failed to delete batch'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
