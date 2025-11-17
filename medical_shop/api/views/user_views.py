from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import make_password, check_password
from django.core.exceptions import ValidationError
from api.models import Register
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
                
                if not Register.objects.filter(phone=manager).exists():
                    return JsonResponse({'error': 'Manager phone number does not exist'}, status=400)

            # Check if phone already exists
            if Register.objects.filter(phone=phone).exists():
                return JsonResponse({'error': 'Phone number already exists'}, status=400)

            hashed_password = make_password(password)
            
            # Get manager instance if provided
            manager_instance = Register.objects.get(phone=manager) if manager else None

            # Create new user
            Register.objects.create(
                phone=phone,
                password=hashed_password,
                manager=manager_instance,
                shopname=shopname
            )

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

            try:
                user = Register.objects.get(phone=phone)
                if not check_password(password, user.password):
                    return JsonResponse({'error': 'Invalid phone or password'}, status=401)
                
                return JsonResponse({'message': 'Login successful'}, status=200)
            except Register.DoesNotExist:
                return JsonResponse({'error': 'Invalid phone or password'}, status=401)

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
            users = Register.objects.all().order_by('phone').values(
                'phone',
                'shopname',
                manager_phone='manager__phone'
            )
            results = list(users)
            # Replace manager_phone with manager for compatibility
            for result in results:
                result['manager'] = result.pop('manager_phone', None)
                
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
            
            try:
                user = Register.objects.get(phone=phone)
            except Register.DoesNotExist:
                return JsonResponse({'error': 'User not found'}, status=404)
            
            # Update fields if provided
            updated = False
            
            if 'manager' in data:
                if data['manager']:
                    try:
                        manager_instance = Register.objects.get(phone=data['manager'])
                        user.manager = manager_instance
                        updated = True
                    except Register.DoesNotExist:
                        return JsonResponse({'error': 'Manager phone does not exist'}, status=400)
                else:
                    user.manager = None
                    updated = True
            
            if 'shopname' in data:
                user.shopname = data['shopname']
                updated = True
            
            if 'password' in data:
                user.password = make_password(data['password'])
                updated = True
            
            if not updated:
                return JsonResponse({'error': 'No fields to update'}, status=400)
            
            user.save()
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
            try:
                user = Register.objects.get(phone=phone)
                user.delete()
                return JsonResponse({'message': 'User deleted successfully'}, status=200)
            except Register.DoesNotExist:
                return JsonResponse({'error': 'User not found'}, status=404)

        except Exception as e:
            logger.error(f"Error deleting user: {str(e)}")
            return JsonResponse({'error': 'Failed to delete user'}, status=500)

    return JsonResponse({'error': 'Method not allowed. Use DELETE.'}, status=405)
