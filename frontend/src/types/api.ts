// file: ./src/types/api.ts

// Medicine/Product interfaces
export interface ApiMedicine {
	product_id: string;
	composition_id: number;
	generic_name: string;
	brand_name: string;
	hsn: string;
	gst: number;
	prescription_required: boolean;
	therapeutic_category: string;
}

export interface MedicineBatchResult {
	product_id: string;
	generic_name: string;
	brand_name: string;
	gst: number;
	batch_id: number;
	batch_number: string;
	expiry_date: string;
	average_purchase_price: number;
	selling_price: number;
	quantity_in_stock: number;
}

export interface MedicineSuggestion {
	product_id: string;
	generic_name: string;
	brand_name: string;
	min_price: number;
	total_stock: number;
}

// Batch interfaces
export interface ApiBatch {
	id: number;
	batch_number: string;
	product_id: string;
	expiry_date: string;
	average_purchase_price: number;
	selling_price: number;
	quantity_in_stock: number;
	generic_name?: string;
	brand_name?: string;
}

// Order interfaces
export interface OrderData {
	customer_name: string;
	customer_number: string;
	doctor_name?: string;
	total_amount: number;
	discount_percentage: number;
}

export interface OrderItem {
	product_id: string;
	batch_id: number;
	quantity: number;
	unit_price: number;
}

export interface OrderItemDetails {
	medicine_name: string;
	brand_name: string;
	quantity: number;
	unit_price: number;
	gst: number;
	amount: number;
	batch_number: string;
}

// Payment interfaces
export interface PaymentData {
	payment_type: "cash" | "upi";
	transaction_amount: number;
}

export interface PaymentResponse {
	order_id: number;
	payment_type: string;
	transaction_amount: number;
	customer_name: string;
	total_amount: number | null;
	order_date: string;
	items?: OrderItemDetails[];
}

export interface PaymentSummary {
	total_orders: number;
	total_revenue: number;
	total_cash: number;
	total_upi: number;
	total_payments: number;
}

// Dashboard/Analytics interfaces
export interface DashboardStats {
	total_products: number;
	total_batches: number;
	total_orders: number;
	low_stock_items: number;
	expired_items: number;
	todays_orders: number;
	todays_revenue: number;
}

export interface ExpiringItem {
	generic_name: string;
	brand_name: string;
	batch_number: string;
	expiry_date: string;
	quantity_in_stock: number;
}

export interface LowStockItem {
	generic_name: string;
	brand_name: string;
	batch_number: string;
	quantity_in_stock: number;
	expiry_date: string;
}

export interface SaltPrediction {
	month: number | null;
	city: string;
	predicted_salts: string[];
	selected_salt: string | null;
	note: string;
}

export interface SalesPoint {
	date: string;
	revenue: number;
}

// Auth interfaces
export interface LoginRequest {
	phone: string;
	password: string;
}

export interface LoginResponse {
	message: string;
	shop_id?: number;
	shopname?: string;
	manager?: string;
	is_manager?: boolean;
	is_staff?: boolean;
}

export interface RegisterRequest {
	phone: string;
	password: string;
	name?: string;
	shopname: string;
	manager?: string;
}

export interface RegisterResponse {
	message: string;
}

// Legacy interfaces (kept for backward compatibility)
export interface SearchResult {
	product_id: string;
	generic_name: string;
	brand_name: string;
	batch_number: string;
	expiry_date: string;
	average_purchase_price: number;
	selling_price: number;
	quantity_in_stock: number;
}
