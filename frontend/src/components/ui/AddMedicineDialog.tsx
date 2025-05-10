import { useState } from "react";
import { Button } from "@/components/ui/button";
import axios from 'axios';
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
import { toast } from "sonner";

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

interface AddMedicineDialogProps {
	onAddMedicine: (medicine: Medicine) => void;
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
					? parseFloat(value)
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
	
		if (!formData.medicine_id || !formData.name || !formData.brand) {
			toast.error("Please fill in all required fields.");
			return;
		}
	
		try {
			const response = await axios.post('http://127.0.0.1:8000/api/add-medicine/', formData);
			toast.success(response.data.message || "Medicine added successfully!");
			
			// Optionally, also call your parent callback if needed
			onAddMedicine(formData);
	
			// Reset form
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
			setOpen(false);
	
		} catch (error: any) {
			console.error(error);
			toast.error(error.response?.data?.error || "Something went wrong.");
		}
	};
	

	return (
		<Dialog open={open} onOpenChange={setOpen}>
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
								required
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
								value={formData.composition_id || ""}
								onChange={handleInputChange}
								className="col-span-3"
								required
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
								required
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
								required
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
								value={formData.gst_rate || ""}
								onChange={handleInputChange}
								className="col-span-3"
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
						>
							Cancel
						</Button>
						<Button type="submit">Add Medicine</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
