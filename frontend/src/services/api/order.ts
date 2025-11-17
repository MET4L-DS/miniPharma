// file: ./src/services/api/order.ts

import { BaseApiService } from "./base";
import type { OrderData, OrderItem } from "@/types/api";

export class OrderService extends BaseApiService {
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

	async getOrderItems(orderId: number): Promise<any[]> {
		return this.makeRequest(`/orders/${orderId}/items/`);
	}
}
