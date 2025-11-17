// file: ./src/types/invoice.ts

export interface InvoiceOrderItem {
	medicine_name: string;
	brand_name: string;
	quantity: number;
	unit_price: number;
	gst: number;
	amount: number;
}

export interface InvoiceOrderData {
	order_id: number;
	customer_name: string;
	total_amount: number;
	order_date: string;
	payment_type: string;
	cash_amount: number;
	upi_amount: number;
	items?: InvoiceOrderItem[];
}

export interface InvoicePreviewProps {
	orderData: InvoiceOrderData;
}
