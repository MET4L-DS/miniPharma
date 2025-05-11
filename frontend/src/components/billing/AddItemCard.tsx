import { useState, useRef, useEffect } from "react";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AddItemCardProps {
	newItem: {
		medicineName: string;
		quantity: number;
	};
	setNewItem: (item: any) => void;
	handleAddItem: () => void;
	sampleMedicines: any[];
}

export function AddItemCard({
	newItem,
	setNewItem,
	handleAddItem,
	sampleMedicines,
}: AddItemCardProps) {
	const [medicineInput, setMedicineInput] = useState(newItem.medicineName);
	const [filteredMedicines, setFilteredMedicines] = useState<any[]>([]);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Filter medicines based on input
	useEffect(() => {
		if (medicineInput.trim() === "") {
			setFilteredMedicines([]);
			return;
		}

		const filtered = sampleMedicines.filter((med) =>
			med.name.toLowerCase().includes(medicineInput.toLowerCase())
		);
		setFilteredMedicines(filtered);
		setIsDropdownOpen(filtered.length > 0);
	}, [medicineInput, sampleMedicines]);

	// Handle click outside to close dropdown
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsDropdownOpen(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	// Handle medicine selection
	const handleSelectMedicine = (medicine: any) => {
		setNewItem({ ...newItem, medicineName: medicine.name });
		setMedicineInput(medicine.name);
		setIsDropdownOpen(false);
	};

	// Handle input change
	const handleInputChange = (value: string) => {
		setMedicineInput(value);
		setNewItem({ ...newItem, medicineName: value });
		setIsDropdownOpen(true);
	};

	return (
		<Card className="col-span-1">
			<CardHeader>
				<CardTitle>Add Item</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2 relative" ref={dropdownRef}>
					<Label htmlFor="medicine">Medicine</Label>
					<Input
						id="medicine"
						type="text"
						placeholder="Type medicine name..."
						value={medicineInput}
						onChange={(e) => handleInputChange(e.target.value)}
						onFocus={() => medicineInput && setIsDropdownOpen(true)}
					/>

					{isDropdownOpen && filteredMedicines.length > 0 && (
						<div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md overflow-auto border border-gray-200">
							{filteredMedicines.map((med) => (
								<div
									key={med.name}
									className="px-4 py-2 hover:bg-slate-100 cursor-pointer flex justify-between"
									onClick={() => handleSelectMedicine(med)}
								>
									<span>{med.name}</span>
									<span className="text-muted-foreground">
										₹{med.price.toFixed(2)}
									</span>
								</div>
							))}
						</div>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="quantity">Quantity</Label>
					<Input
						id="quantity"
						type="number"
						min="1"
						value={newItem.quantity}
						onChange={(e) =>
							setNewItem({
								...newItem,
								quantity: parseInt(e.target.value) || 0,
							})
						}
					/>
				</div>
			</CardContent>
			<CardFooter>
				<Button onClick={handleAddItem} className="w-full">
					<Plus className="mr-2 h-4 w-4" /> Add Item
				</Button>
			</CardFooter>
		</Card>
	);
}
