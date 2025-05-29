// file: ./src/components/stock/dialogs/AddBatchDialog.tsx
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
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CreateBatchData } from "@/types/batch";
import { apiService, ApiMedicine } from "@/services/api";
import { toast } from "sonner";

interface AddBatchDialogProps {
	onAdd: (batch: CreateBatchData) => Promise<void>;
}

export function AddBatchDialog({ onAdd }: AddBatchDialogProps) {
	const [open, setOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [medicines, setMedicines] = useState<ApiMedicine[]>([]);
	const [date, setDate] = useState<Date>();
	const [formData, setFormData] = useState<CreateBatchData>({
		batch_number: "",
		product_id: "",
		expiry_date: "",
		average_purchase_price: 0,
		selling_price: 0,
		quantity_in_stock: 0,
	});

	const [isCalendarOpen, setIsCalendarOpen] = useState(false);

	useEffect(() => {
		const fetchMedicines = async () => {
			try {
				const data = await apiService.getMedicines();
				setMedicines(data);
			} catch (error) {
				console.error("Failed to fetch medicines:", error);
				toast.error("Failed to load medicines");
			}
		};

		if (open) {
			fetchMedicines();
		}
	}, [open]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]:
				name.includes("price") || name === "quantity_in_stock"
					? parseFloat(value) || 0
					: value,
		}));
	};

	const handleSelectChange = (value: string) => {
		setFormData((prev) => ({
			...prev,
			product_id: value,
		}));
	};

	const handleDateSelect = (selectedDate: Date | undefined) => {
		setDate(selectedDate);
		if (selectedDate) {
			setFormData((prev) => ({
				...prev,
				expiry_date: format(selectedDate, "yyyy-MM-dd"),
			}));
		}
	};

	const resetForm = () => {
		setFormData({
			batch_number: "",
			product_id: "",
			expiry_date: "",
			average_purchase_price: 0,
			selling_price: 0,
			quantity_in_stock: 0,
		});
		setDate(undefined);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (
			!formData.batch_number ||
			!formData.product_id ||
			!formData.expiry_date
		) {
			toast.error("Please fill in all required fields.");
			return;
		}

		try {
			setIsLoading(true);
			await onAdd(formData);
			resetForm();
			setOpen(false);
			toast.success("Batch added successfully!");
		} catch (error) {
			console.error("Failed to add batch:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					Add New Batch
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Add New Batch</DialogTitle>
					<DialogDescription>
						Add a new batch of medicine to your stock inventory.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="batch_number">Batch Number*</Label>
						<Input
							id="batch_number"
							name="batch_number"
							value={formData.batch_number}
							onChange={handleInputChange}
							placeholder="Enter batch number"
							required
							disabled={isLoading}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="product_id">Medicine*</Label>
						<Select
							value={formData.product_id}
							onValueChange={handleSelectChange}
							disabled={isLoading}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select a medicine" />
							</SelectTrigger>
							<SelectContent>
								{medicines.map((medicine) => (
									<SelectItem
										key={medicine.product_id}
										value={medicine.product_id}
									>
										{medicine.brand_name} (
										{medicine.generic_name})
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label>Expiry Date*</Label>
						<Popover
							open={isCalendarOpen}
							onOpenChange={setIsCalendarOpen}
						>
							<PopoverTrigger asChild>
								<Button
									variant={"outline"}
									className={cn(
										"w-full justify-start text-left font-normal",
										!date && "text-muted-foreground"
									)}
								>
									<CalendarIcon className="mr-2 h-4 w-4" />
									{date
										? format(date, "PPP")
										: "Pick expiry date"}
								</Button>
							</PopoverTrigger>
							<PopoverContent
								className="w-auto p-0 pointer-events-auto"
								align="start"
								side="bottom"
								sideOffset={4}
								onInteractOutside={(e) => {
									// Prevent closing when clicking inside calendar
									const target = e.target as Element;
									if (
										target.closest(
											"[data-radix-popper-content-wrapper]"
										)
									) {
										e.preventDefault();
									}
								}}
							>
								<Calendar
									mode="single"
									selected={date}
									onSelect={(selectedDate) => {
										if (selectedDate) {
											handleDateSelect(selectedDate);
											setIsCalendarOpen(false); // Close the popover after selection
										}
									}}
									initialFocus
									disabled={(date) => date < new Date()}
									className="rounded-md border-0 pointer-events-auto"
								/>
							</PopoverContent>
						</Popover>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="average_purchase_price">
								Purchase Price
							</Label>
							<Input
								id="average_purchase_price"
								name="average_purchase_price"
								type="number"
								step="0.01"
								value={formData.average_purchase_price}
								onChange={handleInputChange}
								placeholder="0.00"
								disabled={isLoading}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="selling_price">Selling Price</Label>
							<Input
								id="selling_price"
								name="selling_price"
								type="number"
								step="0.01"
								value={formData.selling_price}
								onChange={handleInputChange}
								placeholder="0.00"
								disabled={isLoading}
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="quantity_in_stock">
							Quantity in Stock
						</Label>
						<Input
							id="quantity_in_stock"
							name="quantity_in_stock"
							type="number"
							value={formData.quantity_in_stock}
							onChange={handleInputChange}
							placeholder="0"
							disabled={isLoading}
						/>
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
							{isLoading ? "Adding..." : "Add Batch"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
