from django.contrib import admin
from .models import Manager, Shop, Staff, Product, Batch, Order, OrderItem, Payment

# Register your models here.

@admin.register(Manager)
class ManagerAdmin(admin.ModelAdmin):
    list_display = ['phone', 'name']
    search_fields = ['phone', 'name']


@admin.register(Shop)
class ShopAdmin(admin.ModelAdmin):
    list_display = ['shop_id', 'shopname', 'contact_number', 'manager']
    list_filter = ['manager']
    search_fields = ['shop_id', 'shopname', 'contact_number', 'manager__name']


@admin.register(Staff)
class StaffAdmin(admin.ModelAdmin):
    list_display = ['phone', 'name', 'shop', 'is_active']
    list_filter = ['shop', 'is_active']
    search_fields = ['phone', 'name', 'shop__shopname']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['product_id', 'generic_name', 'brand_name', 'shop', 'gst', 'prescription_required']
    list_filter = ['shop', 'prescription_required', 'therapeutic_category']
    search_fields = ['product_id', 'generic_name', 'brand_name', 'shop__shopname']


@admin.register(Batch)
class BatchAdmin(admin.ModelAdmin):
    list_display = ['batch_number', 'product', 'shop', 'expiry_date', 'selling_price', 'quantity_in_stock']
    list_filter = ['shop', 'expiry_date']
    search_fields = ['batch_number', 'product__generic_name', 'shop__shopname']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_id', 'shop', 'customer_name', 'total_amount', 'discount_percentage', 'order_date']
    list_filter = ['shop', 'order_date']
    search_fields = ['order_id', 'customer_name', 'customer_number', 'shop__shopname']


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'batch', 'quantity', 'unit_price']
    search_fields = ['order__order_id', 'batch__batch_number']


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['order', 'payment_type', 'transaction_amount']
    list_filter = ['payment_type']
    search_fields = ['order__order_id']
