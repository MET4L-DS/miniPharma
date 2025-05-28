from django.urls import path
from .views import (
    ProductView,
    BatchView,
    register_user,
    login_user,
    get_users,
    update_user,
    delete_user,
    create_order,
    get_orders,
    update_order,
    delete_order,
    add_order_items,
    add_payment,
    update_payment,
    delete_payment,
    get_payments,
    search_items,
    get_dashboard_stats,
    get_expiring_soon,
    get_low_stock,
)

urlpatterns = [
    # ==================== PRODUCT URLS ====================
    path('products/', ProductView.as_view(), name='products'),  # GET all, POST new
    path('products/<str:product_id>/', ProductView.as_view(), name='product_detail'),  # GET, PUT, DELETE specific
    
    # ==================== BATCH URLS ====================
    path('batches/', BatchView.as_view(), name='batches'),  # GET all, POST new
    path('batches/<int:batch_id>/', BatchView.as_view(), name='batch_detail'),  # GET, PUT, DELETE specific
    
    # ==================== USER/REGISTER URLS ====================
    path('register/', register_user, name='register_user'),  # POST
    path('login/', login_user, name='login_user'),  # POST
    path('users/', get_users, name='get_users'),  # GET all
    path('users/<str:phone>/', update_user, name='update_user'),  # PUT
    path('users/<str:phone>/delete/', delete_user, name='delete_user'),  # DELETE
    
    # ==================== ORDER URLS ====================
    path('orders/', get_orders, name='get_orders'),  # GET all
    path('orders/create/', create_order, name='create_order'),  # POST
    path('orders/<int:order_id>/', update_order, name='update_order'),  # PUT
    path('orders/<int:order_id>/delete/', delete_order, name='delete_order'),  # DELETE
    
    # ==================== ORDER ITEMS URLS ====================
    path('order-items/', add_order_items, name='add_order_items'),  # POST
    
    # ==================== PAYMENT URLS ====================
    path('payments/', get_payments, name='get_payments'),  # GET all
    path('payments/add/', add_payment, name='add_payment'),  # POST
    path('payments/<int:order_id>/', update_payment, name='update_payment'),  # PUT
    path('payments/<int:order_id>/delete/', delete_payment, name='delete_payment'),  # DELETE
    
    # ==================== SEARCH URLS ====================
    path('search/', search_items, name='search_items'),  # GET with query param
    
    # ==================== DASHBOARD/ANALYTICS URLS ====================
    path('dashboard/stats/', get_dashboard_stats, name='dashboard_stats'),  # GET
    path('dashboard/expiring-soon/', get_expiring_soon, name='expiring_soon'),  # GET
    path('dashboard/low-stock/', get_low_stock, name='low_stock'),  # GET
]
