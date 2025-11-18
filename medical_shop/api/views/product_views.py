from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from api.auth import jwt_required
from django.db.models import ProtectedError
from api.models import Product
import logging

logger = logging.getLogger(__name__)

@method_decorator(csrf_exempt, name='dispatch')
@method_decorator(jwt_required, name='get')
@method_decorator(jwt_required, name='post')
@method_decorator(jwt_required, name='put')
@method_decorator(jwt_required, name='delete')
class ProductView(APIView):
    """Handle Product CRUD operations"""
    
    def get(self, request, product_id=None):
        """Get all products or a specific product for the authenticated shop"""
        try:
            # Get shop from authenticated user (for protected endpoints)
            shop = getattr(request, 'register_user', None)
            
            if product_id:
                try:
                    # Filter by shop if authenticated, otherwise show all (public read)
                    query = Product.objects.filter(product_id=product_id)
                    if shop:
                        query = query.filter(shop=shop)
                    product = query.first()
                    if not product:
                        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
                    
                    product_data = {
                        'product_id': product.product_id,
                        'brand_name': product.brand_name,
                        'generic_name': product.generic_name,
                        'hsn': product.hsn,
                        'gst': float(product.gst) if product.gst else None,
                        'prescription_required': product.prescription_required,
                        'composition_id': product.composition_id,
                        'therapeutic_category': product.therapeutic_category
                    }
                    return Response(product_data, status=status.HTTP_200_OK)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
            else:
                # Filter by shop if authenticated
                products = Product.objects.all()
                if shop:
                    products = products.filter(shop=shop)
                products = products.order_by('product_id')
                
                results = [{
                    'product_id': p.product_id,
                    'brand_name': p.brand_name,
                    'generic_name': p.generic_name,
                    'hsn': p.hsn,
                    'gst': float(p.gst) if p.gst else None,
                    'prescription_required': p.prescription_required,
                    'composition_id': p.composition_id,
                    'therapeutic_category': p.therapeutic_category
                } for p in products]
                return Response(results, status=status.HTTP_200_OK)
        
        except Exception as e:
            logger.error(f"Unexpected error in ProductView GET: {str(e)}")
            return Response({'error': 'An unexpected error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        """Create a new product for the authenticated shop"""
        data = request.data
        shop = request.register_user
        
        required_fields = ['product_id', 'composition_id', 'generic_name', 'brand_name']
        for field in required_fields:
            if field not in data or data[field] == '':
                return Response({'error': f'{field} is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Check if product already exists for this shop
            if Product.objects.filter(product_id=data['product_id'], shop=shop).exists():
                return Response({'error': 'Product with this ID already exists in your shop'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Create new product
            Product.objects.create(
                product_id=data['product_id'],
                shop=shop,
                composition_id=data['composition_id'],
                generic_name=data['generic_name'],
                brand_name=data['brand_name'],
                hsn=data.get('hsn', ''),
                gst=data.get('gst', 0),
                prescription_required=data.get('prescription_required', False),
                therapeutic_category=data.get('therapeutic_category', '')
            )

            return Response({'message': 'Product created successfully'}, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error creating product: {str(e)}")
            return Response({'error': 'Failed to create product'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, product_id):
        """Update an existing product for the authenticated shop"""
        data = request.data
        shop = request.register_user
        
        try:
            try:
                product = Product.objects.get(product_id=product_id, shop=shop)
            except Product.DoesNotExist:
                return Response({'error': 'Product not found in your shop'}, status=status.HTTP_404_NOT_FOUND)
            
            # Update fields if provided
            updated = False
            
            for field in ['composition_id', 'generic_name', 'brand_name', 'hsn', 'gst', 'prescription_required', 'therapeutic_category']:
                if field in data:
                    setattr(product, field, data[field])
                    updated = True
            
            if not updated:
                return Response({'error': 'No fields to update'}, status=status.HTTP_400_BAD_REQUEST)
            
            product.save()
            return Response({'message': 'Product updated successfully'}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error updating product: {str(e)}")
            return Response({'error': 'Failed to update product'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, product_id):
        """Delete a product from the authenticated shop"""
        shop = request.register_user
        try:
            try:
                product = Product.objects.get(product_id=product_id, shop=shop)
            except Product.DoesNotExist:
                return Response({'error': 'Product not found in your shop'}, status=status.HTTP_404_NOT_FOUND)
            
            # Check if product has associated batches
            if product.batch_set.exists():
                return Response({'error': 'Cannot delete product with existing batches'}, status=status.HTTP_400_BAD_REQUEST)
            
            product.delete()
            return Response({'message': 'Product deleted successfully'}, status=status.HTTP_200_OK)

        except ProtectedError:
            return Response({'error': 'Cannot delete product with existing batches'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error deleting product: {str(e)}")
            return Response({'error': 'Failed to delete product'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
