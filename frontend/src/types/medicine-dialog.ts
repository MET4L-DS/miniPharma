// file: ./src/types/medicine-dialog.ts

import { Medicine } from "./medicine";

export interface AddMedicineDialogProps {
	onAddMedicine: (newMedicine: Medicine) => Promise<void>;
}

export interface EditMedicineDialogProps {
	medicine: Medicine;
	onSave: (updatedMedicine: Medicine) => Promise<void>;
	trigger?: React.ReactNode;
}

export interface DeleteConfirmationDialogProps {
	onConfirm: () => Promise<void>;
	medicineId: string;
	trigger?: React.ReactNode;
}

export interface MedicineFiltersProps {
	searchTerm: string;
	onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	isSearching: boolean;
	selectedCategory: string;
	onCategoryChange: (value: string) => void;
	requiresPrescription: string;
	onPrescriptionChange: (value: string) => void;
	categories: string[];
}
