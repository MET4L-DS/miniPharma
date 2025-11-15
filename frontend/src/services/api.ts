// file: ./src/services/api.ts

const API_BASE_URL = "http://localhost:8000/api";

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

export interface OrderData {
	customer_name: string;
	customer_number: string;
	doctor_name?: string;
	total_amount: number;
	discount_percentage: number;
}

export interface OrderItem {
	product_id: string;
	batch_id: number; // Changed from batch_number
	quantity: number;
	unit_price: number;
}

export interface PaymentData {
	payment_type: "cash" | "upi";
	transaction_amount: number;
}

// Enhanced payment interfaces for the payment page
export interface PaymentResponse {
	order_id: number;
	payment_type: string;
	transaction_amount: number;
	customer_name: string;
	total_amount: number | null;
	order_date: string;
	items?: OrderItemDetails[];
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

export interface PaymentSummary {
	total_orders: number;
	total_revenue: number;
	total_cash: number;
	total_upi: number;
	total_payments: number;
}

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
	date: string; // ISO date
	revenue: number;
}

class ApiService {
	async makeRequest(endpoint: string, options: RequestInit = {}) {
		const url = `${API_BASE_URL}${endpoint}`;
		const defaultOptions: RequestInit = {
			headers: {
				"Content-Type": "application/json",
				...options.headers,
			},
		};

		const response = await fetch(url, { ...defaultOptions, ...options });

		if (!response.ok) {
			const errorData = await response
				.json()
				.catch(() => ({ error: "Unknown error" }));
			throw new Error(
				errorData.error ||
					`HTTP ${response.status}: ${response.statusText}`
			);
		}

		return response.json();
	}

	// Medicine/Product operations
	async getMedicines(): Promise<ApiMedicine[]> {
		return this.makeRequest("/products/");
	}

	async getMedicine(productId: string): Promise<ApiMedicine> {
		return this.makeRequest(`/products/${productId}/`);
	}

	async createMedicine(
		medicine: Omit<ApiMedicine, "product_id"> & { product_id: string }
	): Promise<{ message: string }> {
		return this.makeRequest("/products/", {
			method: "POST",
			body: JSON.stringify({
				product_id: medicine.product_id,
				composition_id: medicine.composition_id,
				generic_name: medicine.generic_name,
				brand_name: medicine.brand_name,
				hsn: medicine.hsn,
				gst: medicine.gst,
				prescription_required: medicine.prescription_required,
				therapeutic_category: medicine.therapeutic_category,
			}),
		});
	}

	async updateMedicine(
		productId: string,
		medicine: Partial<ApiMedicine>
	): Promise<{ message: string }> {
		return this.makeRequest(`/products/${productId}/`, {
			method: "PUT",
			body: JSON.stringify({
				composition_id: medicine.composition_id,
				generic_name: medicine.generic_name,
				brand_name: medicine.brand_name,
				hsn: medicine.hsn,
				gst: medicine.gst,
				prescription_required: medicine.prescription_required,
				therapeutic_category: medicine.therapeutic_category,
			}),
		});
	}

	async deleteMedicine(productId: string): Promise<{ message: string }> {
		return this.makeRequest(`/products/${productId}/`, {
			method: "DELETE",
		});
	}

	// Enhanced search methods
	async searchMedicinesWithBatches(
		query: string
	): Promise<MedicineBatchResult[]> {
		if (!query.trim()) return [];
		return this.makeRequest(
			`/search/medicines/?search=${encodeURIComponent(query)}`
		);
	}

	async getMedicineSuggestions(query: string): Promise<MedicineSuggestion[]> {
		if (!query.trim() || query.length < 2) return [];
		return this.makeRequest(
			`/search/suggestions/?q=${encodeURIComponent(query)}`
		);
	}

	// Batch operations
	async getBatches(): Promise<ApiBatch[]> {
		return this.makeRequest("/batches/");
	}

	async getBatch(batchId: number): Promise<ApiBatch> {
		return this.makeRequest(`/batches/${batchId}/`);
	}

	async createBatch(
		batch: Omit<ApiBatch, "id" | "generic_name" | "brand_name">
	): Promise<{ message: string }> {
		return this.makeRequest("/batches/", {
			method: "POST",
			body: JSON.stringify(batch),
		});
	}

	async updateBatch(
		batchId: number,
		batch: Partial<Omit<ApiBatch, "id" | "generic_name" | "brand_name">>
	): Promise<{ message: string }> {
		return this.makeRequest(`/batches/${batchId}/`, {
			method: "PUT",
			body: JSON.stringify(batch),
		});
	}

	async deleteBatch(batchId: number): Promise<{ message: string }> {
		return this.makeRequest(`/batches/${batchId}/`, {
			method: "DELETE",
		});
	}

	// Order operations
	async createOrder(
		orderData: OrderData
	): Promise<{ message: string; order_id: number }> {
		return this.makeRequest("/orders/create/", {
			method: "POST",
			body: JSON.stringify(orderData),
		});
	}

	async addOrderItems(
		items: OrderItem[]
	): Promise<{ message: string; order_id: number }> {
		return this.makeRequest("/order-items/", {
			method: "POST",
			body: JSON.stringify({ items }),
		});
	}

	async addPayments(
		payments: PaymentData[]
	): Promise<{ message: string; order_id: number }> {
		return this.makeRequest("/payments/add/", {
			method: "POST",
			body: JSON.stringify({ payments }),
		});
	}

	// Enhanced Payment operations for the Payment Page
	async getPayments(): Promise<PaymentResponse[]> {
		try {
			const response = await this.makeRequest("/payments/");

			// Ensure the response is an array and handle null/undefined values
			if (!Array.isArray(response)) {
				console.warn(
					"Expected array response from /payments/, got:",
					typeof response
				);
				return [];
			}

			return response.map((payment: any) => ({
				order_id: payment.order_id || 0,
				payment_type: payment.payment_type || "unknown",
				transaction_amount: this.safeParseNumber(
					payment.transaction_amount
				),
				customer_name: payment.customer_name || "Unknown Customer",
				total_amount: this.safeParseNumber(payment.total_amount),
				order_date: payment.order_date || new Date().toISOString(),
			}));
		} catch (error) {
			console.error("Error fetching payments:", error);
			throw error;
		}
	}

	async getPaymentSummary(): Promise<PaymentSummary> {
		try {
			const response = await this.makeRequest("/payments/summary/");

			return {
				total_orders: this.safeParseInteger(response.total_orders),
				total_revenue: this.safeParseNumber(response.total_revenue),
				total_cash: this.safeParseNumber(response.total_cash),
				total_upi: this.safeParseNumber(response.total_upi),
				total_payments: this.safeParseNumber(response.total_payments),
			};
		} catch (error) {
			console.error("Error fetching payment summary:", error);
			// Return default values in case of error
			return {
				total_orders: 0,
				total_revenue: 0,
				total_cash: 0,
				total_upi: 0,
				total_payments: 0,
			};
		}
	}

	async updatePayment(
		orderId: number,
		paymentData: Partial<PaymentData>
	): Promise<{ message: string }> {
		return this.makeRequest(`/payments/${orderId}/`, {
			method: "PUT",
			body: JSON.stringify(paymentData),
		});
	}

	async deletePayment(orderId: number): Promise<{ message: string }> {
		return this.makeRequest(`/payments/${orderId}/`, {
			method: "DELETE",
		});
	}

	// Complete order processing (unchanged)
	async processCompleteOrder(
		orderData: OrderData,
		items: OrderItem[],
		payments: PaymentData[]
	): Promise<{ success: boolean; order_id?: number; error?: string }> {
		try {
			// Step 1: Create order
			const orderResult = await this.createOrder(orderData);

			// Step 2: Add order items
			await this.addOrderItems(items);

			// Step 3: Add payments
			await this.addPayments(payments);

			return { success: true, order_id: orderResult.order_id };
		} catch (error) {
			console.error("Complete order processing failed:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	// Helper methods for safe number parsing
	private safeParseNumber(value: any): number {
		if (value === null || value === undefined || value === "") {
			return 0;
		}

		const parsed =
			typeof value === "string" ? parseFloat(value) : Number(value);
		return isNaN(parsed) ? 0 : parsed;
	}

	private safeParseInteger(value: any): number {
		if (value === null || value === undefined || value === "") {
			return 0;
		}

		const parsed =
			typeof value === "string" ? parseInt(value, 10) : Number(value);
		return isNaN(parsed) ? 0 : Math.floor(parsed);
	}

	async getDashboardStats(): Promise<DashboardStats> {
		try {
			const response = await this.makeRequest("/dashboard/stats/");
			return {
				total_products: this.safeParseInteger(response.total_products),
				total_batches: this.safeParseInteger(response.total_batches),
				total_orders: this.safeParseInteger(response.total_orders),
				low_stock_items: this.safeParseInteger(
					response.low_stock_items
				),
				expired_items: this.safeParseInteger(response.expired_items),
				todays_orders: this.safeParseInteger(response.todays_orders),
				todays_revenue: this.safeParseNumber(response.todays_revenue),
			};
		} catch (error) {
			console.error("Error fetching dashboard stats:", error);
			throw error;
		}
	}

	async getExpiringSoon(): Promise<ExpiringItem[]> {
		try {
			const response = await this.makeRequest(
				"/dashboard/expiring-soon/"
			);
			return Array.isArray(response) ? response : [];
		} catch (error) {
			console.error("Error fetching expiring items:", error);
			return [];
		}
	}

	async getLowStockItems(threshold: number = 10): Promise<LowStockItem[]> {
		try {
			const response = await this.makeRequest(
				`/dashboard/low-stock/?threshold=${threshold}`
			);
			return Array.isArray(response) ? response : [];
		} catch (error) {
			console.error("Error fetching low stock items:", error);
			return [];
		}
	}

	async getSaltPredictions(
		city: string,
		month?: number | string
	): Promise<SaltPrediction> {
		try {
			const params = new URLSearchParams({ city });
			if (month) {
				params.append("month", month.toString());
			}

			const response = await this.makeRequest(
				`/predict/salts/?${params.toString()}`
			);
			return response;
		} catch (error) {
			console.error("Error fetching salt predictions:", error);
			throw error;
		}
	}

	async getSalesData(days: number = 30): Promise<SalesPoint[]> {
		try {
			const response = await this.makeRequest(
				`/dashboard/sales/?days=${days}`
			);

			// Expect an array of { date, revenue }
			if (Array.isArray(response)) {
				return response.map((item: any) => ({
					date: item.date || item.day || new Date().toISOString(),
					revenue: this.safeParseNumber(
						item.revenue ?? item.amount ?? 0
					),
				}));
			}

			// If the backend doesn't provide the endpoint, synthesize sample data
			const synthesized: SalesPoint[] = [];
			for (let i = days - 1; i >= 0; i--) {
				const d = new Date();
				d.setDate(d.getDate() - i);
				synthesized.push({
					date: d.toISOString().slice(0, 10),
					revenue: Math.round(Math.random() * 5000 + 2000),
				});
			}
			return synthesized;
		} catch (error) {
			console.warn(
				"Sales endpoint not available, returning sample data.",
				error
			);
			const synthesized: SalesPoint[] = [];
			for (let i = days - 1; i >= 0; i--) {
				const d = new Date();
				d.setDate(d.getDate() - i);
				synthesized.push({
					date: d.toISOString().slice(0, 10),
					revenue: Math.round(Math.random() * 5000 + 2000),
				});
			}
			return synthesized;
		}
	}
}

export const apiService = new ApiService();
