// file: ./src/utils/payment.ts

import { MergedPaymentData } from "@/types/payment";
import { PaymentResponse } from "@/types/api";

export function formatCurrency(amount: number): string {
	const validAmount =
		isNaN(amount) || amount === null || amount === undefined ? 0 : amount;
	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
	}).format(validAmount);
}

export function formatDate(dateString: string): string {
	if (!dateString) return "Invalid Date";
	try {
		return new Date(dateString).toLocaleDateString("en-IN", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	} catch (error) {
		return "Invalid Date";
	}
}

export function mergePaymentsByOrder(
	payments: PaymentResponse[]
): MergedPaymentData[] {
	const orderMap = new Map<number, MergedPaymentData>();

	payments.forEach((payment) => {
		const orderId = payment.order_id;
		if (orderMap.has(orderId)) {
			const existing = orderMap.get(orderId)!;
			if (payment.payment_type.toLowerCase() === "cash") {
				existing.cash_amount += payment.transaction_amount || 0;
			} else if (payment.payment_type.toLowerCase() === "upi") {
				existing.upi_amount += payment.transaction_amount || 0;
			}

			const hasCash = existing.cash_amount > 0;
			const hasUpi = existing.upi_amount > 0;
			if (hasCash && hasUpi) {
				existing.payment_type = "Cash + UPI";
			} else if (hasCash) {
				existing.payment_type = "Cash";
			} else if (hasUpi) {
				existing.payment_type = "UPI";
			}

			orderMap.set(orderId, existing);
		} else {
			const totalAmount = payment.total_amount || 0;
			const transactionAmount = payment.transaction_amount || 0;
			const mergedPayment: MergedPaymentData = {
				order_id: payment.order_id,
				payment_type: payment.payment_type,
				customer_name: payment.customer_name || "Unknown Customer",
				total_amount: totalAmount,
				order_date: payment.order_date,
				cash_amount:
					payment.payment_type.toLowerCase() === "cash"
						? transactionAmount
						: 0,
				upi_amount:
					payment.payment_type.toLowerCase() === "upi"
						? transactionAmount
						: 0,
				items: [],
			};
			orderMap.set(orderId, mergedPayment);
		}
	});

	return Array.from(orderMap.values()).sort(
		(a, b) =>
			new Date(b.order_date).getTime() - new Date(a.order_date).getTime()
	);
}

export function calculatePaymentStats(payments: MergedPaymentData[]) {
	const totalTransactions = payments.length;

	const totalAmount = payments.reduce((sum, payment) => {
		const amount = payment.total_amount;
		return typeof amount === "number" && !isNaN(amount)
			? sum + amount
			: sum;
	}, 0);

	const totalCashAmount = payments.reduce((sum, payment) => {
		const amount = payment.cash_amount;
		return typeof amount === "number" && !isNaN(amount)
			? sum + amount
			: sum;
	}, 0);

	const totalUpiAmount = payments.reduce((sum, payment) => {
		const amount = payment.upi_amount;
		return typeof amount === "number" && !isNaN(amount)
			? sum + amount
			: sum;
	}, 0);

	return {
		totalTransactions,
		totalAmount,
		totalCashAmount,
		totalUpiAmount,
	};
}
