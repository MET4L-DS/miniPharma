import { MedicineTable } from "@/components/ui/MedicineTable";
import { AddMedicineDialog } from "@/components/ui/AddMedicineDialog";
import { useState } from "react";

// Define Medicine interface (you might want to move this to a shared types file)
interface Medicine {
	medicine_id: string;
	composition_id: number;
	name: string;
	brand: string;
	hsn_code: string;
	gst_rate: number;
	requires_prescription: boolean;
	therapeutic_category: string;
}

export default function MedicinePage() {
	const [medicines, setMedicines] = useState<Medicine[]>([
		{
			medicine_id: "MED001",
			composition_id: 101,
			name: "Paracetamol",
			brand: "Dolo",
			hsn_code: "30049011",
			gst_rate: 12.0,
			requires_prescription: false,
			therapeutic_category: "Analgesic",
		},
		{
			medicine_id: "MED002",
			composition_id: 102,
			name: "Amoxicillin",
			brand: "Mox",
			hsn_code: "30049012",
			gst_rate: 18.0,
			requires_prescription: true,
			therapeutic_category: "Antibiotic",
		},
		{
			medicine_id: "MED003",
			composition_id: 103,
			name: "Metformin",
			brand: "Glycomet",
			hsn_code: "30049013",
			gst_rate: 12.0,
			requires_prescription: true,
			therapeutic_category: "Anti-diabetic",
		},
		{
			medicine_id: "MED004",
			composition_id: 104,
			name: "Atorvastatin",
			brand: "Lipitor",
			hsn_code: "30049014",
			gst_rate: 18.0,
			requires_prescription: true,
			therapeutic_category: "Anticholesterol",
		},
		{
			medicine_id: "MED005",
			composition_id: 105,
			name: "Ranitidine",
			brand: "Zantac",
			hsn_code: "30049015",
			gst_rate: 12.0,
			requires_prescription: false,
			therapeutic_category: "Antacid",
		},
	]);

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
