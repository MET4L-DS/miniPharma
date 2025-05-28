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

class ApiService {
	private async makeRequest(endpoint: string, options: RequestInit = {}) {
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

	async searchMedicines(query: string): Promise<SearchResult[]> {
		if (!query.trim()) return [];
		return this.makeRequest(`/search/?search=${encodeURIComponent(query)}`);
	}
}

export const apiService = new ApiService();
