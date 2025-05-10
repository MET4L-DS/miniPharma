-- Script for adding, updating, and removing data in the pharmacy_shop database

-- 1. ADDING DATA

-- Add a new user
INSERT INTO USER (phone_number, password_hash, role) 
VALUES ('9876543210', 'hashed_password_123', 'Manager');

-- Add a new medicine
INSERT INTO MEDICINE (medicine_id, name, brand, hsn_code, therapeutic_category, gst_rate, requires_prescription, is_discontinued)
VALUES ('MED001', 'Paracetamol', 'Crocin', 'HSN1234', 'Analgesic', 12, 0, 0);

-- Add a batch for the medicine
INSERT INTO BATCH (batch_number, medicine_id, expiry_date, average_purchase_price, selling_price, quantity_in_stock)
VALUES ('BAT001', 'MED001', '2026-12-31', 5.50, 7.50, 100);

-- Add a new order
INSERT INTO ORDERS (customer_name, customer_number, doctor_name, total_amount, discount_percentage, order_date)
VALUES ('John Doe', '9123456789', 'Dr. Smith', 75.00, 5, NOW());

-- Add order items
INSERT INTO ORDER_ITEMS (order_id, medicine_id, batch_number, quantity, unit_price)
VALUES (1, 'MED001', 'BAT001', 10, 7.50);

-- Add payment for the order
INSERT INTO PAYMENT (order_id, payment_type, transaction_amount)
VALUES (1, 'UPI', 71.25);

-- 2. UPDATING DATA

-- Update user password
UPDATE USER 
SET password_hash = 'new_hashed_password_456'
WHERE phone_number = '9876543210';

-- Update medicine details
UPDATE MEDICINE 
SET name = 'Paracetamol 500mg', 
    therapeutic_category = 'Analgesic/Antipyretic'
WHERE medicine_id = 'MED001';

-- Update batch stock and price
UPDATE BATCH 
SET quantity_in_stock = quantity_in_stock + 50,
    selling_price = 8.00
WHERE batch_number = 'BAT001' AND medicine_id = 'MED001';

-- Update order details
UPDATE ORDERS 
SET total_amount = 80.00,
    discount_percentage = 10
WHERE order_id = 1;

-- Update payment amount
UPDATE PAYMENT 
SET transaction_amount = 72.00
WHERE order_id = 1;

-- 3. REMOVING DATA

-- Remove payment record
DELETE FROM PAYMENT 
WHERE order_id = 1;

-- Remove order items
DELETE FROM ORDER_ITEMS 
WHERE order_id = 1 AND medicine_id = 'MED001' AND batch_number = 'BAT001';

-- Remove order
DELETE FROM ORDERS 
WHERE order_id = 1;

-- Remove batch
DELETE FROM BATCH 
WHERE batch_number = 'BAT001' AND medicine_id = 'MED001';

-- Remove medicine
UPDATE MEDICINE 
SET is_discontinued = 1
WHERE medicine_id = 'MED001';

-- Remove user
DELETE FROM USER 
WHERE phone_number = '9876543210';

-- Note: The deletion operations respect the foreign key constraints
-- Ensure to delete dependent records first to avoid constraint violations
-- Medicine is marked as discontinued instead of deleted to maintain historical data
