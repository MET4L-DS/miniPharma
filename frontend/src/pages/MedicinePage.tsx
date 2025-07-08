// file: ./src/pages/MedicinePage.tsx

import { useState, useEffect } from "react";
import { MedicineTable, AddMedicineDialog } from "@/components/medicine";
import { Medicine } from "@/types/medicine";
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
import {
	Pill,
	Package,
	AlertTriangle,
	RefreshCw,
	TrendingUp,
	Plus,
} from "lucide-react";

export default function MedicinePage() {
	const [medicines, setMedicines] = useState<Medicine[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [stats, setStats] = useState({
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

	const calculateStats = (medicineList: Medicine[]) => {
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

	const medicineStats = [
		{
			title: "Total Medicines",
			value: stats.total_medicines.toLocaleString(),
			description: "Active medicines in inventory",
			icon: Pill,
			color: "text-blue-600",
		},
		{
			title: "Categories",
			value: stats.categories.toString(),
			description: "Therapeutic categories",
			icon: Package,
			color: "text-green-600",
		},
		{
			title: "Prescription Required",
			value: stats.prescription_required.toString(),
			description: "Medicines requiring prescription",
			icon: AlertTriangle,
			color: "text-orange-600",
		},
		{
			title: "OTC Medicines",
			value: stats.otc_medicines.toString(),
			description: "Over-the-counter medicines",
			icon: TrendingUp,
			color: "text-purple-600",
		},
	];

	const categories = [
		"All",
		...new Set(medicines.map((m) => m.therapeutic_category)),
	];

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
						<AddMedicineDialog onAddMedicine={handleAddMedicine}>
							<Button size="sm">
								<Plus className="h-4 w-4 mr-2" />
								Add Medicine
							</Button>
						</AddMedicineDialog>
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
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					{medicineStats.map((stat) => (
						<Card key={stat.title}>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									{stat.title}
								</CardTitle>
								<stat.icon
									className={`h-4 w-4 ${stat.color}`}
								/>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{stat.value}
								</div>
								<p className="text-xs text-muted-foreground">
									{stat.description}
								</p>
							</CardContent>
						</Card>
					))}
				</div>

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
				{stats.categories > 0 && (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Package className="h-5 w-5" />
								Category Distribution
							</CardTitle>
							<CardDescription>
								Overview of medicines by therapeutic category
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid gap-2">
								{categories
									.filter((cat) => cat !== "All")
									.map((category) => {
										const count = medicines.filter(
											(m) =>
												m.therapeutic_category ===
												category
										).length;
										const percentage = (
											(count / medicines.length) *
											100
										).toFixed(1);
										return (
											<div
												key={category}
												className="flex justify-between items-center p-2 rounded-lg border"
											>
												<span className="font-medium">
													{category}
												</span>
												<div className="flex items-center gap-2">
													<Badge variant="outline">
														{count} medicines
													</Badge>
													<span className="text-sm text-muted-foreground">
														{percentage}%
													</span>
												</div>
											</div>
										);
									})}
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</DashboardLayout>
	);
}
