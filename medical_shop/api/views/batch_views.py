from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import connection, DatabaseError
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import logging

logger = logging.getLogger(__name__)

@method_decorator(csrf_exempt, name='dispatch')
class BatchView(APIView):
    """Handle Batch CRUD operations"""
    
    def get(self, request, batch_id=None):
        """Get all batches or a specific batch"""
        try:
            with connection.cursor() as cursor:
                if batch_id:
                    cursor.execute("""
                        SELECT b.id, b.batch_number, b.product_id, b.expiry_date, 
                               b.average_purchase_price, b.selling_price, b.quantity_in_stock,
                               p.generic_name, p.brand_name
                        FROM api_batch b
                        LEFT JOIN api_product p ON b.product_id = p.product_id
                        WHERE b.id = %s
                    """, [batch_id])
                    result = cursor.fetchone()
                    if not result:
                        return Response({'error': 'Batch not found'}, status=status.HTTP_404_NOT_FOUND)
                    
                    columns = [col[0] for col in cursor.description]
                    batch = dict(zip(columns, result))
                    return Response(batch, status=status.HTTP_200_OK)
                else:
                    cursor.execute("""
                        SELECT b.id, b.batch_number, b.product_id, b.expiry_date, 
                               b.average_purchase_price, b.selling_price, b.quantity_in_stock,
                               p.generic_name, p.brand_name
                        FROM api_batch b
                        LEFT JOIN api_product p ON b.product_id = p.product_id
                        ORDER BY b.expiry_date DESC
                    """)
                    columns = [col[0] for col in cursor.description]
                    results = [dict(zip(columns, row)) for row in cursor.fetchall()]
                    return Response(results, status=status.HTTP_200_OK)
        
        except DatabaseError as e:
            logger.error(f"Database error in BatchView GET: {str(e)}")
            return Response({'error': 'Database error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
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
            with connection.cursor() as cursor:
                # Check if product exists
                cursor.execute("SELECT 1 FROM api_product WHERE product_id = %s", [data['product_id']])
                if not cursor.fetchone():
                    return Response({'error': 'Product does not exist'}, status=status.HTTP_400_BAD_REQUEST)
                
                # Check if batch already exists for this product
                cursor.execute("""
                    SELECT 1 FROM api_batch WHERE batch_number = %s AND product_id = %s
                """, [data['batch_number'], data['product_id']])
                if cursor.fetchone():
                    return Response({'error': 'Batch already exists for this product'}, status=status.HTTP_400_BAD_REQUEST)
                
                cursor.execute("""
                    INSERT INTO api_batch (batch_number, product_id, expiry_date, 
                                         average_purchase_price, selling_price, quantity_in_stock)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, [
                    data['batch_number'], data['product_id'], data['expiry_date'],
                    data.get('average_purchase_price', 0.0), data.get('selling_price', 0.0),
                    data.get('quantity_in_stock', 0)
                ])

            return Response({'message': 'Batch created successfully'}, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error creating batch: {str(e)}")
            return Response({'error': 'Failed to create batch'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, batch_id):
        """Update an existing batch"""
        data = request.data
        
        try:
            with connection.cursor() as cursor:
                # Check if batch exists
                cursor.execute("SELECT 1 FROM api_batch WHERE id = %s", [batch_id])
                if not cursor.fetchone():
                    return Response({'error': 'Batch not found'}, status=status.HTTP_404_NOT_FOUND)
                
                # Build dynamic update query
                update_fields = []
                values = []
                
                for field in ['batch_number', 'expiry_date', 'average_purchase_price', 'selling_price', 'quantity_in_stock']:
                    if field in data:
                        update_fields.append(f"{field} = %s")
                        values.append(data[field])
                
                if not update_fields:
                    return Response({'error': 'No fields to update'}, status=status.HTTP_400_BAD_REQUEST)
                
                values.append(batch_id)
                cursor.execute(f"""
                    UPDATE api_batch 
                    SET {', '.join(update_fields)}
                    WHERE id = %s
                """, values)

            return Response({'message': 'Batch updated successfully'}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error updating batch: {str(e)}")
            return Response({'error': 'Failed to update batch'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, batch_id):
        """Delete a batch"""
        try:
            with connection.cursor() as cursor:
                # Check if batch exists
                cursor.execute("SELECT 1 FROM api_batch WHERE id = %s", [batch_id])
                if not cursor.fetchone():
                    return Response({'error': 'Batch not found'}, status=status.HTTP_404_NOT_FOUND)
                
                # Check if batch is used in any orders
                cursor.execute("SELECT 1 FROM api_order_items WHERE batch_number = (SELECT batch_number FROM api_batch WHERE id = %s) AND product_id = (SELECT product_id FROM api_batch WHERE id = %s) LIMIT 1", [batch_id, batch_id])
                if cursor.fetchone():
                    return Response({'error': 'Cannot delete batch with existing orders'}, status=status.HTTP_400_BAD_REQUEST)
                
                cursor.execute("DELETE FROM api_batch WHERE id = %s", [batch_id])

            return Response({'message': 'Batch deleted successfully'}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error deleting batch: {str(e)}")
            return Response({'error': 'Failed to delete batch'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
