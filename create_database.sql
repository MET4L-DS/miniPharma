-- Create DATABASE AND USE IT
DROP DATABASE IF EXISTS `pharmacy_shop`;
CREATE DATABASE `pharmacy_shop`; 
USE `pharmacy_shop`;

-- Create USER table
CREATE TABLE USER (
    phone_number VARCHAR(10) PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL,
    manager VARCHAR(10),
    role VARCHAR(10) DEFAULT 'Manager',
    FOREIGN KEY (manager) REFERENCES USER(phone_number) ON DELETE SET NULL
);

-- Create MEDICINE table
CREATE TABLE MEDICINE (
    medicine_id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    brand VARCHAR(100),
    hsn_code VARCHAR(20),
    therapeutic_category VARCHAR(100),
    gst_rate FLOAT DEFAULT 12,
    requires_prescription TINYINT(1) DEFAULT 1,
    is_discontinued TINYINT(1) DEFAULT 0
);

-- Create BATCH table
CREATE TABLE BATCH (
    batch_number VARCHAR(10),
    medicine_id VARCHAR(10),
    expiry_date DATE NOT NULL,
    average_purchase_price DECIMAL(10, 2),
    selling_price DECIMAL(10, 2) NOT NULL,
    quantity_in_stock INT DEFAULT 0,
    PRIMARY KEY (batch_number, medicine_id),
    FOREIGN KEY (medicine_id) REFERENCES MEDICINE(medicine_id) ON DELETE CASCADE
);

-- Create ORDERS table
CREATE TABLE ORDERS (
    order_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100),
    customer_number VARCHAR(10),
    doctor_name VARCHAR(100),
    total_amount DECIMAL(10, 2),
    discount_percentage FLOAT DEFAULT 0,
    order_date DATETIME DEFAULT NOW(),
);

-- Create ORDER_ITEMS table
CREATE TABLE ORDER_ITEMS (
    order_id BIGINT,
    medicine_id VARCHAR(10),
    batch_number VARCHAR(10),
    quantity INT,
    unit_price DECIMAL(10, 2),
    PRIMARY KEY (order_id, medicine_id, batch_number),
    FOREIGN KEY (order_id) REFERENCES ORDERS(order_id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id, batch_number) REFERENCES BATCH(medicine_id, batch_number) ON DELETE CASCADE
);

-- Create PAYMENT table
CREATE TABLE PAYMENT (
    order_id BIGINT PRIMARY KEY,
    payment_type ENUM('UPI', 'CASH') NOT NULL,
    transaction_amount FLOAT,
    FOREIGN KEY (order_id) REFERENCES ORDERS(order_id) ON DELETE CASCADE
);
