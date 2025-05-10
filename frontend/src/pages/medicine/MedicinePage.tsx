// file: ./src/pages/MedicinePage.tsx

import { useState } from "react";
import { 
    MedicineTable, 
    AddMedicineDialog 
} from "@/components/medicine";
import { Medicine } from "@/types/medicine";
import { SAMPLE_MEDICINES } from "@/constants/medicine";

export default function MedicinePage() {
    const [medicines, setMedicines] = useState<Medicine[]>(SAMPLE_MEDICINES);

	const handleAddMedicine = (newMedicine: Medicine) => {
		setMedicines([...medicines, newMedicine]);
	};

	const handleUpdateMedicine = (updatedMedicine: Medicine) => {
		setMedicines(
			medicines.map((medicine) =>
				medicine.medicine_id === updatedMedicine.medicine_id
					? updatedMedicine
					: medicine
			)
		);
	};

	const handleDeleteMedicine = (id: string) => {
		setMedicines(
			medicines.filter((medicine) => medicine.medicine_id !== id)
		);
	};

	return (
		<div className="px-16 py-8">
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-2xl font-bold">Medicine List</h1>
				<AddMedicineDialog onAddMedicine={handleAddMedicine} />
			</div>
			<MedicineTable
				medicines={medicines}
				onUpdate={handleUpdateMedicine}
				onDelete={handleDeleteMedicine}
			/>
		</div>
	);
}
