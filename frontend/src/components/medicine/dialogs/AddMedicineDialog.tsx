// file: ./src/components/medicine/dialogs/AddMedicineDialog.tsx

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Medicine } from "@/types/medicine";
import { toast } from "sonner";

interface AddMedicineDialogProps {
	onAddMedicine: (medicine: Medicine) => Promise<void>;
}

const categories = [
	"Analgesic",
	"Antibiotic",
	"Antiviral",
	"Antipyretic",
	"Antifungal",
	"Antidiabetic",
	"Anticholesterol",
	"Antacid",
	"Other",
];

export function AddMedicineDialog({ onAddMedicine }: AddMedicineDialogProps) {
	const [open, setOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState<Medicine>({
		medicine_id: "",
		composition_id: 0,
		name: "",
		brand: "",
		hsn_code: "",
		gst_rate: 0,
		requires_prescription: false,
		therapeutic_category: "",
	});

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]:
				name === "composition_id" || name === "gst_rate"
					? parseFloat(value) || 0
					: value,
		}));
	};

	const handleSelectChange = (value: string, name: string) => {
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSwitchChange = (checked: boolean) => {
		setFormData((prev) => ({
			...prev,
			requires_prescription: checked,
		}));
	};

	const resetForm = () => {
		setFormData({
			medicine_id: "",
			composition_id: 0,
			name: "",
			brand: "",
			hsn_code: "",
			gst_rate: 0,
			requires_prescription: false,
			therapeutic_category: "",
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Basic validation
		if (!formData.medicine_id || !formData.name || !formData.brand) {
			toast.error("Please fill in all required fields.");
			return;
		}

		if (formData.composition_id <= 0) {
			toast.error("Composition ID must be a positive number.");
			return;
		}

		try {
			setIsLoading(true);
			await onAddMedicine(formData);

			// Reset form and close dialog on success
			resetForm();
			setOpen(false);
		} catch (error) {
			// Error handling is done in parent component
			console.error("Failed to add medicine:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleOpenChange = (newOpen: boolean) => {
		if (!isLoading) {
			setOpen(newOpen);
			if (!newOpen) {
				resetForm();
			}
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button variant="default">Add New Medicine</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Add New Medicine</DialogTitle>
					<DialogDescription>
						Enter the details of the new medicine to add to the
						inventory.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="medicine_id" className="text-right">
								Medicine ID*
							</Label>
							<Input
								id="medicine_id"
								name="medicine_id"
								value={formData.medicine_id}
								onChange={handleInputChange}
								className="col-span-3"
								placeholder="e.g., MED001"
								required
								disabled={isLoading}
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label
								htmlFor="composition_id"
								className="text-right"
							>
								Composition ID*
							</Label>
							<Input
								id="composition_id"
								name="composition_id"
								type="number"
								min="1"
								value={formData.composition_id || ""}
								onChange={handleInputChange}
								className="col-span-3"
								placeholder="e.g., 101"
								required
								disabled={isLoading}
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="name" className="text-right">
								Name*
							</Label>
							<Input
								id="name"
								name="name"
								value={formData.name}
								onChange={handleInputChange}
								className="col-span-3"
								placeholder="e.g., Paracetamol"
								required
								disabled={isLoading}
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="brand" className="text-right">
								Brand*
							</Label>
							<Input
								id="brand"
								name="brand"
								value={formData.brand}
								onChange={handleInputChange}
								className="col-span-3"
								placeholder="e.g., Crocin"
								required
								disabled={isLoading}
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="hsn_code" className="text-right">
								HSN Code
							</Label>
							<Input
								id="hsn_code"
								name="hsn_code"
								value={formData.hsn_code}
								onChange={handleInputChange}
								className="col-span-3"
								placeholder="e.g., 30049099"
								disabled={isLoading}
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="gst_rate" className="text-right">
								GST Rate (%)
							</Label>
							<Input
								id="gst_rate"
								name="gst_rate"
								type="number"
								step="0.01"
								min="0"
								max="100"
								value={formData.gst_rate || ""}
								onChange={handleInputChange}
								className="col-span-3"
								placeholder="e.g., 12.00"
								disabled={isLoading}
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label
								htmlFor="therapeutic_category"
								className="text-right"
							>
								Category
							</Label>
							<Select
								onValueChange={(value) =>
									handleSelectChange(
										value,
										"therapeutic_category"
									)
								}
								value={formData.therapeutic_category}
								disabled={isLoading}
							>
								<SelectTrigger className="col-span-3">
									<SelectValue placeholder="Select category" />
								</SelectTrigger>
								<SelectContent>
									{categories.map((category) => (
										<SelectItem
											key={category}
											value={category}
										>
											{category}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label
								htmlFor="requires_prescription"
								className="text-right"
							>
								Requires Prescription
							</Label>
							<div className="flex items-center space-x-2 col-span-3">
								<Switch
									id="requires_prescription"
									checked={formData.requires_prescription}
									onCheckedChange={handleSwitchChange}
									disabled={isLoading}
								/>
								<span>
									{formData.requires_prescription
										? "Yes"
										: "No"}
								</span>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => handleOpenChange(false)}
							disabled={isLoading}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading ? "Adding..." : "Add Medicine"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
