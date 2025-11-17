// file: ./src/utils/stock.ts

import { Batch } from "@/types/batch";
import { StockStats } from "@/types/stock";

export function calculateStockStats(batches: Batch[]): StockStats {
	const totalBatches = batches.length;
	const lowStockBatches = batches.filter(
		(batch) => batch.quantity_in_stock <= 10 && batch.quantity_in_stock > 0
	).length;
	const outOfStockBatches = batches.filter(
		(batch) => batch.quantity_in_stock === 0
	).length;
	const expiringSoonBatches = batches.filter((batch) => {
		const expiry = new Date(batch.expiry_date);
		const today = new Date();
		const diffTime = expiry.getTime() - today.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays <= 30 && diffDays > 0;
	}).length;

	return {
		totalBatches,
		lowStockBatches,
		outOfStockBatches,
		expiringSoonBatches,
	};
}

export function isDaysUntilExpiry(expiryDate: string): number {
	const expiry = new Date(expiryDate);
	const today = new Date();
	const diffTime = expiry.getTime() - today.getTime();
	return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function isExpiringSoon(expiryDate: string, days: number = 30): boolean {
	const daysUntilExpiry = isDaysUntilExpiry(expiryDate);
	return daysUntilExpiry <= days && daysUntilExpiry > 0;
}

export function isExpired(expiryDate: string): boolean {
	return isDaysUntilExpiry(expiryDate) < 0;
}

export function getStockStatus(quantity: number): {
	label: string;
	variant: "default" | "secondary" | "destructive";
} {
	if (quantity === 0)
		return { label: "Out of Stock", variant: "destructive" };
	if (quantity <= 10) return { label: "Low Stock", variant: "secondary" };
	return { label: "In Stock", variant: "default" };
}

export function validateBatchForm(formData: {
	batch_number: string;
	product_id?: string;
	expiry_date: string;
}): { isValid: boolean; message?: string } {
	if (!formData.batch_number) {
		return { isValid: false, message: "Batch number is required" };
	}

	if (formData.product_id !== undefined && !formData.product_id) {
		return { isValid: false, message: "Medicine selection is required" };
	}

	if (!formData.expiry_date) {
		return { isValid: false, message: "Expiry date is required" };
	}

	return { isValid: true };
}

export function formatCurrency(amount: number): string {
	return `₹${amount.toFixed(2)}`;
}
