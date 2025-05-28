// file: ./src/types/medicine.ts

export interface Medicine {
	medicine_id: string; // Maps to product_id in backend
	composition_id: number;
	name: string; // Maps to generic_name in backend
	brand: string; // Maps to brand_name in backend
	hsn_code: string; // Maps to hsn in backend
	gst_rate: number; // Maps to gst in backend
	requires_prescription: boolean; // Maps to prescription_required in backend
	therapeutic_category: string;
}

export interface MedicineTableProps {
	medicines: Medicine[];
	onUpdate: (medicine: Medicine) => void;
	onDelete: (id: string) => void;
}

export interface SearchResult {
	product_id: string;
	generic_name: string;
	brand_name: string;
	batch_number: string;
	expiry_date: string;
	average_purchase_price: number;
	selling_price: number;
	quantity_in_stock: number;
}
