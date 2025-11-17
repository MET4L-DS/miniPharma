// file: ./src/components/stock/table/StockFilters.tsx

import { Input } from "@/components/ui/input";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select";
import { StockFiltersProps } from "@/types/stock-dialog";

export function StockFilters({
	searchTerm,
	onSearchChange,
	stockFilter,
	onStockFilterChange,
}: StockFiltersProps) {
	return (
		<div className="flex flex-col sm:flex-row gap-4">
			<div className="flex-1">
				<Input
					placeholder="Search by batch number, medicine name, or product ID..."
					value={searchTerm}
					onChange={(e) => onSearchChange(e.target.value)}
					className="max-w-sm"
				/>
			</div>
			<Select value={stockFilter} onValueChange={onStockFilterChange}>
				<SelectTrigger className="w-[180px]">
					<SelectValue placeholder="Filter by stock" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="All">All Stock</SelectItem>
					<SelectItem value="In Stock">In Stock</SelectItem>
					<SelectItem value="Low Stock">Low Stock</SelectItem>
					<SelectItem value="Out of Stock">Out of Stock</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
}
