from django.db import models

# Create your models here.

class Product(models.Model):
    product_id = models.CharField(max_length=10, primary_key=True)
    brand_name = models.CharField(max_length=50, null=True)
    generic_name = models.CharField(max_length=50, null=True)
    hsn = models.CharField(max_length=50, null=True)
    gst = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    prescription_required = models.BooleanField(null=True)
    composition_id = models.IntegerField(null=True)
    therapeutic_category = models.CharField(max_length=50, null=True)

    def __str__(self):
        return self.product_id

class Batch(models.Model):
    batch_number = models.CharField(max_length=10)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    expiry_date = models.DateField()
    average_purchase_price = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity_in_stock = models.IntegerField(default=0)

    class Meta:
        unique_together = ('batch_number', 'product')

    def __str__(self):
        return f"{self.batch_number} - {self.product}"

class Order(models.Model):
    order_id = models.BigAutoField(primary_key=True)
    customer_name = models.CharField(max_length=100, null=True)
    customer_number = models.CharField(max_length=10, null=True)
    doctor_name = models.CharField(max_length=100, null=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    discount_percentage = models.FloatField(default=0)
    order_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order {self.order_id}"

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
        return f"Payment for Order {self.order.order_id}"

class Register(models.Model):
    manager = models.ForeignKey('self', on_delete=models.CASCADE, null=True)
    password = models.CharField(max_length=100, null=True)
    phone = models.CharField(max_length=10, primary_key=True)
    shopname = models.CharField(max_length=100, null=True)

    def __str__(self):
        return self.phone
