import os
import sys
from pathlib import Path
import django
from datetime import datetime, timedelta
from decimal import Decimal
import random

# Ensure project root is on sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "medical_shop.settings")
django.setup()

from api.models import Product, Batch, Order, OrderItem, Payment

# Clear existing data (optional - comment out if you want to keep existing data)
print("Clearing existing data...")
Payment.objects.all().delete()
OrderItem.objects.all().delete()
Order.objects.all().delete()
Batch.objects.all().delete()
Product.objects.all().delete()

print("Creating dummy products...")
products_data = [
    # Generic medicines
    {
        "product_id": "MED001",
        "brand_name": "Paracetamol",
        "generic_name": "Acetaminophen",
        "hsn": "30049011",
        "gst": 12.00,
        "prescription_required": False,
        "composition_id": 1,
        "therapeutic_category": "Analgesic",
    },
    {
        "product_id": "MED002",
        "brand_name": "Dolo 650",
        "generic_name": "Paracetamol",
        "hsn": "30049011",
        "gst": 12.00,
        "prescription_required": False,
        "composition_id": 2,
        "therapeutic_category": "Antipyretic",
    },
    {
        "product_id": "MED003",
        "brand_name": "Crocin Advance",
        "generic_name": "Paracetamol",
        "hsn": "30049011",
        "gst": 12.00,
        "prescription_required": False,
        "composition_id": 3,
        "therapeutic_category": "Analgesic",
    },
    {
        "product_id": "MED004",
        "brand_name": "Azithromycin",
        "generic_name": "Azithromycin",
        "hsn": "30042090",
        "gst": 12.00,
        "prescription_required": True,
        "composition_id": 4,
        "therapeutic_category": "Antibiotic",
    },
    {
        "product_id": "MED005",
        "brand_name": "Amoxicillin",
        "generic_name": "Amoxicillin",
        "hsn": "30042090",
        "gst": 12.00,
        "prescription_required": True,
        "composition_id": 5,
        "therapeutic_category": "Antibiotic",
    },
    {
        "product_id": "MED006",
        "brand_name": "Cipro 500",
        "generic_name": "Ciprofloxacin",
        "hsn": "30042090",
        "gst": 12.00,
        "prescription_required": True,
        "composition_id": 6,
        "therapeutic_category": "Antibiotic",
    },
    {
        "product_id": "MED007",
        "brand_name": "Cetirizine",
        "generic_name": "Cetirizine",
        "hsn": "30049099",
        "gst": 12.00,
        "prescription_required": False,
        "composition_id": 7,
        "therapeutic_category": "Antihistamine",
    },
    {
        "product_id": "MED008",
        "brand_name": "Allegra 120",
        "generic_name": "Fexofenadine",
        "hsn": "30049099",
        "gst": 12.00,
        "prescription_required": False,
        "composition_id": 8,
        "therapeutic_category": "Antihistamine",
    },
    {
        "product_id": "MED009",
        "brand_name": "Omeprazole",
        "generic_name": "Omeprazole",
        "hsn": "30049039",
        "gst": 12.00,
        "prescription_required": False,
        "composition_id": 9,
        "therapeutic_category": "Antacid",
    },
    {
        "product_id": "MED010",
        "brand_name": "Pantoprazole",
        "generic_name": "Pantoprazole",
        "hsn": "30049039",
        "gst": 12.00,
        "prescription_required": False,
        "composition_id": 10,
        "therapeutic_category": "Antacid",
    },
    {
        "product_id": "MED011",
        "brand_name": "Metformin 500",
        "generic_name": "Metformin",
        "hsn": "30049049",
        "gst": 12.00,
        "prescription_required": True,
        "composition_id": 11,
        "therapeutic_category": "Antidiabetic",
    },
    {
        "product_id": "MED012",
        "brand_name": "Glimepiride",
        "generic_name": "Glimepiride",
        "hsn": "30049049",
        "gst": 12.00,
        "prescription_required": True,
        "composition_id": 12,
        "therapeutic_category": "Antidiabetic",
    },
    {
        "product_id": "MED013",
        "brand_name": "Amlodipine",
        "generic_name": "Amlodipine",
        "hsn": "30049019",
        "gst": 12.00,
        "prescription_required": True,
        "composition_id": 13,
        "therapeutic_category": "Antihypertensive",
    },
    {
        "product_id": "MED014",
        "brand_name": "Atenolol",
        "generic_name": "Atenolol",
        "hsn": "30049019",
        "gst": 12.00,
        "prescription_required": True,
        "composition_id": 14,
        "therapeutic_category": "Antihypertensive",
    },
    {
        "product_id": "MED015",
        "brand_name": "Vitamin C",
        "generic_name": "Ascorbic Acid",
        "hsn": "30049091",
        "gst": 12.00,
        "prescription_required": False,
        "composition_id": 15,
        "therapeutic_category": "Vitamin",
    },
    {
        "product_id": "MED016",
        "brand_name": "Vitamin D3",
        "generic_name": "Cholecalciferol",
        "hsn": "30049091",
        "gst": 12.00,
        "prescription_required": False,
        "composition_id": 16,
        "therapeutic_category": "Vitamin",
    },
    {
        "product_id": "MED017",
        "brand_name": "Multivitamin",
        "generic_name": "Multivitamin",
        "hsn": "30049091",
        "gst": 12.00,
        "prescription_required": False,
        "composition_id": 17,
        "therapeutic_category": "Supplement",
    },
    {
        "product_id": "MED018",
        "brand_name": "Ibuprofen",
        "generic_name": "Ibuprofen",
        "hsn": "30049011",
        "gst": 12.00,
        "prescription_required": False,
        "composition_id": 18,
        "therapeutic_category": "NSAID",
    },
    {
        "product_id": "MED019",
        "brand_name": "Diclofenac",
        "generic_name": "Diclofenac",
        "hsn": "30049011",
        "gst": 12.00,
        "prescription_required": False,
        "composition_id": 19,
        "therapeutic_category": "NSAID",
    },
    {
        "product_id": "MED020",
        "brand_name": "Aspirin",
        "generic_name": "Acetylsalicylic Acid",
        "hsn": "30049011",
        "gst": 12.00,
        "prescription_required": False,
        "composition_id": 20,
        "therapeutic_category": "Antiplatelet",
    },
]

products = []
for prod_data in products_data:
    product = Product.objects.create(**prod_data)
    products.append(product)
    print(f"  Created: {product.brand_name}")

print(f"\nCreated {len(products)} products.")

print("\nCreating dummy batches...")
batches = []
batch_counter = 1
for product in products:
    # Create 2-3 batches per product
    num_batches = random.randint(2, 3)
    for i in range(num_batches):
        expiry_date = datetime.now().date() + timedelta(days=random.randint(180, 730))
        avg_purchase = Decimal(random.randint(20, 500))
        selling_price = avg_purchase * Decimal(random.uniform(1.2, 1.8))
        quantity = random.randint(10, 200)

        batch = Batch.objects.create(
            batch_number=f"B{batch_counter:04d}",
            product=product,
            expiry_date=expiry_date,
            average_purchase_price=avg_purchase,
            selling_price=round(selling_price, 2),
            quantity_in_stock=quantity,
        )
        batches.append(batch)
        batch_counter += 1

print(f"Created {len(batches)} batches.")

print("\nCreating dummy orders and sales...")
customer_names = [
    "Rajesh Kumar",
    "Priya Sharma",
    "Amit Patel",
    "Sneha Reddy",
    "Vikram Singh",
    "Anita Desai",
    "Ravi Verma",
    "Deepika Nair",
    "Suresh Gupta",
    "Kavita Joshi",
    "Arjun Mehta",
    "Pooja Iyer",
    "Nikhil Rao",
    "Swati Malhotra",
    "Akash Chopra",
]

doctor_names = [
    "Dr. Ramesh Kumar",
    "Dr. Sunita Patel",
    "Dr. Anil Sharma",
    "Dr. Meera Reddy",
    "Dr. Rajiv Singh",
    "Dr. Neha Gupta",
    "Dr. Suresh Rao",
    "Dr. Anjali Verma",
]

orders_count = 30
for i in range(orders_count):
    # Random date within last 60 days
    days_ago = random.randint(0, 60)
    order_date = datetime.now() - timedelta(days=days_ago)

    customer = random.choice(customer_names)
    customer_number = f"{random.randint(7000000000, 9999999999)}"
    doctor = random.choice(doctor_names) if random.random() > 0.3 else None
    discount = random.choice([0, 0, 0, 5, 10, 15])  # Most orders have no discount

    order = Order.objects.create(
        customer_name=customer,
        customer_number=customer_number,
        doctor_name=doctor,
        discount_percentage=discount,
        total_amount=0,  # Will calculate later
    )

    # Manually set order_date (since auto_now_add prevents this)
    Order.objects.filter(pk=order.pk).update(order_date=order_date)
    order.refresh_from_db()

    # Add 1-5 items to order
    num_items = random.randint(1, 5)
    selected_batches = random.sample(batches, min(num_items, len(batches)))

    order_total = Decimal(0)
    for batch in selected_batches:
        quantity = random.randint(1, 5)
        unit_price = batch.selling_price

        # Only add if batch has sufficient stock
        if batch.quantity_in_stock >= quantity:
            OrderItem.objects.create(
                order=order, batch=batch, quantity=quantity, unit_price=unit_price
            )

            # Update batch stock
            batch.quantity_in_stock -= quantity
            batch.save()

            order_total += unit_price * quantity

    # Apply discount
    if discount > 0:
        order_total = order_total * (1 - Decimal(discount) / 100)

    order.total_amount = round(order_total, 2)
    order.save()

    # Create payment
    payment_type = random.choice(["UPI", "UPI", "UPI", "CASH"])  # More UPI payments
    Payment.objects.create(
        order=order,
        payment_type=payment_type,
        transaction_amount=float(order.total_amount),
    )

print(f"Created {orders_count} orders with items and payments.")

# Print summary
print("\n" + "=" * 50)
print("DUMMY DATA POPULATION COMPLETE!")
print("=" * 50)
print(f"Products: {Product.objects.count()}")
print(f"Batches: {Batch.objects.count()}")
print(f"Orders: {Order.objects.count()}")
print(f"Order Items: {OrderItem.objects.count()}")
print(f"Payments: {Payment.objects.count()}")
print(f"Total Sales Amount: ₹{sum(o.total_amount for o in Order.objects.all()):.2f}")
print("=" * 50)
