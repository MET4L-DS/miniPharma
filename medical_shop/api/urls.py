from django.urls import path
from . import views
from .views import AddMedicineView
from .views import get_all_products
from .views import register_user
from .views import login_user
from .views import to_orders
urlpatterns = [
    
    path('add-medicine/',AddMedicineView.as_view(),name='add-medicine'),
    path('products/',views.get_all_products,name='get_all_products'),
    path('register/',views.register_user,name='register_user'),
    path('login/',views.login_user,name="login_user"),
    path('orders/',views.to_orders,name='to_orders')
]
