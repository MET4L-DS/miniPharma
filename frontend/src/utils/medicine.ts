// file: ./src/utils/medicine.ts

import { Medicine } from "@/types/medicine";
import { ApiMedicine } from "@/services/api";

export function transformApiMedicineToMedicine(
	apiMedicine: ApiMedicine
): Medicine {
	return {
		medicine_id: apiMedicine.product_id,
		composition_id: apiMedicine.composition_id,
		name: apiMedicine.generic_name,
		brand: apiMedicine.brand_name,
		hsn_code: apiMedicine.hsn,
		gst_rate: apiMedicine.gst,
		requires_prescription: apiMedicine.prescription_required,
		therapeutic_category: apiMedicine.therapeutic_category,
	};
}

export function transformMedicineToApiMedicine(
	medicine: Medicine
): ApiMedicine {
	return {
		product_id: medicine.medicine_id,
		composition_id: medicine.composition_id,
		generic_name: medicine.name,
		brand_name: medicine.brand,
		hsn: medicine.hsn_code,
		gst: medicine.gst_rate,
		prescription_required: medicine.requires_prescription,
		therapeutic_category: medicine.therapeutic_category,
	};
}

// Debounce utility function
export function debounce<T extends (...args: any[]) => void>(
	func: T,
	delay: number
): (...args: Parameters<T>) => void {
	let timeoutId: NodeJS.Timeout;

	return (...args: Parameters<T>) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => func(...args), delay);
	};
}
