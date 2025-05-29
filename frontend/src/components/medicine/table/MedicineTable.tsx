// file: ./src/components/medicine/table/MedicineTable.tsx

import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useCallback } from "react";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select";
import { Medicine, MedicineTableProps, SearchResult } from "@/types/medicine";
import { MedicineActions } from "./MedicineActions";
import { EditMedicineDialog } from "../dialogs/EditMedicineDialog";
import { DeleteConfirmationDialog } from "../dialogs/DeleteConfirmationDialog";
import { apiService, MedicineSuggestion } from "@/services/api";
import { debounce } from "@/utils/medicine";
import { toast } from "sonner";

export function MedicineTable({
	medicines,
	onUpdate,
	onDelete,
}: MedicineTableProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("All");
	const [requiresPrescription, setRequiresPrescription] = useState("All");
	const [searchResults, setSearchResults] = useState<MedicineSuggestion[]>(
		[]
	);
	const [isSearching, setIsSearching] = useState(false);
	const [showSearchResults, setShowSearchResults] = useState(false);

	// Edit state
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [currentMedicine, setCurrentMedicine] = useState<Medicine | null>(
		null
	);

	// Delete state
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [medicineToDelete, setMedicineToDelete] = useState<string>("");

	// Debounced search function
	const debouncedSearch = useCallback(
		debounce(async (query: string) => {
			if (query.trim().length < 2) {
				setSearchResults([]);
				setShowSearchResults(false);
				setIsSearching(false);
				return;
			}

			try {
				setIsSearching(true);
				const results = await apiService.getMedicineSuggestions(query);
				setSearchResults(results);
				setShowSearchResults(true);
			} catch (error) {
				console.error("Search error:", error);
				toast.error("Search failed. Please try again.");
				setSearchResults([]);
				setShowSearchResults(false);
			} finally {
				setIsSearching(false);
			}
		}, 300),
		[]
	);

	// Handle search input change
	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setSearchTerm(value);

		if (value.trim().length === 0) {
			setSearchResults([]);
			setShowSearchResults(false);
			setIsSearching(false);
		} else {
			setIsSearching(true);
			debouncedSearch(value);
		}
	};

	// Filter medicines based on local filters
	const filteredMedicines = medicines.filter((medicine) => {
		const matchesSearch = showSearchResults
			? false
			: searchTerm.length < 2 ||
			  Object.values(medicine).some((value) =>
					value
						.toString()
						.toLowerCase()
						.includes(searchTerm.toLowerCase())
			  );
		const matchesCategory =
			selectedCategory !== "All"
				? medicine.therapeutic_category === selectedCategory
				: true;
		const matchesPrescription =
			requiresPrescription !== "All"
				? (requiresPrescription === "Yes" &&
						medicine.requires_prescription) ||
				  (requiresPrescription === "No" &&
						!medicine.requires_prescription)
				: true;

		return matchesSearch && matchesCategory && matchesPrescription;
	});

	// Get unique categories from medicines for dynamic filter options
	const categories = [
		"All",
		...new Set(medicines.map((med) => med.therapeutic_category)),
	];

	const handleEdit = (id: string) => {
		const medicineToEdit =
			medicines.find((med) => med.medicine_id === id) || null;
		setCurrentMedicine(medicineToEdit);
		setIsEditDialogOpen(true);
	};

	const handleDelete = (id: string) => {
		setMedicineToDelete(id);
		setIsDeleteDialogOpen(true);
	};

	const confirmDelete = async () => {
		try {
			await onDelete(medicineToDelete);
			setIsDeleteDialogOpen(false);
		} catch (error) {
			// Error handling is done in parent component
		}
	};

	const handleUpdateMedicine = async (updatedMedicine: Medicine) => {
		try {
			await onUpdate(updatedMedicine);
		} catch (error) {
			// Error handling is done in parent component
			throw error;
		}
	};

	return (
		<div>
			<div className="flex gap-4 mb-4">
				<div className="relative flex-1">
					<Input
						type="text"
						placeholder="Search medicines (min 2 characters for API search)..."
						value={searchTerm}
						onChange={handleSearchChange}
					/>
					{isSearching && (
						<div className="absolute right-3 top-3">
							<div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
						</div>
					)}
				</div>
				<Select
					onValueChange={setSelectedCategory}
					value={selectedCategory}
				>
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
					onValueChange={setRequiresPrescription}
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

			{/* Show search results or regular medicine table */}
			<Table>
				<TableHeader>
					<TableRow>
						{showSearchResults ? (
							<>
								<TableHead>Product ID</TableHead>
								<TableHead>Generic Name</TableHead>
								<TableHead>Brand Name</TableHead>
								<TableHead>Min Price</TableHead>
								<TableHead>Total Stock</TableHead>
							</>
						) : (
							<>
								<TableHead>Medicine ID</TableHead>
								<TableHead>Composition ID</TableHead>
								<TableHead>Name</TableHead>
								<TableHead>Brand</TableHead>
								<TableHead>HSN Code</TableHead>
								<TableHead>GST Rate (%)</TableHead>
								<TableHead>Requires Prescription</TableHead>
								<TableHead>Therapeutic Category</TableHead>
								<TableHead className="text-right">
									Actions
								</TableHead>
							</>
						)}
					</TableRow>
				</TableHeader>
				<TableBody>
					{showSearchResults ? (
						searchResults.length > 0 ? (
							searchResults.map((result) => (
								<TableRow key={result.product_id}>
									<TableCell>{result.product_id}</TableCell>
									<TableCell>{result.generic_name}</TableCell>
									<TableCell>{result.brand_name}</TableCell>
									<TableCell>
										₹
										{Number(result.min_price || 0).toFixed(
											2
										)}
									</TableCell>
									<TableCell>
										{result.total_stock || 0}
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={5}
									className="text-center py-4"
								>
									{isSearching
										? "Searching..."
										: "No search results found"}
								</TableCell>
							</TableRow>
						)
					) : filteredMedicines.length > 0 ? (
						filteredMedicines.map((medicine) => (
							<TableRow key={medicine.medicine_id}>
								<TableCell>{medicine.medicine_id}</TableCell>
								<TableCell>{medicine.composition_id}</TableCell>
								<TableCell>{medicine.name}</TableCell>
								<TableCell>{medicine.brand}</TableCell>
								<TableCell>{medicine.hsn_code}</TableCell>
								<TableCell>{medicine.gst_rate}</TableCell>
								<TableCell>
									{medicine.requires_prescription
										? "Yes"
										: "No"}
								</TableCell>
								<TableCell>
									{medicine.therapeutic_category}
								</TableCell>
								<TableCell className="text-right">
									<MedicineActions
										medicineId={medicine.medicine_id}
										onEdit={handleEdit}
										onDelete={handleDelete}
									/>
								</TableCell>
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={9} className="text-center py-4">
								No medicines found
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>

			{/* Edit Dialog */}
			<EditMedicineDialog
				isOpen={isEditDialogOpen}
				onClose={() => setIsEditDialogOpen(false)}
				medicine={currentMedicine}
				onSave={handleUpdateMedicine}
			/>

			{/* Delete Confirmation Dialog */}
			<DeleteConfirmationDialog
				isOpen={isDeleteDialogOpen}
				onClose={() => setIsDeleteDialogOpen(false)}
				onConfirm={confirmDelete}
				medicineId={medicineToDelete}
			/>
		</div>
	);
}
