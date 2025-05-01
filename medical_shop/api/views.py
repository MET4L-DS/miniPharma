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
from django.contrib.auth.hashers import make_password,check_password
import json,logging
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
@csrf_exempt
def register_user(request):
    if request.method == 'POST':
        try:
            logging.info(request)
            data = json.loads(request.body)
            logging.info(data)
            print(data)
            manager=data.get('manager')
            role=data.get('role')
            phone = data.get('phone')
            password = data.get('password')
            
            if not all([phone, password]):
                return JsonResponse({'error': 'All fields are required'}, status=400)

            hashed_password = make_password(password)
            print(hashed_password)
            # connect to the database
            with connection.cursor() as cursor:
            

            # Check if username or email exists
                cursor.execute("SELECT 1 FROM register WHERE  phone=%s", (phone,))
                if cursor.fetchone():
                    return JsonResponse({'error': 'Username or phone already exists'}, status=400)

                # Insert the new user
                d=cursor.execute("""
                    INSERT INTO register (phone,password,manager,role)
                    VALUES (%s, %s, %s,%s)
                """, (phone, hashed_password,manager,role))
                print(d)
                
                cursor.close()
                

            return JsonResponse({'message': 'User registered successfully'}, status=201)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)
@csrf_exempt
def login_user(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            phone = data.get('phone')
            password = data.get('password')

            if not all([phone, password]):
                return JsonResponse({'error': 'Both phone and password are required'}, status=400)

            with connection.cursor() as cursor:
                cursor.execute("SELECT password FROM register WHERE phone = %s", [phone])
                row = cursor.fetchone()

                if not row:
                    return JsonResponse({'error': 'Invalid phone or password'}, status=401)

                hashed_password = row[0]
                if check_password(password, hashed_password):
                    return JsonResponse({'message': 'Login successful'}, status=200)
                else:
                    return JsonResponse({'error': 'Invalid phone or password'}, status=401)

        except Exception as e:
            logging.exception("Login error:")
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)
@csrf_exempt
def to_orders(request):
    if request.method == 'POST':
        try:
            logging.info(request)
            data = json.loads(request.body)
            logging.info(data)
            print(data)
            customer_name=data.get('customer_name')
            customer_number=data.get('customer_number')
            doctor_name = data.get('doctor_name')
            total_amount = data.get('total_amount')
            discount_percentage=data.get('discount_percentage')
            with connection.cursor() as cursor:
            

            # Check if username or email exists
                
                # Insert the new user
                d=cursor.execute("""
                    INSERT INTO orders (customer_name,customer_number,doctor_name,total_amount,discount_percentage)
                    VALUES (%s, %s, %s,%s,%s)
                """, (customer_name,customer_number,doctor_name,total_amount,discount_percentage))
                print(d)
                
                cursor.close()
                

            return JsonResponse({'message': 'order successfully'}, status=201)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)