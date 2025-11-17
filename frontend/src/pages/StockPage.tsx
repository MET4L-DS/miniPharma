// file: ./src/pages/StockPage.tsx
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StockTable } from "@/components/stock/table/StockTable";
import { AddBatchDialog } from "@/components/stock/dialogs/AddBatchDialog";
import { StockStats } from "@/components/stock/StockStats";
import { Batch, CreateBatchData } from "@/types/batch";
import { apiService } from "@/services/api";
import { toast } from "sonner";
import { calculateStockStats } from "@/utils/stock";

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

	const stats = calculateStockStats(batches);

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
				<StockStats stats={stats} />

				<StockTable
					batches={batches}
					onUpdate={handleUpdateBatch}
					onDelete={handleDeleteBatch}
				/>
			</div>
		</DashboardLayout>
	);
}
