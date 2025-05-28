// file: ./src/pages/MedicinePage.tsx

import { useState, useEffect } from "react";
import { MedicineTable, AddMedicineDialog } from "@/components/medicine";
import { Medicine } from "@/types/medicine";
import { apiService } from "@/services/api";
import { transformApiMedicineToMedicine } from "@/utils/medicine";
import { toast } from "sonner";

export default function MedicinePage() {
	const [medicines, setMedicines] = useState<Medicine[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Fetch medicines from backend on component mount
	useEffect(() => {
		fetchMedicines();
	}, []);

	const fetchMedicines = async () => {
		try {
			setLoading(true);
			setError(null);
			const apiMedicines = await apiService.getMedicines();
			const transformedMedicines = apiMedicines.map(
				transformApiMedicineToMedicine
			);
			setMedicines(transformedMedicines);
		} catch (err) {
			const errorMessage =
				err instanceof Error
					? err.message
					: "Failed to fetch medicines";
			setError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const handleAddMedicine = async (newMedicine: Medicine) => {
		try {
			await apiService.createMedicine({
				product_id: newMedicine.medicine_id,
				composition_id: newMedicine.composition_id,
				generic_name: newMedicine.name,
				brand_name: newMedicine.brand,
				hsn: newMedicine.hsn_code,
				gst: newMedicine.gst_rate,
				prescription_required: newMedicine.requires_prescription,
				therapeutic_category: newMedicine.therapeutic_category,
			});

			// Add to local state
			setMedicines([...medicines, newMedicine]);
			toast.success("Medicine added successfully!");
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to add medicine";
			toast.error(errorMessage);
			throw err; // Re-throw to let the dialog handle it
		}
	};

	const handleUpdateMedicine = async (updatedMedicine: Medicine) => {
		try {
			await apiService.updateMedicine(updatedMedicine.medicine_id, {
				composition_id: updatedMedicine.composition_id,
				generic_name: updatedMedicine.name,
				brand_name: updatedMedicine.brand,
				hsn: updatedMedicine.hsn_code,
				gst: updatedMedicine.gst_rate,
				prescription_required: updatedMedicine.requires_prescription,
				therapeutic_category: updatedMedicine.therapeutic_category,
			});

			// Update local state
			setMedicines(
				medicines.map((medicine) =>
					medicine.medicine_id === updatedMedicine.medicine_id
						? updatedMedicine
						: medicine
				)
			);
			toast.success("Medicine updated successfully!");
		} catch (err) {
			const errorMessage =
				err instanceof Error
					? err.message
					: "Failed to update medicine";
			toast.error(errorMessage);
			throw err; // Re-throw to let the dialog handle it
		}
	};

	const handleDeleteMedicine = async (id: string) => {
		try {
			await apiService.deleteMedicine(id);

			// Remove from local state
			setMedicines(
				medicines.filter((medicine) => medicine.medicine_id !== id)
			);
			toast.success("Medicine deleted successfully!");
		} catch (err) {
			const errorMessage =
				err instanceof Error
					? err.message
					: "Failed to delete medicine";
			toast.error(errorMessage);
		}
	};

	if (loading) {
		return (
			<div className="px-16 py-8">
				<div className="flex justify-center items-center h-64">
					<div className="text-lg">Loading medicines...</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="px-16 py-8">
				<div className="flex flex-col justify-center items-center h-64">
					<div className="text-lg text-red-600 mb-4">
						Error: {error}
					</div>
					<button
						onClick={fetchMedicines}
						className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
					>
						Retry
					</button>
				</div>
			</div>
		);
	}

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
