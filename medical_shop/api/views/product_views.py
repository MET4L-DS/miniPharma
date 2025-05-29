from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import connection, DatabaseError
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import logging

logger = logging.getLogger(__name__)

@method_decorator(csrf_exempt, name='dispatch')
class ProductView(APIView):
    """Handle Product CRUD operations"""
    
    def get(self, request, product_id=None):
        """Get all products or a specific product"""
        try:
            with connection.cursor() as cursor:
                if product_id:
                    cursor.execute("""
                        SELECT product_id, brand_name, generic_name, hsn, gst, 
                               prescription_required, composition_id, therapeutic_category
                        FROM api_product
                        WHERE product_id = %s
                    """, [product_id])
                    result = cursor.fetchone()
                    if not result:
                        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
                    
                    columns = [col[0] for col in cursor.description]
                    product = dict(zip(columns, result))
                    return Response(product, status=status.HTTP_200_OK)
                else:
                    cursor.execute("""
                        SELECT product_id, brand_name, generic_name, hsn, gst, 
                               prescription_required, composition_id, therapeutic_category
                        FROM api_product
                        ORDER BY product_id
                    """)
                    columns = [col[0] for col in cursor.description]
                    results = [dict(zip(columns, row)) for row in cursor.fetchall()]
                    return Response(results, status=status.HTTP_200_OK)
        
        except DatabaseError as e:
            logger.error(f"Database error in ProductView GET: {str(e)}")
            return Response({'error': 'Database error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            logger.error(f"Unexpected error in ProductView GET: {str(e)}")
            return Response({'error': 'An unexpected error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        """Create a new product"""
        data = request.data
        
        required_fields = ['product_id', 'composition_id', 'generic_name', 'brand_name']
        for field in required_fields:
            if field not in data or data[field] == '':
                return Response({'error': f'{field} is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with connection.cursor() as cursor:
                # Check if product already exists
                cursor.execute("SELECT 1 FROM api_product WHERE product_id = %s", [data['product_id']])
                if cursor.fetchone():
                    return Response({'error': 'Product with this ID already exists'}, status=status.HTTP_400_BAD_REQUEST)
                
                cursor.execute("""
                    INSERT INTO api_product (product_id, composition_id, generic_name, brand_name, 
                                           hsn, gst, prescription_required, therapeutic_category)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, [
                    data['product_id'], data['composition_id'], data['generic_name'], data['brand_name'],
                    data.get('hsn', ''), data.get('gst', 0), data.get('prescription_required', False),
                    data.get('therapeutic_category', '')
                ])

            return Response({'message': 'Product created successfully'}, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error creating product: {str(e)}")
            return Response({'error': 'Failed to create product'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, product_id):
        """Update an existing product"""
        data = request.data
        
        try:
            with connection.cursor() as cursor:
                # Check if product exists
                cursor.execute("SELECT 1 FROM api_product WHERE product_id = %s", [product_id])
                if not cursor.fetchone():
                    return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
                
                # Build dynamic update query
                update_fields = []
                values = []
                
                for field in ['composition_id', 'generic_name', 'brand_name', 'hsn', 'gst', 'prescription_required', 'therapeutic_category']:
                    if field in data:
                        update_fields.append(f"{field} = %s")
                        values.append(data[field])
                
                if not update_fields:
                    return Response({'error': 'No fields to update'}, status=status.HTTP_400_BAD_REQUEST)
                
                values.append(product_id)
                cursor.execute(f"""
                    UPDATE api_product 
                    SET {', '.join(update_fields)}
                    WHERE product_id = %s
                """, values)

            return Response({'message': 'Product updated successfully'}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error updating product: {str(e)}")
            return Response({'error': 'Failed to update product'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, product_id):
        """Delete a product"""
        try:
            with connection.cursor() as cursor:
                # Check if product exists
                cursor.execute("SELECT 1 FROM api_product WHERE product_id = %s", [product_id])
                if not cursor.fetchone():
                    return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
                
                # Check if product has associated batches
                cursor.execute("SELECT 1 FROM api_batch WHERE product_id = %s LIMIT 1", [product_id])
                if cursor.fetchone():
                    return Response({'error': 'Cannot delete product with existing batches'}, status=status.HTTP_400_BAD_REQUEST)
                
                cursor.execute("DELETE FROM api_product WHERE product_id = %s", [product_id])

            return Response({'message': 'Product deleted successfully'}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error deleting product: {str(e)}")
            return Response({'error': 'Failed to delete product'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
