// file: ./src/utils/billing.ts

import { BillItem } from "@/types/billing";

export function validateQuantity(
	quantity: number,
	availableStock: number
): { isValid: boolean; message?: string } {
	if (quantity <= 0) {
		return { isValid: false, message: "Please enter a valid quantity" };
	}

	if (quantity > availableStock) {
		return {
			isValid: false,
			message: `Only ${availableStock} units available in stock`,
		};
	}

	return { isValid: true };
}

export function validatePhoneNumber(phoneNumber: string): {
	isValid: boolean;
	message?: string;
} {
	if (!phoneNumber.trim()) {
		return {
			isValid: false,
			message: "Please enter customer phone number",
		};
	}

	if (phoneNumber.length !== 10) {
		return {
			isValid: false,
			message: "Please enter a valid 10-digit phone number",
		};
	}

	return { isValid: true };
}

export function validateUpiId(upiId: string): {
	isValid: boolean;
	message?: string;
} {
	if (!upiId || !upiId.includes("@")) {
		return {
			isValid: false,
			message: "Please enter a valid UPI ID with '@' symbol",
		};
	}

	return { isValid: true };
}

export function calculateItemAmount(
	unitPrice: number,
	quantity: number
): number {
	return unitPrice * quantity;
}

export function isExpiringSoon(expiryDate: string, days: number = 30): boolean {
	const expiry = new Date(expiryDate);
	const today = new Date();
	const diffTime = expiry.getTime() - today.getTime();
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	return diffDays <= days && diffDays > 0;
}

export function formatBillItemForDisplay(item: BillItem): string {
	return `${item.brandName} (${item.medicineName}) - Batch: ${item.batch_number}`;
}

export function calculateGstAmount(subtotal: number, gstRate: number): number {
	return subtotal * (gstRate / 100);
}

export function calculateSubtotalWithoutGst(
	totalWithGst: number,
	gstRate: number
): number {
	return totalWithGst / (1 + gstRate / 100);
}
