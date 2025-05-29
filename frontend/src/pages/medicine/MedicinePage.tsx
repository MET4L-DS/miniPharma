// file: ./src/pages/MedicinePage.tsx
import { useState, useEffect } from "react";
import { MedicineTable, AddMedicineDialog } from "@/components/medicine";
import { Medicine } from "@/types/medicine";
import { apiService } from "@/services/api";
import { transformApiMedicineToMedicine } from "@/utils/medicine";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

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
			<DashboardLayout
				title="Medicine Management"
				breadcrumbs={[{ label: "Medicine Management" }]}
			>
				<div className="flex items-center justify-center h-64">
					<p className="text-muted-foreground">
						Loading medicines...
					</p>
				</div>
			</DashboardLayout>
		);
	}

	if (error) {
		return (
			<DashboardLayout
				title="Medicine Management"
				breadcrumbs={[{ label: "Medicine Management" }]}
			>
				<div className="flex flex-col items-center justify-center h-64 space-y-4">
					<p className="text-destructive">Error: {error}</p>
					<button
						onClick={fetchMedicines}
						className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
					>
						Retry
					</button>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout
			title="Medicine Management"
			breadcrumbs={[{ label: "Medicine Management" }]}
		>
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">
							Medicine List
						</h1>
						<p className="text-muted-foreground">
							Manage your pharmacy inventory
						</p>
					</div>
					<AddMedicineDialog onAddMedicine={handleAddMedicine} />
				</div>

				<MedicineTable
					medicines={medicines}
					onUpdate={handleUpdateMedicine}
					onDelete={handleDeleteMedicine}
				/>
			</div>
		</DashboardLayout>
	);
}
