// file: ./src/components/medicine/table/MedicineFilters.tsx

import { Input } from "@/components/ui/input";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select";
import { MedicineFiltersProps } from "@/types/medicine-dialog";

export function MedicineFilters({
	searchTerm,
	onSearchChange,
	isSearching,
	selectedCategory,
	onCategoryChange,
	requiresPrescription,
	onPrescriptionChange,
	categories,
}: MedicineFiltersProps) {
	return (
		<div className="flex gap-4 mb-4">
			<div className="relative flex-1">
				<Input
					type="text"
					placeholder="Search medicines (min 2 characters for API search)..."
					value={searchTerm}
					onChange={onSearchChange}
				/>
				{isSearching && (
					<div className="absolute right-3 top-3">
						<div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
					</div>
				)}
			</div>
			<Select onValueChange={onCategoryChange} value={selectedCategory}>
				<SelectTrigger className="w-[180px]">
					<SelectValue placeholder="Select Category" />
				</SelectTrigger>
				<SelectContent>
					{categories.map((category) => (
						<SelectItem key={category} value={category}>
							{category}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<Select
				onValueChange={onPrescriptionChange}
				value={requiresPrescription}
			>
				<SelectTrigger className="w-[180px]">
					<SelectValue placeholder="Requires Prescription?" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="All">All</SelectItem>
					<SelectItem value="Yes">Yes</SelectItem>
					<SelectItem value="No">No</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
}
