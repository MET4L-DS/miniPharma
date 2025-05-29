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
}

export const apiService = new ApiService();
