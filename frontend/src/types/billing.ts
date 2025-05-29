// file: ./src/types/billing.ts
export interface BillItem {
	id: string;
	product_id: string;
	batch_id: number;
	batch_number: string;
	medicineName: string;
	brandName: string;
	quantity: number;
	unitPrice: number;
	amount: number;
	availableStock: number;
	expiryDate: string;
	gst: number;
}

export interface CustomerInfo {
	name: string;
	phoneNumber: string;
	doctorName?: string;
}

export interface PaymentInfo {
	method: "cash" | "upi" | "split";
	cashAmount: number;
	upiAmount: number;
	upiId?: string;
	receivedCash?: number;
	changeAmount?: number;
}

export interface OrderSummary {
	totalAmount: number;
	discountPercentage: number;
	discountAmount: number;
	finalAmount: number;
	gstAmount: number;
}
