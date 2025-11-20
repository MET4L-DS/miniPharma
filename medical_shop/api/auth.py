import jwt
from datetime import datetime, timedelta
from django.conf import settings
from django.http import JsonResponse
from functools import wraps
from api.models import Shop, Staff, Manager
import logging

logger = logging.getLogger(__name__)


def generate_token(user=None, *, account_phone: str = None, shop_id: int = None, days_valid: int = 7):
    """Generate a JWT token.

    Payload fields:
    - 'account': phone of the account performing actions (Manager or Staff)
    - 'shop': shop_id of the shop context

    For new Manager registrations, account will be the manager's phone and shop will be the shop_id.
    """
    # Determine account/shop
    acct = account_phone
    shop = shop_id
    if user is not None:
        try:
            if isinstance(user, Manager):
                acct = acct or str(user.phone)
                # shop must be provided separately for Manager
            elif isinstance(user, Shop):
                # Shop instance - use manager as account if available
                acct = acct or (str(user.manager.phone) if user.manager else None)
                shop = shop or user.shop_id
            elif isinstance(user, Staff):
                acct = acct or str(user.phone)
                shop = shop or user.shop.shop_id
        except Exception:
            # Fallback if types are unexpected
            acct = acct or getattr(user, 'phone', None)
            shop = shop or getattr(user, 'shop_id', None)

    payload = {
        'account': str(acct) if acct else None,
        'shop': int(shop) if shop else None,
        'exp': datetime.utcnow() + timedelta(days=days_valid),
        'iat': datetime.utcnow(),
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    # PyJWT >=2 returns str
    if isinstance(token, bytes):
        token = token.decode('utf-8')
    return token


def decode_token(token):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        raise
    except Exception as e:
        logger.debug(f"Token decode error: {e}")
        raise


def jwt_required(view_func):
    """Decorator for views to require a valid JWT in Authorization header.

    On success, attaches `request.register_user` to the Shop instance.
    """

    @wraps(view_func)
    def _wrapped(request, *args, **kwargs):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Authentication credentials were not provided.'}, status=401)

        token = auth_header.split(' ', 1)[1].strip()
        try:
            payload = decode_token(token)

            # Get account phone and shop_id from token
            account_phone = payload.get('account')
            shop_id = payload.get('shop')

            if not shop_id:
                return JsonResponse({'error': 'Invalid token payload.'}, status=401)

            # Resolve shop
            try:
                shop = Shop.objects.get(shop_id=shop_id)
            except Shop.DoesNotExist:
                return JsonResponse({'error': 'Shop not found for token.'}, status=401)

            # Resolve account: prefer Staff for the given shop, else Manager
            account = None
            if account_phone:
                try:
                    account = Staff.objects.get(phone=account_phone, shop=shop)
                except Staff.DoesNotExist:
                    try:
                        account = Manager.objects.get(phone=account_phone)
                    except Manager.DoesNotExist:
                        account = None

            # Attach for downstream
            request.register_user = shop
            request.account_user = account
            return view_func(request, *args, **kwargs)

        except jwt.ExpiredSignatureError:
            return JsonResponse({'error': 'Token has expired.'}, status=401)
        except Exception:
            return JsonResponse({'error': 'Invalid authentication token.'}, status=401)

    return _wrapped
