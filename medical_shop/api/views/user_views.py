from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
from django.contrib.auth.hashers import make_password, check_password
import json
import logging

logger = logging.getLogger(__name__)

@csrf_exempt
def register_user(request):
    """Create a new user registration"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            phone = data.get('phone')
            password = data.get('password')
            manager = data.get('manager')  # Optional manager phone number
            shopname = data.get('shopname')

            if not all([phone, password]):
                return JsonResponse({'error': 'Phone and password are required'}, status=400)

            if len(phone) != 10 or not phone.isdigit():
                return JsonResponse({'error': 'Phone number must be 10 digits'}, status=400)

            # Validate manager if provided
            if manager:
                if len(manager) != 10 or not manager.isdigit():
                    return JsonResponse({'error': 'Manager phone number must be 10 digits'}, status=400)
                
                with connection.cursor() as cursor:
                    cursor.execute("SELECT 1 FROM api_register WHERE phone = %s", [manager])
                    if not cursor.fetchone():
                        return JsonResponse({'error': 'Manager phone number does not exist'}, status=400)

            hashed_password = make_password(password)

            with connection.cursor() as cursor:
                cursor.execute("SELECT 1 FROM api_register WHERE phone = %s", [phone])
                if cursor.fetchone():
                    return JsonResponse({'error': 'Phone number already exists'}, status=400)

                cursor.execute("""
                    INSERT INTO api_register (phone, password, manager_id, shopname)
                    VALUES (%s, %s, %s, %s)
                """, [phone, hashed_password, manager, shopname])

            return JsonResponse({'message': 'User registered successfully'}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
        except Exception as e:
            logger.error(f"Registration error: {str(e)}", exc_info=True)
            return JsonResponse({'error': f'Registration failed: {str(e)}'}, status=500)

    return JsonResponse({'error': 'Method not allowed. Use POST.'}, status=405)

@csrf_exempt
def login_user(request):
    """User login"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            phone = data.get('phone')
            password = data.get('password')

            if not all([phone, password]):
                return JsonResponse({'error': 'Phone and password are required'}, status=400)

            with connection.cursor() as cursor:
                cursor.execute("SELECT password FROM api_register WHERE phone = %s", [phone])
                row = cursor.fetchone()

                if not row or not check_password(password, row[0]):
                    return JsonResponse({'error': 'Invalid phone or password'}, status=401)

                return JsonResponse({'message': 'Login successful'}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            return JsonResponse({'error': 'Login failed'}, status=500)

    return JsonResponse({'error': 'Method not allowed. Use POST.'}, status=405)

@csrf_exempt
def get_users(request):
    """Get all users"""
    if request.method == 'GET':
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT phone, manager, shopname
                    FROM api_register
                    ORDER BY phone
                """)
                columns = [col[0] for col in cursor.description]
                results = [dict(zip(columns, row)) for row in cursor.fetchall()]
                
            return JsonResponse(results, safe=False, status=200)
            
        except Exception as e:
            logger.error(f"Error fetching users: {str(e)}")
            return JsonResponse({'error': 'Failed to fetch users'}, status=500)
    
    return JsonResponse({'error': 'Method not allowed. Use GET.'}, status=405)

@csrf_exempt
def update_user(request, phone):
    """Update user information"""
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            
            with connection.cursor() as cursor:
                # Check if user exists
                cursor.execute("SELECT 1 FROM api_register WHERE phone = %s", [phone])
                if not cursor.fetchone():
                    return JsonResponse({'error': 'User not found'}, status=404)
                
                # Build dynamic update query
                update_fields = []
                values = []
                
                for field in ['manager', 'shopname']:
                    if field in data:
                        update_fields.append(f"{field} = %s")
                        values.append(data[field])
                
                if 'password' in data:
                    update_fields.append("password = %s")
                    values.append(make_password(data['password']))
                
                if not update_fields:
                    return JsonResponse({'error': 'No fields to update'}, status=400)
                
                values.append(phone)
                cursor.execute(f"""
                    UPDATE api_register 
                    SET {', '.join(update_fields)}
                    WHERE phone = %s
                """, values)

            return JsonResponse({'message': 'User updated successfully'}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
        except Exception as e:
            logger.error(f"Error updating user: {str(e)}")
            return JsonResponse({'error': 'Failed to update user'}, status=500)

    return JsonResponse({'error': 'Method not allowed. Use PUT.'}, status=405)

@csrf_exempt
def delete_user(request, phone):
    """Delete a user"""
    if request.method == 'DELETE':
        try:
            with connection.cursor() as cursor:
                # Check if user exists
                cursor.execute("SELECT 1 FROM api_register WHERE phone = %s", [phone])
                if not cursor.fetchone():
                    return JsonResponse({'error': 'User not found'}, status=404)
                
                cursor.execute("DELETE FROM api_register WHERE phone = %s", [phone])

            return JsonResponse({'message': 'User deleted successfully'}, status=200)

        except Exception as e:
            logger.error(f"Error deleting user: {str(e)}")
            return JsonResponse({'error': 'Failed to delete user'}, status=500)

    return JsonResponse({'error': 'Method not allowed. Use DELETE.'}, status=405)
