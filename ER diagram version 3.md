```mermaid
erDiagram
   
	OWNER {
        string owner_id PK
        string name
        string email
        string phone
    }

	SHOP {
        string shop_id PK
        string owner_id FK	"references OWNER(owner_id)"
        string shop_name
        string location
        string contact_info
    }

	USER {
    string user_id PK
    string shop_id FK	"references SHOP(shop_id)"
    string manager FK "references USER(user_id)"
    string full_name
    string email
    string phone_number
    string password_hash
    string role "default Manager"
    }

    PRODUCT {
        string product_id PK
        string shop_id FK	"references SHOP(shop_id)"	
        string name
        string brand
        string hsn_code
        string category
        string manufacturer
        decimal unit_price
        float gst_rate "default 12%"
        boolean requires_prescription "default yes"
    }

	BATCH {
        string batch_id PK		"surrogate key"
        string product_id FK	"references PRODUCT(product_id)"
        string supplier_id FK	"references SUPPLIER(supplier_id)"
        string shop_id FK		"references SHOP(shop_id)"
        string batch_number
        date expiry_date
        date purchase_date
        date receive_date
        decimal purchase_price
        int quantity_in_stock
    }

	SUPPLIER {
		string supplier_id PK
		string name
		string contact_person
		string phone
		string email
		string address
		string licence_number
	}
	
	CUSTOMER {
		string customer_id PK
		string name
		string phone
		string email
		string address
		string prescription_doc
	}
	
	ORDER {
		string order_id PK
		string user_id FK		"references USER(user_id)"
		string customer_id FK	"references CUSTOMER(customer_id)"
		string shop_id FK		"references SHOP(shop_id)"
        date sale_date
		decimal total_amount
		decimal discount_amount
	}

    ORDER_ITEMS {
        string sale_item_id PK
        string shop_id FK		"references SHOP(shop_id)"
        string order_id FK		"references ORDER(order_id)"
        string product_id FK	"references PRODUCT(product_id)"
        string batch_id FK		"references BATCH(batch_id)"
        int quantity_sold
        decimal unit_price
    }

    PAYMENT {
        string payment_id PK	"surrogate key, generated during transaction"
        string order_id FK		"references ORDER(order_id)"	
        string payment_type 	"UPI, CASH, etc."
        datetime payment_time
        string transaction_reference	"for card/upi etc ref id "
        float transaction_amount
    }
    
    RETURNS {
		string return_id PK
		string order_id FK		"references ORDER(order_id)"
		string batch_id FK		"references BATCH(batch_id)"
		string quantity_returned
		string reason
		datetime return_date
	}

    FORECAST {
        string forecast_id PK
        string shop_id FK		"references SHOP(shop_id)"
        string product_id FK	"references PRODUCT(product_id)"
        string season
        int year
        int predicted_demand
        date forecast_date
        float accuracy
    }

	OWNER ||--o{ SHOP : owns
    SHOP ||--o{ USER : employs
    SHOP ||--o{ PRODUCT : stocks
    SHOP ||--o{ BATCH : holds
    SHOP ||--o{ SALE : conducts
    USER }o..o{ USER : manages
    USER ||--o{ ORDER : handles
    CUSTOMER ||--o{ ORDER : makes
    PRODUCT ||--o{ BATCH : has
    ORDER ||--|{ ORDER_ITEMS : contains
    ORDER ||--|{ PAYMENT : paid_via
    PRODUCT ||--o{ ORDER_ITEMS : sold_in
    ORDER_ITEMS }o--|| BATCH : from_batch
    SUPPLIER ||--o{ BATCH : supplies
    ORDER ||--o{ RETURNS : has_return
    RETURNS }o..|| BATCH : returned_in
    FORECAST }o--|| PRODUCT : predicted_for
    SHOP ||--o{ FORECAST : has
```

