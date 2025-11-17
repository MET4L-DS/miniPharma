// file: ./src/components/stock/table/StockTable.tsx
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { BatchTableProps } from "@/types/batch";
import { EditBatchDialog } from "../dialogs/EditBatchDialog";
import { DeleteBatchDialog } from "../dialogs/DeleteBatchDialog";
import { StockFilters } from "./StockFilters";
import { format } from "date-fns";
import {
	getStockStatus,
	isExpiringSoon,
	isExpired,
	formatCurrency,
} from "@/utils/stock";

export function StockTable({ batches, onUpdate, onDelete }: BatchTableProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [stockFilter, setStockFilter] = useState("All");

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

	return (
		<div className="space-y-4">
			<StockFilters
				searchTerm={searchTerm}
				onSearchChange={setSearchTerm}
				stockFilter={stockFilter}
				onStockFilterChange={setStockFilter}
			/>

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
											{formatCurrency(
												batch.average_purchase_price
											)}
										</TableCell>
										<TableCell>
											{formatCurrency(
												batch.selling_price
											)}
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
											<div className="flex gap-2 justify-end">
												<EditBatchDialog
													batch={batch}
													onSave={async (
														updatedBatch
													) => {
														await onUpdate(
															updatedBatch
														);
													}}
												/>
												<DeleteBatchDialog
													batchNumber={
														batch.batch_number
													}
													onConfirm={async () => {
														await onDelete(
															batch.id
														);
													}}
												/>
											</div>
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
		</div>
	);
}
