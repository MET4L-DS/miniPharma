import jwt
from datetime import datetime, timedelta
from django.conf import settings
from django.http import JsonResponse
from functools import wraps
from api.models import Register
import logging

logger = logging.getLogger(__name__)


def generate_token(user, days_valid: int = 7):
    """Generate a JWT token containing the user's phone and expiry."""
    payload = {
        'phone': str(user.phone),
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

    On success, attaches `request.register_user` to the Register instance.
    """

    @wraps(view_func)
    def _wrapped(request, *args, **kwargs):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Authentication credentials were not provided.'}, status=401)

        token = auth_header.split(' ', 1)[1].strip()
        try:
            payload = decode_token(token)
            phone = payload.get('phone')
            if not phone:
                return JsonResponse({'error': 'Invalid token payload.'}, status=401)

            try:
                user = Register.objects.get(phone=phone)
            except Register.DoesNotExist:
                return JsonResponse({'error': 'User not found for token.'}, status=401)

            # Attach user for downstream handlers
            request.register_user = user
            return view_func(request, *args, **kwargs)

        except jwt.ExpiredSignatureError:
            return JsonResponse({'error': 'Token has expired.'}, status=401)
        except Exception:
            return JsonResponse({'error': 'Invalid authentication token.'}, status=401)

    return _wrapped
