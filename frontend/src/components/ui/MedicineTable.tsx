// file: ./src/components/ui/MedicinePage.tsx

import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select";
import { MedicineActions } from "./MedicineActions";
import { EditMedicineDialog } from "./EditMedicineDialog";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";

interface Medicine {
	medicine_id: string;
	composition_id: number;
	name: string;
	brand: string;
	hsn_code: string;
	gst_rate: number;
	requires_prescription: boolean;
	therapeutic_category: string;
}

interface MedicineTableProps {
	medicines: Medicine[];
	onUpdate: (updatedMedicine: Medicine) => void;
	onDelete: (id: string) => void;
}

export function MedicineTable({
	medicines,
	onUpdate,
	onDelete,
}: MedicineTableProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("All");
	const [requiresPrescription, setRequiresPrescription] = useState("All");

	// Edit state
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [currentMedicine, setCurrentMedicine] = useState<Medicine | null>(
		null
	);

	// Delete state
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [medicineToDelete, setMedicineToDelete] = useState<string>("");

	const filteredMedicines = medicines.filter((medicine) => {
		const matchesSearch = Object.values(medicine).some((value) =>
			value.toString().toLowerCase().includes(searchTerm.toLowerCase())
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

	const confirmDelete = () => {
		onDelete(medicineToDelete);
		setIsDeleteDialogOpen(false);
	};

	return (
		<div>
			<div className="flex gap-4 mb-4">
				<Input
					type="text"
					placeholder="Search medicines..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
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
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Medicine ID</TableHead>
						<TableHead>Composition ID</TableHead>
						<TableHead>Name</TableHead>
						<TableHead>Brand</TableHead>
						<TableHead>HSN Code</TableHead>
						<TableHead>GST Rate (%)</TableHead>
						<TableHead>Requires Prescription</TableHead>
						<TableHead>Therapeutic Category</TableHead>
						<TableHead className="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{filteredMedicines.length > 0 ? (
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
				onSave={onUpdate}
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
