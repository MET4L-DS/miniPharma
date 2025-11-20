from django.urls import path
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .views import (
    ProductView,
    BatchView,
    register_user,
    login_user,
    get_users,
    update_shop,
    delete_shop,
    create_order,
    get_orders,
    get_order_items,
    update_order,
    delete_order,
    add_order_items,
    add_payment,
    update_payment,
    delete_payment,
    get_payments,
    get_payment_summary,  # Add this import
    get_medicine_suggestions,
    search_medicines_with_batches,
    get_dashboard_stats,
    get_expiring_soon,
    get_low_stock,
    get_sales_data,
    predict_salts,
    list_staffs,
    add_staff,
    remove_staff,
    my_shops,
    switch_shop,
    add_shop,
)

@api_view(['GET'])
def welcome_view(request):
    return Response({
        'message': 'Welcome to miniPharma API',
        'version': '1.0',
        'status': 'running',
        'endpoints': {
            'products': '/api/products/',
            'batches': '/api/batches/',
            'users': '/api/users/',
            'orders': '/api/orders/',
            'payments': '/api/payments/',
            'search': '/api/search/medicines/',
            'dashboard': '/api/dashboard/stats/',
        }
    })

urlpatterns = [
    # ==================== WELCOME ====================
    path('', welcome_view, name='api_welcome'),
    # ==================== PRODUCT URLS ====================
    path('products/', ProductView.as_view(), name='products'),  # GET all, POST new
    path('products/<str:product_id>/', ProductView.as_view(), name='product_detail'),  # GET, PUT, DELETE specific
    
    # ==================== BATCH URLS ====================
    path('batches/', BatchView.as_view(), name='batches'),  # GET all, POST new
    path('batches/<int:batch_id>/', BatchView.as_view(), name='batch_detail'),  # GET, PUT, DELETE specific
    
    # ==================== USER/REGISTER URLS ====================
    path('register/', register_user, name='register_user'),  # POST
    path('login/', login_user, name='login_user'),  # POST
    path('users/', get_users, name='get_users'),  # GET all shops
    path('shops/<int:shop_id>/', update_shop, name='update_shop'),  # PUT
    path('shops/<int:shop_id>/delete/', delete_shop, name='delete_shop'),  # DELETE
    
    # ==================== ORDER URLS ====================
    path('orders/', get_orders, name='get_orders'),  # GET all
    path('orders/create/', create_order, name='create_order'),  # POST
    path('orders/<int:order_id>/', update_order, name='update_order'),  # PUT
    path('orders/<int:order_id>/delete/', delete_order, name='delete_order'),  # DELETE
    
    # ==================== ORDER ITEMS URLS ====================
    path('order-items/', add_order_items, name='add_order_items'),  # POST
    path('orders/<int:order_id>/items/', get_order_items, name='get_order_items'),  # GET
    
    # ==================== PAYMENT URLS ====================
    path('payments/', get_payments, name='get_payments'),  # GET all
    path('payments/summary/', get_payment_summary, name='get_payment_summary'),  # GET summary
    path('payments/add/', add_payment, name='add_payment'),  # POST
    path('payments/<int:order_id>/', update_payment, name='update_payment'),  # PUT
    path('payments/<int:order_id>/delete/', delete_payment, name='delete_payment'),  # DELETE
    
    # ==================== SEARCH URLS ====================
    path('search/medicines/', search_medicines_with_batches, name='search_medicines_with_batches'),
    path('search/suggestions/', get_medicine_suggestions, name='get_medicine_suggestions'),
    path('predict/salts/', predict_salts, name='predict_salts'),

    
    # ==================== DASHBOARD/ANALYTICS URLS ====================
    path('dashboard/stats/', get_dashboard_stats, name='dashboard_stats'),  # GET
    path('dashboard/expiring-soon/', get_expiring_soon, name='expiring_soon'),  # GET
    path('dashboard/low-stock/', get_low_stock, name='low_stock'),  # GET
    path('dashboard/sales/', get_sales_data, name='sales_data'),  # GET

    # ==================== SHOP STAFF MANAGEMENT ====================
    path('shops/<int:shop_id>/staffs/', list_staffs, name='list_staffs'),  # GET
    path('shops/<int:shop_id>/staffs/add/', add_staff, name='add_staff'),  # POST
    path('shops/<int:shop_id>/staffs/<str:staff_phone>/remove/', remove_staff, name='remove_staff'),  # DELETE
    path('shops/mine/', my_shops, name='my_shops'),  # GET
    path('shops/add/', add_shop, name='add_shop'),  # POST - Add new shop for manager
    path('shops/<int:shop_id>/switch/', switch_shop, name='switch_shop'),  # POST
]