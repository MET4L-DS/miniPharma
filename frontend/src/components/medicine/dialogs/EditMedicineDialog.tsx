// file: ./src/components/medicine/dialogs/EditMedicineDialog.tsx

import { useState, useEffect } from "react";
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
import { Edit } from "lucide-react";

interface EditMedicineDialogProps {
	medicine: Medicine;
	onSave: (updatedMedicine: Medicine) => Promise<void>;
	trigger?: React.ReactNode;
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

export function EditMedicineDialog({
	medicine,
	onSave,
	trigger,
}: EditMedicineDialogProps) {
	const [open, setOpen] = useState(false);
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
	const [isLoading, setIsLoading] = useState(false);

	// Set form data when medicine changes
	useEffect(() => {
		if (medicine && open) {
			setFormData({ ...medicine });
		}
	}, [medicine, open]);

	// Reset form when dialog closes
	useEffect(() => {
		if (!open) {
			const timer = setTimeout(() => {
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
				setIsLoading(false);
			}, 100);
			return () => clearTimeout(timer);
		}
	}, [open]);

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
			await onSave(formData);
			toast.success("Medicine updated successfully!");
			setOpen(false);
		} catch (error) {
			console.error("Failed to update medicine:", error);
			toast.error("Failed to update medicine. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger || (
					<Button variant="outline" size="sm">
						<Edit className="mr-2 h-4 w-4" />
						Edit
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Edit Medicine</DialogTitle>
					<DialogDescription>
						Update the details of the selected medicine.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label
								htmlFor="edit_medicine_id"
								className="text-right"
							>
								Medicine ID*
							</Label>
							<Input
								id="edit_medicine_id"
								name="medicine_id"
								value={formData.medicine_id}
								onChange={handleInputChange}
								className="col-span-3"
								disabled // Medicine ID should not be editable
								required
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label
								htmlFor="edit_composition_id"
								className="text-right"
							>
								Composition ID*
							</Label>
							<Input
								id="edit_composition_id"
								name="composition_id"
								type="number"
								min="1"
								value={formData.composition_id || ""}
								onChange={handleInputChange}
								className="col-span-3"
								required
								disabled={isLoading}
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="edit_name" className="text-right">
								Name*
							</Label>
							<Input
								id="edit_name"
								name="name"
								value={formData.name}
								onChange={handleInputChange}
								className="col-span-3"
								required
								disabled={isLoading}
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="edit_brand" className="text-right">
								Brand*
							</Label>
							<Input
								id="edit_brand"
								name="brand"
								value={formData.brand}
								onChange={handleInputChange}
								className="col-span-3"
								required
								disabled={isLoading}
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label
								htmlFor="edit_hsn_code"
								className="text-right"
							>
								HSN Code
							</Label>
							<Input
								id="edit_hsn_code"
								name="hsn_code"
								value={formData.hsn_code}
								onChange={handleInputChange}
								className="col-span-3"
								disabled={isLoading}
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label
								htmlFor="edit_gst_rate"
								className="text-right"
							>
								GST Rate (%)
							</Label>
							<Input
								id="edit_gst_rate"
								name="gst_rate"
								type="number"
								step="0.01"
								min="0"
								max="100"
								value={formData.gst_rate || ""}
								onChange={handleInputChange}
								className="col-span-3"
								disabled={isLoading}
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label
								htmlFor="edit_therapeutic_category"
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
								htmlFor="edit_requires_prescription"
								className="text-right"
							>
								Requires Prescription
							</Label>
							<div className="flex items-center space-x-2 col-span-3">
								<Switch
									id="edit_requires_prescription"
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
							onClick={() => setOpen(false)}
							disabled={isLoading}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading ? "Saving..." : "Save Changes"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
