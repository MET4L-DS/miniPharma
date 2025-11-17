// file: ./src/pages/StockPage.tsx
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StockTable } from "@/components/stock/table/StockTable";
import { AddBatchDialog } from "@/components/stock/dialogs/AddBatchDialog";
import { Batch, CreateBatchData } from "@/types/batch";
import { apiService } from "@/services/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, TrendingDown, Calendar } from "lucide-react";

export default function StockPage() {
	const [batches, setBatches] = useState<Batch[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchBatches = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await apiService.getBatches();
			setBatches(data);
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to fetch batches";
			setError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchBatches();
	}, []);

	const handleAddBatch = async (batchData: CreateBatchData) => {
		try {
			await apiService.createBatch(batchData);
			await fetchBatches();
			toast.success("Batch added successfully!");
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to add batch";
			toast.error(errorMessage);
			throw err;
		}
	};

	const handleUpdateBatch = async (updatedBatch: Batch) => {
		try {
			const { id, generic_name, brand_name, ...updateData } =
				updatedBatch;
			await apiService.updateBatch(id, updateData);
			await fetchBatches();
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to update batch";
			toast.error(errorMessage);
			throw err;
		}
	};

	const handleDeleteBatch = async (batchId: number) => {
		try {
			await apiService.deleteBatch(batchId);
			await fetchBatches();
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to delete batch";
			toast.error(errorMessage);
			throw err;
		}
	};

	// Calculate statistics
	const totalBatches = batches.length;
	const lowStockBatches = batches.filter(
		(batch) => batch.quantity_in_stock <= 10 && batch.quantity_in_stock > 0
	).length;
	const outOfStockBatches = batches.filter(
		(batch) => batch.quantity_in_stock === 0
	).length;
	const expiringSoonBatches = batches.filter((batch) => {
		const expiry = new Date(batch.expiry_date);
		const today = new Date();
		const diffTime = expiry.getTime() - today.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays <= 30 && diffDays > 0;
	}).length;

	const stats = [
		{
			title: "Total Batches",
			value: totalBatches.toString(),
			description: "Total batches in inventory",
			icon: Package,
			color: "text-blue-600",
		},
		{
			title: "Low Stock",
			value: lowStockBatches.toString(),
			description: "Batches with low stock",
			icon: TrendingDown,
			color: "text-orange-600",
		},
		{
			title: "Out of Stock",
			value: outOfStockBatches.toString(),
			description: "Batches out of stock",
			icon: AlertTriangle,
			color: "text-red-600",
		},
		{
			title: "Expiring Soon",
			value: expiringSoonBatches.toString(),
			description: "Batches expiring within 30 days",
			icon: Calendar,
			color: "text-yellow-600",
		},
	];

	if (loading) {
		return (
			<DashboardLayout
				title="Stock Management"
				breadcrumbs={[{ label: "Stock Management" }]}
			>
				<div className="flex items-center justify-center h-64">
					<p className="text-muted-foreground">
						Loading stock data...
					</p>
				</div>
			</DashboardLayout>
		);
	}

	if (error) {
		return (
			<DashboardLayout
				title="Stock Management"
				breadcrumbs={[{ label: "Stock Management" }]}
			>
				<div className="flex flex-col items-center justify-center h-64 space-y-4">
					<p className="text-destructive">Error: {error}</p>
					<button
						onClick={fetchBatches}
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
			title="Stock Management"
			breadcrumbs={[{ label: "Stock Management" }]}
		>
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">
							Stock Management
						</h1>
						<p className="text-muted-foreground">
							Manage medicine batches and inventory levels
						</p>
					</div>
					<AddBatchDialog onAdd={handleAddBatch} />
				</div>

				{/* Stats Grid */}
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					{stats.map((stat) => (
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

				<StockTable
					batches={batches}
					onUpdate={handleUpdateBatch}
					onDelete={handleDeleteBatch}
				/>
			</div>
		</DashboardLayout>
	);
}
