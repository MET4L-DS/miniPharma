// file: ./src/pages/MedicinePage.tsx

import { useState, useEffect } from "react";
import {
	MedicineTable,
	AddMedicineDialog,
	MedicineStats,
	CategoryDistribution,
} from "@/components/medicine";
import { Medicine, MedicineStats as MedicineStatsType } from "@/types/medicine";
import { apiService } from "@/services/api";
import { transformApiMedicineToMedicine } from "@/utils/medicine";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function MedicinePage() {
	const [medicines, setMedicines] = useState<Medicine[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [stats, setStats] = useState<MedicineStatsType>({
		total_medicines: 0,
		categories: 0,
		prescription_required: 0,
		otc_medicines: 0,
	});

	useEffect(() => {
		fetchMedicines();
		// Auto-refresh every 5 minutes
		const interval = setInterval(fetchMedicines, 5 * 60 * 1000);
		return () => clearInterval(interval);
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
			calculateStats(transformedMedicines);
		} catch (err) {
			const errorMessage =
				err instanceof Error
					? err.message
					: "Failed to fetch medicines";
			setError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	const calculateStats = (medicineList: Medicine[]): void => {
		const categories = new Set(
			medicineList.map((m) => m.therapeutic_category)
		).size;
		const prescriptionRequired = medicineList.filter(
			(m) => m.requires_prescription
		).length;
		const otcMedicines = medicineList.filter(
			(m) => !m.requires_prescription
		).length;

		setStats({
			total_medicines: medicineList.length,
			categories,
			prescription_required: prescriptionRequired,
			otc_medicines: otcMedicines,
		});
	};

	const handleRefresh = async () => {
		setRefreshing(true);
		await fetchMedicines();
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

			setMedicines([...medicines, newMedicine]);
			calculateStats([...medicines, newMedicine]);
			toast.success("Medicine added successfully!");
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to add medicine";
			toast.error(errorMessage);
			throw err;
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

			const updatedMedicines = medicines.map((medicine) =>
				medicine.medicine_id === updatedMedicine.medicine_id
					? updatedMedicine
					: medicine
			);
			setMedicines(updatedMedicines);
			calculateStats(updatedMedicines);
		} catch (err) {
			const errorMessage =
				err instanceof Error
					? err.message
					: "Failed to update medicine";
			toast.error(errorMessage);
			throw err;
		}
	};

	const handleDeleteMedicine = async (id: string) => {
		try {
			await apiService.deleteMedicine(id);
			const filteredMedicines = medicines.filter(
				(medicine) => medicine.medicine_id !== id
			);
			setMedicines(filteredMedicines);
			calculateStats(filteredMedicines);
		} catch (err) {
			const errorMessage =
				err instanceof Error
					? err.message
					: "Failed to delete medicine";
			toast.error(errorMessage);
		}
	};

	if (loading && medicines.length === 0) {
		return (
			<DashboardLayout>
				<div className="flex items-center justify-center min-h-96">
					<div className="text-center">
						<RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
						<p className="text-lg">Loading medicines...</p>
					</div>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">
							Medicine Management
						</h1>
						<p className="text-muted-foreground">
							Manage your pharmacy inventory and medicine catalog
						</p>
					</div>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={handleRefresh}
							disabled={refreshing}
						>
							<RefreshCw
								className={`h-4 w-4 mr-2 ${
									refreshing ? "animate-spin" : ""
								}`}
							/>
							{refreshing ? "Refreshing..." : "Refresh"}
						</Button>
						<AddMedicineDialog onAddMedicine={handleAddMedicine} />
					</div>
				</div>

				{/* Error Alert */}
				{error && (
					<Alert variant="destructive">
						<AlertTriangle className="h-4 w-4" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{/* Stats Grid */}
				<MedicineStats stats={stats} />

				{/* Medicine Table */}
				<Card>
					<CardHeader>
						<div className="flex justify-between items-center">
							<div>
								<CardTitle>Medicine Inventory</CardTitle>
								<CardDescription>
									Complete list of medicines in your pharmacy
									{medicines.length > 0 && (
										<Badge
											variant="secondary"
											className="ml-2"
										>
											{medicines.length} total
										</Badge>
									)}
								</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<MedicineTable
							medicines={medicines}
							onUpdate={handleUpdateMedicine}
							onDelete={handleDeleteMedicine}
						/>
					</CardContent>
				</Card>

				{/* Medicine Categories Overview */}
				<CategoryDistribution medicines={medicines} />
			</div>
		</DashboardLayout>
	);
}
