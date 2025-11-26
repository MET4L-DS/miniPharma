from django.db import models

# Create your models here.

class Manager(models.Model):
    """Manager account - can manage multiple shops"""
    phone = models.CharField(max_length=10, primary_key=True)
    name = models.CharField(max_length=100)
    password = models.CharField(max_length=100)

    class Meta:
        db_table = 'api_manager'

    def __str__(self):
        return f"{self.name} ({self.phone})"


class Shop(models.Model):
    """Pharmacy/Shop - each entry represents a pharmacy"""
    shop_id = models.AutoField(primary_key=True)
    shopname = models.CharField(max_length=100)
    manager = models.ForeignKey(Manager, on_delete=models.CASCADE, related_name='shops')

    class Meta:
        db_table = 'api_shop'
        indexes = [
            models.Index(fields=['manager']),
        ]

    def __str__(self):
        return f"{self.shopname} (ID: {self.shop_id})"


class Staff(models.Model):
    """Staff accounts tied to a specific shop"""
    phone = models.CharField(max_length=10, primary_key=True)
    name = models.CharField(max_length=100)
    password = models.CharField(max_length=100)
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='staff_members')
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'api_staff'
        indexes = [
            models.Index(fields=['shop', 'is_active']),
        ]

    def __str__(self):
        return f"{self.name} ({self.phone}) @ {self.shop.shopname}"


class Product(models.Model):
    """Products/Medicines in a shop"""
    id = models.AutoField(primary_key=True)
    product_id = models.CharField(max_length=10)
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='products')
    brand_name = models.CharField(max_length=100, null=True, blank=True)
    generic_name = models.CharField(max_length=100)
    hsn = models.CharField(max_length=50, null=True, blank=True)
    gst = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    prescription_required = models.BooleanField(default=False)
    composition_id = models.IntegerField(null=True, blank=True)
    therapeutic_category = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        db_table = 'api_product'
        unique_together = ('product_id', 'shop')
        indexes = [
            models.Index(fields=['shop', 'product_id']),
            models.Index(fields=['shop', 'generic_name']),
        ]

    def __str__(self):
        return f"{self.generic_name} ({self.product_id}) - {self.shop.shopname}"


class Batch(models.Model):
    """Product batches with stock and pricing"""
    id = models.BigAutoField(primary_key=True)
    batch_number = models.CharField(max_length=50)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='batches')
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='batches')
    expiry_date = models.DateField()
    average_purchase_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity_in_stock = models.IntegerField(default=0)

    class Meta:
        db_table = 'api_batch'
        unique_together = ('batch_number', 'product', 'shop')
        indexes = [
            models.Index(fields=['shop', 'expiry_date']),
            models.Index(fields=['shop', 'quantity_in_stock']),
        ]

    def __str__(self):
        return f"Batch {self.batch_number} - {self.product.generic_name} - {self.shop.shopname}"


class Order(models.Model):
    """Customer orders/bills"""
    order_id = models.BigAutoField(primary_key=True)
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='orders')
    customer_name = models.CharField(max_length=100, null=True, blank=True)
    customer_number = models.CharField(max_length=10, null=True, blank=True)
    doctor_name = models.CharField(max_length=100, null=True, blank=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    discount_percentage = models.FloatField(default=0)
    order_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'api_order'
        indexes = [
            models.Index(fields=['shop', '-order_date']),
            models.Index(fields=['shop', 'customer_number']),
        ]

    def __str__(self):
        return f"Order {self.order_id} - {self.shop.shopname} - {self.order_date}"


class OrderItem(models.Model):
    """Items in an order"""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    batch = models.ForeignKey(Batch, on_delete=models.PROTECT, related_name='order_items')
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'api_orderitem'
        unique_together = ('order', 'batch')

    def __str__(self):
        return f"Order {self.order.order_id} - {self.batch.product.generic_name} x{self.quantity}"


class Payment(models.Model):
    """Payment information for orders"""
    PAYMENT_TYPES = [
        ('UPI', 'UPI'),
        ('CASH', 'Cash'),
        ('CARD', 'Card'),
    ]
    
    order = models.OneToOneField(Order, on_delete=models.CASCADE, primary_key=True, related_name='payment')
    payment_type = models.CharField(max_length=4, choices=PAYMENT_TYPES)
    transaction_amount = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'api_payment'

    def __str__(self):
        return f"Payment for Order {self.order.order_id} - {self.payment_type} - ₹{self.transaction_amount}"

