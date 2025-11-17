// file: ./src/types/payment.ts
// Note: Most payment types are defined in api.ts to match API responses
// These are UI-specific types for the PaymentPage component

export interface MergedPaymentData {
	order_id: number;
	payment_type: string;
	customer_name: string;
	total_amount: number;
	order_date: string;
	cash_amount: number;
	upi_amount: number;
	items?: Array<{
		medicine_name: string;
		brand_name: string;
		quantity: number;
		unit_price: number;
		gst: number;
		amount: number;
	}>;
}
