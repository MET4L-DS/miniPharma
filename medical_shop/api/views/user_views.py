from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import make_password, check_password
from django.core.exceptions import ValidationError
from django.db.models import Q
from api.models import Shop, Staff, Manager
from api.auth import generate_token, jwt_required
import json
import logging

logger = logging.getLogger(__name__)

@csrf_exempt
def register_user(request):
    """Create a new manager account and their first shop"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            phone = data.get('phone')
            password = data.get('password')
            name = data.get('name', '')  # Manager name (optional, defaults to empty)
            shopname = data.get('shopname')

            if not all([phone, password, shopname]):
                return JsonResponse({'error': 'Phone, password, and shopname are required'}, status=400)

            if len(phone) != 10 or not phone.isdigit():
                return JsonResponse({'error': 'Phone number must be 10 digits'}, status=400)

            # Check if manager already exists
            if Manager.objects.filter(phone=phone).exists():
                return JsonResponse({'error': 'Phone number already registered as manager'}, status=400)

            hashed_password = make_password(password)
            
            # Create new manager
            manager = Manager.objects.create(
                phone=phone,
                name=name if name else f'Manager {phone}',  # Use phone as fallback if name not provided
                password=hashed_password
            )

            # Create first shop for this manager
            shop = Shop.objects.create(
                shopname=shopname,
                manager=manager
            )

            # Generate JWT token for newly created manager
            token = generate_token(account_phone=manager.phone, shop_id=shop.shop_id)

            return JsonResponse({
                'message': 'Manager and shop registered successfully',
                'token': token,
                'shop_id': shop.shop_id,
                'shopname': shop.shopname,
                'manager': manager.phone
            }, status=201)

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

            # First try staff login (staff phone is unique across all shops)
            try:
                staff = Staff.objects.get(phone=phone)
                if not check_password(password, staff.password):
                    return JsonResponse({'error': 'Invalid phone or password'}, status=401)
                
                if not staff.is_active:
                    return JsonResponse({'error': 'Staff account is inactive'}, status=403)
                
                # Generate token for staff with shop context
                token = generate_token(account_phone=staff.phone, shop_id=staff.shop.shop_id)
                return JsonResponse({
                    'message': 'Login successful', 
                    'token': token,
                    'shop_id': staff.shop.shop_id,
                    'shopname': staff.shop.shopname, 
                    'manager': staff.shop.manager.phone if staff.shop.manager else None,
                    'is_staff': True
                }, status=200)
                
            except Staff.DoesNotExist:
                # Not a staff, try manager login
                try:
                    manager = Manager.objects.get(phone=phone)
                    if not check_password(password, manager.password):
                        return JsonResponse({'error': 'Invalid phone or password'}, status=401)

                    # Get the first shop for this manager
                    first_shop = Shop.objects.filter(manager=manager).first()
                    if not first_shop:
                        return JsonResponse({'error': 'No shops found for this manager'}, status=404)

                    # Generate JWT token for manager with first shop context
                    token = generate_token(account_phone=manager.phone, shop_id=first_shop.shop_id)

                    return JsonResponse({
                        'message': 'Login successful',
                        'token': token,
                        'shop_id': first_shop.shop_id,
                        'shopname': first_shop.shopname,
                        'manager': manager.phone,
                        'is_manager': True
                    }, status=200)
                except Manager.DoesNotExist:
                    return JsonResponse({'error': 'Invalid phone or password'}, status=401)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            return JsonResponse({'error': 'Login failed'}, status=500)

    return JsonResponse({'error': 'Method not allowed. Use POST.'}, status=405)

@csrf_exempt
@jwt_required
def get_users(request):
    """Get all shops"""
    if request.method == 'GET':
        try:
            shops = Shop.objects.all().order_by('shop_id').values(
                'shop_id',
                'shopname',
                manager_phone='manager__phone'
            )
            results = list(shops)
            # Replace manager_phone with manager for compatibility
            for result in results:
                result['manager'] = result.pop('manager_phone', None)
                
            return JsonResponse(results, safe=False, status=200)
            
        except Exception as e:
            logger.error(f"Error fetching users: {str(e)}")
            return JsonResponse({'error': 'Failed to fetch users'}, status=500)
    
    return JsonResponse({'error': 'Method not allowed. Use GET.'}, status=405)


@csrf_exempt
@jwt_required
def list_staffs(request, shop_id):
    """List staff for a given shop. Only accessible to authenticated users (manager/staff)."""
    if request.method == 'GET':
        try:
            # Get the shop context from token
            caller_shop = getattr(request, 'register_user', None)
            caller_account = getattr(request, 'account_user', None)

            try:
                shop = Shop.objects.get(shop_id=shop_id)
            except Shop.DoesNotExist:
                return JsonResponse({'error': 'Shop not found'}, status=404)

            # Permission: caller must be the shop's manager OR a staff member of the shop
            caller_account = getattr(request, 'account_user', None)
            if not caller_account:
                return JsonResponse({'error': 'Not authenticated'}, status=401)

            is_manager = isinstance(caller_account, Manager) and shop.manager and str(caller_account.phone) == str(shop.manager.phone)
            is_staff_of_shop = isinstance(caller_account, Staff) and str(caller_account.shop.shop_id) == str(shop.shop_id)

            if not (is_manager or is_staff_of_shop):
                return JsonResponse({'error': 'Permission denied'}, status=403)

            staffs = Staff.objects.filter(shop=shop).values('phone', 'name', 'is_active')
            staff_list = list(staffs)
            for staff in staff_list:
                staff['shop_id'] = shop.shop_id
            return JsonResponse(staff_list, safe=False, status=200)
        except Exception as e:
            logger.error(f"Error listing staffs: {str(e)}")
            return JsonResponse({'error': 'Failed to list staffs'}, status=500)

    return JsonResponse({'error': 'Method not allowed. Use GET.'}, status=405)


@csrf_exempt
@jwt_required
def my_shops(request):
    """Return shops managed by the authenticated manager (for UI shop switching)."""
    if request.method == 'GET':
        try:
            caller_account = getattr(request, 'account_user', None)
            
            if not caller_account:
                return JsonResponse({'error': 'Not authenticated'}, status=401)

            # Only managers can have multiple shops
            if isinstance(caller_account, Staff):
                return JsonResponse({'error': 'Staff cannot manage multiple shops'}, status=403)

            if not isinstance(caller_account, Manager):
                return JsonResponse({'error': 'Only managers can access multiple shops'}, status=403)

            # Return all shops for this manager
            shops = Shop.objects.filter(manager=caller_account).values('shop_id', 'shopname')
            
            shop_list = []
            for shop in shops:
                shop_list.append({
                    'shop_id': shop['shop_id'],
                    'shopname': shop['shopname'],
                    'manager': caller_account.phone
                })
            return JsonResponse(shop_list, safe=False, status=200)
        except Exception as e:
            logger.error(f"Error fetching my shops: {str(e)}")
            return JsonResponse({'error': 'Failed to fetch shops'}, status=500)

    return JsonResponse({'error': 'Method not allowed. Use GET.'}, status=405)


@csrf_exempt
@jwt_required
def switch_shop(request, shop_id):
    """Allow a manager to switch active shop context; returns a new token scoped to the selected shop."""
    if request.method == 'POST':
        try:
            caller_account = getattr(request, 'account_user', None)
            if not caller_account:
                return JsonResponse({'error': 'Not authenticated'}, status=401)

            # Only managers can switch shops
            if not isinstance(caller_account, Manager):
                return JsonResponse({'error': 'Only managers can switch shops'}, status=403)

            try:
                shop = Shop.objects.get(shop_id=shop_id)
            except Shop.DoesNotExist:
                return JsonResponse({'error': 'Shop not found'}, status=404)

            # Check if caller manages this shop
            if not shop.manager or str(caller_account.phone) != str(shop.manager.phone):
                return JsonResponse({'error': 'You do not manage this shop'}, status=403)

            # generate token with manager as account and shop as context
            token = generate_token(account_phone=caller_account.phone, shop_id=shop.shop_id)
            return JsonResponse({'success': True, 'token': token, 'shop': {'shop_id': shop.shop_id, 'shopname': shop.shopname, 'manager': shop.manager.phone if shop.manager else None}}, status=200)
        except Exception as e:
            logger.error(f"Error switching shop: {str(e)}")
            return JsonResponse({'error': 'Failed to switch shop'}, status=500)

    return JsonResponse({'error': 'Method not allowed. Use POST.'}, status=405)


@csrf_exempt
@jwt_required
def add_staff(request, shop_id):
    """Manager can add staff for their shop. Payload: phone, password, name"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            phone = data.get('phone')
            password = data.get('password')
            name = data.get('name')

            if not all([phone, password]):
                return JsonResponse({'error': 'Phone and password required'}, status=400)

            try:
                shop = Shop.objects.get(shop_id=shop_id)
            except Shop.DoesNotExist:
                return JsonResponse({'error': 'Shop not found'}, status=404)

            # Only the shop's manager can add staff
            caller_account = getattr(request, 'account_user', None)
            logger.debug(f"add_staff - caller_account: {caller_account}, type: {type(caller_account)}, shop.manager: {shop.manager}")
            
            if not caller_account or not isinstance(caller_account, Manager):
                return JsonResponse({'error': 'Only managers can add staff'}, status=403)
            
            if not shop.manager or str(caller_account.phone) != str(shop.manager.phone):
                logger.error(f"Permission denied - caller: {caller_account.phone}, shop manager: {shop.manager.phone if shop.manager else 'None'}")
                return JsonResponse({'error': f'Permission denied: Only this shop\'s manager can add staff'}, status=403)

            if Staff.objects.filter(phone=phone, shop=shop).exists():
                return JsonResponse({'error': 'Staff already exists for this shop'}, status=400)

            hashed = make_password(password)
            staff = Staff.objects.create(phone=phone, name=name, password=hashed, shop=shop)
            return JsonResponse({'message': 'Staff added', 'phone': staff.phone, 'shop_id': shop.shop_id}, status=201)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            logger.error(f"Error adding staff: {str(e)}")
            return JsonResponse({'error': 'Failed to add staff'}, status=500)

    return JsonResponse({'error': 'Method not allowed. Use POST.'}, status=405)


@csrf_exempt
@jwt_required
def remove_staff(request, shop_id, staff_phone):
    """Manager can remove staff for their shop."""
    if request.method == 'DELETE':
        try:
            try:
                shop = Shop.objects.get(shop_id=shop_id)
            except Shop.DoesNotExist:
                return JsonResponse({'error': 'Shop not found'}, status=404)

            # Only the shop's manager can remove staff
            caller_account = getattr(request, 'account_user', None)
            if not caller_account or not isinstance(caller_account, Manager):
                return JsonResponse({'error': 'Only managers can remove staff'}, status=403)
            
            if not shop.manager or str(caller_account.phone) != str(shop.manager.phone):
                return JsonResponse({'error': 'Permission denied: Only this shop\'s manager can remove staff'}, status=403)

            try:
                staff = Staff.objects.get(phone=staff_phone, shop=shop)
                staff.delete()
                return JsonResponse({'message': 'Staff removed'}, status=200)
            except Staff.DoesNotExist:
                return JsonResponse({'error': 'Staff not found'}, status=404)

        except Exception as e:
            logger.error(f"Error removing staff: {str(e)}")
            return JsonResponse({'error': 'Failed to remove staff'}, status=500)

    return JsonResponse({'error': 'Method not allowed. Use DELETE.'}, status=405)

@csrf_exempt
@jwt_required
def update_shop(request, shop_id):
    """Update shop information"""
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            
            caller_account = getattr(request, 'account_user', None)
            if not caller_account or not isinstance(caller_account, Manager):
                return JsonResponse({'error': 'Only managers can update shops'}, status=403)

            try:
                shop = Shop.objects.get(shop_id=shop_id)
            except Shop.DoesNotExist:
                return JsonResponse({'error': 'Shop not found'}, status=404)
            
            # Only the shop's manager can update it
            if not shop.manager or str(caller_account.phone) != str(shop.manager.phone):
                return JsonResponse({'error': 'Permission denied'}, status=403)
            
            # Update fields if provided
            updated = False
            
            if 'shopname' in data:
                shop.shopname = data['shopname']
                updated = True
            
            if not updated:
                return JsonResponse({'error': 'No fields to update'}, status=400)
            
            shop.save()
            return JsonResponse({'message': 'Shop updated successfully'}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
        except Exception as e:
            logger.error(f"Error updating user: {str(e)}")
            return JsonResponse({'error': 'Failed to update user'}, status=500)

    return JsonResponse({'error': 'Method not allowed. Use PUT.'}, status=405)

@csrf_exempt
@jwt_required
def delete_shop(request, shop_id):
    """Delete a shop"""
    if request.method == 'DELETE':
        try:
            caller_account = getattr(request, 'account_user', None)
            if not caller_account or not isinstance(caller_account, Manager):
                return JsonResponse({'error': 'Only managers can delete shops'}, status=403)

            try:
                shop = Shop.objects.get(shop_id=shop_id)
            except Shop.DoesNotExist:
                return JsonResponse({'error': 'Shop not found'}, status=404)
            
            # Only the shop's manager can delete it
            if not shop.manager or str(caller_account.phone) != str(shop.manager.phone):
                return JsonResponse({'error': 'Permission denied'}, status=403)

            shop.delete()
            return JsonResponse({'message': 'Shop deleted successfully'}, status=200)

        except Exception as e:
            logger.error(f"Error deleting user: {str(e)}")
            return JsonResponse({'error': 'Failed to delete user'}, status=500)

    return JsonResponse({'error': 'Method not allowed. Use DELETE.'}, status=405)


@csrf_exempt
@jwt_required
def add_shop(request):
    """Manager can add a new shop. Payload: shopname"""
    if request.method == 'POST':
        try:
            caller_account = getattr(request, 'account_user', None)
            
            if not caller_account or not isinstance(caller_account, Manager):
                return JsonResponse({'error': 'Only managers can add shops'}, status=403)

            data = json.loads(request.body)
            shopname = data.get('shopname')

            if not shopname:
                return JsonResponse({'error': 'Shopname is required'}, status=400)

            # Create new shop for this manager
            shop = Shop.objects.create(
                shopname=shopname,
                manager=caller_account
            )

            return JsonResponse({
                'message': 'Shop added successfully',
                'shop': {
                    'shop_id': shop.shop_id,
                    'shopname': shop.shopname,
                    'manager': shop.manager.phone
                }
            }, status=201)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            logger.error(f"Error adding shop: {str(e)}", exc_info=True)
            return JsonResponse({'error': 'Failed to add shop'}, status=500)

    return JsonResponse({'error': 'Method not allowed. Use POST.'}, status=405)
