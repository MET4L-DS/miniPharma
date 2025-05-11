from django.urls import path
from . import views
from .views import AddMedicineView
from .views import AddBatchView

urlpatterns = [
    
    path('add-medicine/',AddMedicineView.as_view(),name='add-medicine'),
    path('products/',views.get_all_products,name='get_all_products'),
    path('register/',views.register_user,name='register_user'),
    path('login/',views.login_user,name="login_user"),
    path('orders/',views.to_orders,name='to_orders'),
    path('add-batch/',AddBatchView.as_view(),name='add-batch'),
    path('search-items/',views.search_items,name='search_items'),
    path('add-invoice/',views.add_invoice_items,name='add_invoice_items'),
    path('add-payment/',views.add_payment,name='add_payment'),

]
