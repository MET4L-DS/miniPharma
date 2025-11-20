// file: ./src/services/api.ts

import { AuthService } from "./api/auth";
import { MedicineService } from "./api/medicine";
import { BatchService } from "./api/batch";
import { OrderService } from "./api/order";
import { PaymentService } from "./api/payment";
import { DashboardService } from "./api/dashboard";
import { StaffService } from "./api/staff";
import { ShopService } from "./api/shop";

// Re-export all types for convenience
export * from "@/types/api";

/**
 * Main API service that combines all sub-services
 * Provides a unified interface for all API operations
 */
class ApiService {
	private auth: AuthService;
	private medicine: MedicineService;
	private batch: BatchService;
	private order: OrderService;
	private payment: PaymentService;
	private dashboard: DashboardService;
	private staff: StaffService;
	private shop: ShopService;

	constructor() {
		this.auth = new AuthService();
		this.medicine = new MedicineService();
		this.batch = new BatchService();
		this.order = new OrderService();
		this.payment = new PaymentService();
		this.dashboard = new DashboardService();
		this.staff = new StaffService();
		this.shop = new ShopService();
	}

	// ==================== AUTH METHODS ====================
	login(...args: Parameters<AuthService["login"]>) {
		return this.auth.login(...args);
	}

	register(...args: Parameters<AuthService["register"]>) {
		return this.auth.register(...args);
	}

	// ==================== MEDICINE METHODS ====================
	getMedicines(...args: Parameters<MedicineService["getMedicines"]>) {
		return this.medicine.getMedicines(...args);
	}

	getMedicine(...args: Parameters<MedicineService["getMedicine"]>) {
		return this.medicine.getMedicine(...args);
	}

	createMedicine(...args: Parameters<MedicineService["createMedicine"]>) {
		return this.medicine.createMedicine(...args);
	}

	updateMedicine(...args: Parameters<MedicineService["updateMedicine"]>) {
		return this.medicine.updateMedicine(...args);
	}

	deleteMedicine(...args: Parameters<MedicineService["deleteMedicine"]>) {
		return this.medicine.deleteMedicine(...args);
	}

	searchMedicinesWithBatches(
		...args: Parameters<MedicineService["searchMedicinesWithBatches"]>
	) {
		return this.medicine.searchMedicinesWithBatches(...args);
	}

	getMedicineSuggestions(
		...args: Parameters<MedicineService["getMedicineSuggestions"]>
	) {
		return this.medicine.getMedicineSuggestions(...args);
	}

	// ==================== BATCH METHODS ====================
	getBatches(...args: Parameters<BatchService["getBatches"]>) {
		return this.batch.getBatches(...args);
	}

	getBatch(...args: Parameters<BatchService["getBatch"]>) {
		return this.batch.getBatch(...args);
	}

	createBatch(...args: Parameters<BatchService["createBatch"]>) {
		return this.batch.createBatch(...args);
	}

	updateBatch(...args: Parameters<BatchService["updateBatch"]>) {
		return this.batch.updateBatch(...args);
	}

	deleteBatch(...args: Parameters<BatchService["deleteBatch"]>) {
		return this.batch.deleteBatch(...args);
	}

	// ==================== ORDER METHODS ====================
	createOrder(...args: Parameters<OrderService["createOrder"]>) {
		return this.order.createOrder(...args);
	}

	addOrderItems(...args: Parameters<OrderService["addOrderItems"]>) {
		return this.order.addOrderItems(...args);
	}

	getOrderItems(...args: Parameters<OrderService["getOrderItems"]>) {
		return this.order.getOrderItems(...args);
	}

	// ==================== PAYMENT METHODS ====================
	getPayments(...args: Parameters<PaymentService["getPayments"]>) {
		return this.payment.getPayments(...args);
	}

	getPaymentSummary(
		...args: Parameters<PaymentService["getPaymentSummary"]>
	) {
		return this.payment.getPaymentSummary(...args);
	}

	addPayments(...args: Parameters<PaymentService["addPayments"]>) {
		return this.payment.addPayments(...args);
	}

	updatePayment(...args: Parameters<PaymentService["updatePayment"]>) {
		return this.payment.updatePayment(...args);
	}

	deletePayment(...args: Parameters<PaymentService["deletePayment"]>) {
		return this.payment.deletePayment(...args);
	}

	// ==================== DASHBOARD METHODS ====================
	getDashboardStats(
		...args: Parameters<DashboardService["getDashboardStats"]>
	) {
		return this.dashboard.getDashboardStats(...args);
	}

	getExpiringSoon(...args: Parameters<DashboardService["getExpiringSoon"]>) {
		return this.dashboard.getExpiringSoon(...args);
	}

	getLowStockItems(
		...args: Parameters<DashboardService["getLowStockItems"]>
	) {
		return this.dashboard.getLowStockItems(...args);
	}

	getSaltPredictions(
		...args: Parameters<DashboardService["getSaltPredictions"]>
	) {
		return this.dashboard.getSaltPredictions(...args);
	}

	getSalesData(...args: Parameters<DashboardService["getSalesData"]>) {
		return this.dashboard.getSalesData(...args);
	}

	// ==================== STAFF METHODS ====================
	listStaff(...args: Parameters<StaffService["listStaff"]>) {
		return this.staff.listStaff(...args);
	}

	addStaff(...args: Parameters<StaffService["addStaff"]>) {
		return this.staff.addStaff(...args);
	}

	removeStaff(...args: Parameters<StaffService["removeStaff"]>) {
		return this.staff.removeStaff(...args);
	}

	// ==================== SHOP METHODS ====================
	getMyShops(...args: Parameters<ShopService["getMyShops"]>) {
		return this.shop.getMyShops(...args);
	}

	switchShop(...args: Parameters<ShopService["switchShop"]>) {
		return this.shop.switchShop(...args);
	}

	addShop(...args: Parameters<ShopService["addShop"]>) {
		return this.shop.addShop(...args);
	}

	// ==================== COMPOSITE OPERATIONS ====================
	/**
	 * Process a complete order with items and payments in a single transaction
	 */
	async processCompleteOrder(
		orderData: Parameters<OrderService["createOrder"]>[0],
		items: Parameters<OrderService["addOrderItems"]>[0],
		payments: Parameters<PaymentService["addPayments"]>[0]
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
