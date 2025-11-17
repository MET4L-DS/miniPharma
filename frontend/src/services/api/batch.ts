// file: ./src/services/api/batch.ts

import { BaseApiService } from "./base";
import type { ApiBatch } from "@/types/api";

export class BatchService extends BaseApiService {
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
}
