from django.shortcuts import render
from rest_framework.views import APIView
# Create your views here.from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse,JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from django.db import connection,DatabaseError
from django.utils.decorators import method_decorator
@method_decorator(csrf_exempt, name='dispatch')
class AddMedicineView(APIView):

    def post(self, request, *args, **kwargs):
        data = request.data
        print("Received data:", data)

        required_fields = ['medicine_id', 'composition_id', 'name', 'brand']
        for field in required_fields:
            if field not in data or data[field] == '':
                return Response({'error': f'{field} is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO product (
                        product_id,
                        composition_id,
                        generic_name,
                        brand_name,
                        hsn,
                        gst,
                        prescription_required,
                        therapeutic_category
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, [
                    data['medicine_id'],
                    data['composition_id'],
                    data['name'],
                    data['brand'],
                    data.get('hsn_code', ''),
                    data.get('gst_rate', 0),
                    data.get('requires_prescription', False),
                    data.get('therapeutic_category', '')
                ])

            return Response({'message': 'Medicine saved successfully using raw SQL!'}, status=status.HTTP_201_CREATED)

        except Exception as e:
            print("Error:", str(e))
            return Response({'error': 'Something went wrong while saving the medicine.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
@csrf_exempt
def get_all_products(request):
    if request.method == "GET":
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT 
                        *
                    FROM product
                """)
                columns = [col[0] for col in cursor.description]
                results = [
                    dict(zip(columns, row))
                    for row in cursor.fetchall()
                ]
            return JsonResponse(results, safe=False, status=200)

        except DatabaseError as e:
            # Database-related errors
            return JsonResponse(
                {"error": "Database error occurred", "details": str(e)},
                status=500
            )
        except Exception as e:
            # Any other unexpected errors
            return JsonResponse(
                {"error": "An unexpected error occurred", "details": str(e)},
                status=500
            )

    else:
        return JsonResponse(
            {"error": "Method not allowed. Use GET."},
            status=405
        )
