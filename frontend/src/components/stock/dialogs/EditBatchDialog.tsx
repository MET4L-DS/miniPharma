// file: ./src/components/stock/dialogs/EditBatchDialog.tsx
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
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Edit } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Batch } from "@/types/batch";
import { toast } from "sonner";

interface EditBatchDialogProps {
	batch: Batch;
	onSave: (batch: Batch) => Promise<void>;
	trigger?: React.ReactNode;
}

export function EditBatchDialog({
	batch,
	onSave,
	trigger,
}: EditBatchDialogProps) {
	const [open, setOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [date, setDate] = useState<Date>();
	const [formData, setFormData] = useState<Partial<Batch>>({});

	// Reset form when dialog opens with batch data
	useEffect(() => {
		if (open && batch) {
			setFormData(batch);
			setDate(
				batch.expiry_date ? new Date(batch.expiry_date) : undefined
			);
		}
	}, [batch, open]);

	// Clean up when dialog closes
	useEffect(() => {
		if (!open) {
			setFormData({});
			setDate(undefined);
			setIsLoading(false);
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

	const handleDateSelect = (selectedDate: Date | undefined) => {
		setDate(selectedDate);
		if (selectedDate) {
			setFormData((prev) => ({
				...prev,
				expiry_date: format(selectedDate, "yyyy-MM-dd"),
			}));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.batch_number || !formData.expiry_date) {
			toast.error("Please fill in all required fields.");
			return;
		}

		try {
			setIsLoading(true);
			await onSave(formData as Batch);
			setOpen(false);
			toast.success("Batch updated successfully!");
		} catch (error) {
			console.error("Failed to update batch:", error);
			toast.error("Failed to update batch. Please try again.");
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
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Edit Batch</DialogTitle>
					<DialogDescription>
						Update the batch information for{" "}
						{batch.generic_name || batch.product_id}.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="batch_number">Batch Number*</Label>
						<Input
							id="batch_number"
							name="batch_number"
							value={formData.batch_number || ""}
							onChange={handleInputChange}
							placeholder="Enter batch number"
							required
							disabled={isLoading}
						/>
					</div>

					<div className="space-y-2">
						<Label>Expiry Date*</Label>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									type="button"
									variant="outline"
									className={cn(
										"w-full justify-start text-left font-normal",
										!date && "text-muted-foreground"
									)}
									disabled={isLoading}
								>
									<CalendarIcon className="mr-2 h-4 w-4" />
									{date
										? format(date, "PPP")
										: "Pick expiry date"}
								</Button>
							</PopoverTrigger>
							<PopoverContent
								className="w-auto p-0"
								align="start"
								side="bottom"
								sideOffset={4}
							>
								<Calendar
									mode="single"
									selected={date}
									onSelect={handleDateSelect}
									initialFocus
									fromYear={new Date().getFullYear() - 5}
									toYear={new Date().getFullYear() + 10}
									captionLayout="dropdown-buttons"
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
								value={formData.average_purchase_price || 0}
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
								value={formData.selling_price || 0}
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
							value={formData.quantity_in_stock || 0}
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
							{isLoading ? "Updating..." : "Update Batch"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
