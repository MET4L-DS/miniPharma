from django.db import models

# Create your models here.

class Register(models.Model):
    """Pharmacy/Shop registration - each entry represents a pharmacy"""
    manager = models.ForeignKey('self', on_delete=models.CASCADE, null=True)
    password = models.CharField(max_length=100, null=True)
    phone = models.CharField(max_length=10, primary_key=True)
    shopname = models.CharField(max_length=100, null=True)

    def __str__(self):
        return f"{self.shopname} ({self.phone})"

class Product(models.Model):
    product_id = models.CharField(max_length=10)
    shop = models.ForeignKey(Register, on_delete=models.CASCADE, related_name='products')
    brand_name = models.CharField(max_length=50, null=True)
    generic_name = models.CharField(max_length=50, null=True)
    hsn = models.CharField(max_length=50, null=True)
    gst = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    prescription_required = models.BooleanField(null=True)
    composition_id = models.IntegerField(null=True)
    therapeutic_category = models.CharField(max_length=50, null=True)

    class Meta:
        db_table = 'api_product'
        unique_together = ('product_id', 'shop')

    def __str__(self):
        return f"{self.product_id} - {self.shop.shopname}"

class Batch(models.Model):
    batch_number = models.CharField(max_length=10)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    shop = models.ForeignKey(Register, on_delete=models.CASCADE, related_name='batches')
    expiry_date = models.DateField()
    average_purchase_price = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity_in_stock = models.IntegerField(default=0)

    class Meta:
        db_table = 'api_batch'
        unique_together = ('batch_number', 'product', 'shop')

    def __str__(self):
        return f"{self.batch_number} - {self.product} - {self.shop.shopname}"

class Order(models.Model):
    order_id = models.BigAutoField(primary_key=True)
    shop = models.ForeignKey(Register, on_delete=models.CASCADE, related_name='orders')
    customer_name = models.CharField(max_length=100, null=True)
    customer_number = models.CharField(max_length=10, null=True)
    doctor_name = models.CharField(max_length=100, null=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    discount_percentage = models.FloatField(default=0)
    order_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order {self.order_id} - {self.shop.shopname}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE)
    quantity = models.IntegerField(null=True)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, null=True)

    class Meta:
        unique_together = ('order', 'batch')

    def __str__(self):
        return f"Order {self.order.order_id} - {self.batch}"

class Payment(models.Model):
    PAYMENT_TYPES = [
        ('UPI', 'UPI'),
        ('CASH', 'CASH'),
    ]
    
    order = models.OneToOneField(Order, on_delete=models.CASCADE, primary_key=True)
    payment_type = models.CharField(max_length=4, choices=PAYMENT_TYPES)
    transaction_amount = models.FloatField(null=True)

    def __str__(self):
        return f"Payment for Order {self.order.order_id} - {self.order.shop.shopname}"

