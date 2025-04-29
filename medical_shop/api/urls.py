from django.urls import path
from . import views
from .views import AddMedicineView
from .views import get_all_products
urlpatterns = [
    
    path('add-medicine/',AddMedicineView.as_view(),name='add-medicine'),
    path('products/',views.get_all_products,name='get_all_products'),
]
