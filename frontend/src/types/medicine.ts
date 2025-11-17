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

// Note: SearchResult is defined in api.ts to avoid duplication

export interface MedicineStats {
	total_medicines: number;
	categories: number;
	prescription_required: number;
	otc_medicines: number;
}

export interface CreateMedicineData {
	product_id: string;
	composition_id: number;
	generic_name: string;
	brand_name: string;
	hsn: string;
	gst: number;
	prescription_required: boolean;
	therapeutic_category: string;
}

export interface UpdateMedicineData extends Partial<CreateMedicineData> {
	composition_id?: number;
	generic_name?: string;
	brand_name?: string;
	hsn?: string;
	gst?: number;
	prescription_required?: boolean;
	therapeutic_category?: string;
}
