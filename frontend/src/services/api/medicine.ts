// file: ./src/services/api/medicine.ts

import { BaseApiService } from "./base";
import type {
	ApiMedicine,
	MedicineBatchResult,
	MedicineSuggestion,
} from "@/types/api";

export class MedicineService extends BaseApiService {
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
}
