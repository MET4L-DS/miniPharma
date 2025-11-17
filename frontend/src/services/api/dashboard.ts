// file: ./src/services/api/dashboard.ts

import { BaseApiService } from "./base";
import type {
	DashboardStats,
	ExpiringItem,
	LowStockItem,
	SaltPrediction,
	SalesPoint,
} from "@/types/api";

export class DashboardService extends BaseApiService {
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
			return this.generateSampleSalesData(days);
		} catch (error) {
			console.warn(
				"Sales endpoint not available, returning sample data.",
				error
			);
			return this.generateSampleSalesData(days);
		}
	}

	private generateSampleSalesData(days: number): SalesPoint[] {
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
