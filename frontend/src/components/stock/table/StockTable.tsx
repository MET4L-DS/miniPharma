// file: ./src/components/stock/table/StockTable.tsx
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select";
import { Batch, BatchTableProps } from "@/types/batch";
import { BatchActions } from "./BatchActions";
import { EditBatchDialog } from "../dialogs/EditBatchDialog";
import { DeleteBatchDialog } from "../dialogs/DeleteBatchDialog";
import { format } from "date-fns";

export function StockTable({ batches, onUpdate, onDelete }: BatchTableProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [stockFilter, setStockFilter] = useState("All");

	// Edit state
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [currentBatch, setCurrentBatch] = useState<Batch | null>(null);

	// Delete state
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [batchToDelete, setBatchToDelete] = useState<{
		id: number;
		number: string;
	}>({ id: 0, number: "" });

	const getStockStatus = (quantity: number) => {
		if (quantity === 0)
			return { label: "Out of Stock", variant: "destructive" as const };
		if (quantity <= 10)
			return { label: "Low Stock", variant: "secondary" as const };
		return { label: "In Stock", variant: "default" as const };
	};

	const isExpiringSoon = (expiryDate: string) => {
		const expiry = new Date(expiryDate);
		const today = new Date();
		const diffTime = expiry.getTime() - today.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays <= 30 && diffDays > 0;
	};

	const isExpired = (expiryDate: string) => {
		const expiry = new Date(expiryDate);
		const today = new Date();
		return expiry < today;
	};

	const filteredBatches = batches.filter((batch) => {
		const matchesSearch =
			batch.batch_number
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			batch.generic_name
				?.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			batch.brand_name
				?.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			batch.product_id.toLowerCase().includes(searchTerm.toLowerCase());

		const stockStatus = getStockStatus(batch.quantity_in_stock);
		const matchesStockFilter =
			stockFilter === "All" || stockStatus.label === stockFilter;

		return matchesSearch && matchesStockFilter;
	});

	const handleEdit = (id: number) => {
		const batchToEdit = batches.find((batch) => batch.id === id) || null;
		setCurrentBatch(batchToEdit);
		setIsEditDialogOpen(true);
	};

	const handleDelete = (id: number) => {
		const batch = batches.find((b) => b.id === id);
		if (batch) {
			setBatchToDelete({ id, number: batch.batch_number });
			setIsDeleteDialogOpen(true);
		}
	};

	const confirmDelete = async () => {
		try {
			await onDelete(batchToDelete.id);
			setIsDeleteDialogOpen(false);
		} catch (error) {
			console.error("Failed to delete batch:", error);
		}
	};

	const handleUpdateBatch = async (updatedBatch: Batch) => {
		try {
			await onUpdate(updatedBatch);
			setIsEditDialogOpen(false);
		} catch (error) {
			throw error;
		}
	};

	return (
		<div className="space-y-4">
			{/* Filters */}
			<div className="flex flex-col sm:flex-row gap-4">
				<div className="flex-1">
					<Input
						placeholder="Search by batch number, medicine name, or product ID..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="max-w-sm"
					/>
				</div>
				<Select value={stockFilter} onValueChange={setStockFilter}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Filter by stock" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="All">All Stock</SelectItem>
						<SelectItem value="In Stock">In Stock</SelectItem>
						<SelectItem value="Low Stock">Low Stock</SelectItem>
						<SelectItem value="Out of Stock">
							Out of Stock
						</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Table */}
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Batch Number</TableHead>
							<TableHead>Medicine</TableHead>
							<TableHead>Product ID</TableHead>
							<TableHead>Expiry Date</TableHead>
							<TableHead>Purchase Price</TableHead>
							<TableHead>Selling Price</TableHead>
							<TableHead>Stock Quantity</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className="text-right">
								Actions
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredBatches.length > 0 ? (
							filteredBatches.map((batch) => {
								const stockStatus = getStockStatus(
									batch.quantity_in_stock
								);
								const expired = isExpired(batch.expiry_date);
								const expiringSoon = isExpiringSoon(
									batch.expiry_date
								);

								return (
									<TableRow key={batch.id}>
										<TableCell className="font-medium">
											{batch.batch_number}
										</TableCell>
										<TableCell>
											<div>
												<div className="font-medium">
													{batch.brand_name}
												</div>
												<div className="text-sm text-muted-foreground">
													{batch.generic_name}
												</div>
											</div>
										</TableCell>
										<TableCell>
											{batch.product_id}
										</TableCell>
										<TableCell>
											<div className="flex flex-col">
												<span
													className={
														expired
															? "text-red-600"
															: expiringSoon
															? "text-orange-600"
															: ""
													}
												>
													{format(
														new Date(
															batch.expiry_date
														),
														"MMM dd, yyyy"
													)}
												</span>
												{expired && (
													<Badge
														variant="destructive"
														className="text-xs w-fit"
													>
														Expired
													</Badge>
												)}
												{expiringSoon && !expired && (
													<Badge
														variant="secondary"
														className="text-xs w-fit"
													>
														Expiring Soon
													</Badge>
												)}
											</div>
										</TableCell>
										<TableCell>
											₹
											{batch.average_purchase_price.toFixed(
												2
											)}
										</TableCell>
										<TableCell>
											₹{batch.selling_price.toFixed(2)}
										</TableCell>
										<TableCell>
											{batch.quantity_in_stock}
										</TableCell>
										<TableCell>
											<Badge
												variant={stockStatus.variant}
											>
												{stockStatus.label}
											</Badge>
										</TableCell>
										<TableCell className="text-right">
											<BatchActions
												batchId={batch.id}
												onEdit={handleEdit}
												onDelete={handleDelete}
											/>
										</TableCell>
									</TableRow>
								);
							})
						) : (
							<TableRow>
								<TableCell colSpan={9} className="text-center">
									No batches found
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* Edit Dialog */}
			<EditBatchDialog
				isOpen={isEditDialogOpen}
				onClose={() => setIsEditDialogOpen(false)}
				batch={currentBatch}
				onSave={handleUpdateBatch}
			/>

			{/* Delete Confirmation Dialog */}
			<DeleteBatchDialog
				isOpen={isDeleteDialogOpen}
				onClose={() => setIsDeleteDialogOpen(false)}
				onConfirm={confirmDelete}
				batchNumber={batchToDelete.number}
			/>
		</div>
	);
}
