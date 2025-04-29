import { MedicineTable } from "@/components/ui/MedicineTable";
import { AddMedicineDialog } from "@/components/ui/AddMedicineDialog";
import { useState, useEffect } from "react";
import axios from "axios";

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
	const [medicines, setMedicines] = useState<Medicine[]>([]);

	useEffect(() => {
		axios.get('http://localhost:8000/api/products/')
		  .then((response) => {
			const transformedData = response.data.map((item: any) => ({
			  medicine_id: item.product_id,
			  name: item.generic_name,
			  brand: item.brand_name,
			  hsn_code: item.hsn,
			  gst_rate: parseFloat(item.gst), // Convert string to number
			  requires_prescription: item.prescription_required,
			  composition_id: item.composition_id,
			  therapeutic_category: item.therapeutic_category,
			}));
			setMedicines(transformedData);
		  })
		  .catch((error) => {
			console.error('Error fetching medicines:', error);
		  });
	  }, []);

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
