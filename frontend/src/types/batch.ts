// file: ./src/types/batch.ts
export interface Batch {
	id: number;
	batch_number: string;
	product_id: string;
	expiry_date: string;
	average_purchase_price: number;
	selling_price: number;
	quantity_in_stock: number;
	generic_name?: string;
	brand_name?: string;
}

export interface BatchTableProps {
	batches: Batch[];
	onUpdate: (batch: Batch) => void;
	onDelete: (id: number) => void;
}

export interface CreateBatchData {
	batch_number: string;
	product_id: string;
	expiry_date: string;
	average_purchase_price: number;
	selling_price: number;
	quantity_in_stock: number;
}
