// file: ./src/services/api/payment.ts

import { BaseApiService } from "./base";
import type { PaymentData, PaymentResponse, PaymentSummary } from "@/types/api";

export class PaymentService extends BaseApiService {
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

	async addPayments(
		payments: PaymentData[]
	): Promise<{ message: string; order_id: number }> {
		return this.makeRequest("/payments/add/", {
			method: "POST",
			body: JSON.stringify({ payments }),
		});
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
}
