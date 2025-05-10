// file: ./src/pages/BillingPage.tsx

import { useState, useMemo } from "react";
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
	TableFooter,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, Receipt } from "lucide-react";
import { toast } from "sonner";

// Define the BillItem interface
interface BillItem {
	id: string;
	medicineName: string;
	phoneNumber: string;
	quantity: number;
	unitPrice: number;
	amount: number;
}

// Define the sample data for medicines
const sampleMedicines = [
	{ name: "Paracetamol", price: 10.0 },
	{ name: "Amoxicillin", price: 20.5 },
	{ name: "Metformin", price: 15.75 },
	{ name: "Atorvastatin", price: 25.0 },
	{ name: "Ranitidine", price: 12.5 },
];

export default function BillingPage() {
	const [billItems, setBillItems] = useState<BillItem[]>([
		{
			id: "1",
			medicineName: "Paracetamol",
			phoneNumber: "9876543210",
			quantity: 2,
			unitPrice: 10.0,
			amount: 20.0,
		},
	]);

	const [discountPercentage, setDiscountPercentage] = useState(0);
	const [newItem, setNewItem] = useState<{
		medicineName: string;
		phoneNumber: string;
		quantity: number;
	}>({
		medicineName: "",
		phoneNumber: "",
		quantity: 1,
	});

	// Calculate the total, discount, and final amounts
	const { totalAmount, discountAmount, finalAmount } = useMemo(() => {
		const total = billItems.reduce((sum, item) => sum + item.amount, 0);
		const discount = (total * discountPercentage) / 100;
		const final = total - discount;

		return {
			totalAmount: total,
			discountAmount: discount,
			finalAmount: final,
		};
	}, [billItems, discountPercentage]);

	// Handle adding a new item
	const handleAddItem = () => {
		if (
			!newItem.medicineName ||
			!newItem.phoneNumber ||
			newItem.quantity <= 0
		) {
			toast.error("Please fill all fields with valid values");
			return;
		}

		const selectedMedicine = sampleMedicines.find(
			(med) => med.name === newItem.medicineName
		);

		if (!selectedMedicine) {
			toast.error("Medicine not found");
			return;
		}

		const unitPrice = selectedMedicine.price;
		const amount = unitPrice * newItem.quantity;

		const newBillItem: BillItem = {
			id: Date.now().toString(),
			medicineName: newItem.medicineName,
			phoneNumber: newItem.phoneNumber,
			quantity: newItem.quantity,
			unitPrice: unitPrice,
			amount: amount,
		};

		setBillItems([...billItems, newBillItem]);
		setNewItem({
			medicineName: "",
			phoneNumber: "",
			quantity: 1,
		});

		toast.success("Item added to bill");
	};

	// Handle removing an item
	const handleRemoveItem = (id: string) => {
		setBillItems(billItems.filter((item) => item.id !== id));
		toast.success("Item removed from bill");
	};

	// Handle generating bill
	const handleGenerateBill = () => {
		if (billItems.length === 0) {
			toast.error("Cannot generate bill with no items");
			return;
		}

		toast.success("Bill generated successfully");
		// In a real app, this would save the bill to a database or generate a printable receipt
	};

	return (
		<div className="px-16 py-8">
			<h1 className="text-2xl font-bold mb-6">Billing</h1>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
				{/* Add New Item Card */}
				<Card className="col-span-1">
					<CardHeader>
						<CardTitle>Add Item</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="medicine">Medicine</Label>
							<Select
								value={newItem.medicineName}
								onValueChange={(value) =>
									setNewItem({
										...newItem,
										medicineName: value,
									})
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select medicine" />
								</SelectTrigger>
								<SelectContent>
									{sampleMedicines.map((med) => (
										<SelectItem
											key={med.name}
											value={med.name}
										>
											{med.name} (₹{med.price.toFixed(2)})
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="phone">Phone Number</Label>
							<Input
								id="phone"
								type="tel"
								placeholder="Customer phone number"
								value={newItem.phoneNumber}
								onChange={(e) =>
									setNewItem({
										...newItem,
										phoneNumber: e.target.value,
									})
								}
							/>
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

				{/* Bill Summary Card */}
				<Card className="col-span-1 md:col-span-2">
					<CardHeader>
						<CardTitle>Bill Summary</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="discount">Discount (%)</Label>
							<Input
								id="discount"
								type="number"
								min="0"
								max="100"
								value={discountPercentage}
								onChange={(e) =>
									setDiscountPercentage(
										Math.min(
											100,
											Math.max(
												0,
												parseInt(e.target.value) || 0
											)
										)
									)
								}
							/>
						</div>

						<div className="space-y-1 bg-slate-50 p-4 rounded-md">
							<div className="flex justify-between">
								<span className="text-muted-foreground">
									Total Amount:
								</span>
								<span>₹{totalAmount.toFixed(2)}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">
									Discount ({discountPercentage}%):
								</span>
								<span>₹{discountAmount.toFixed(2)}</span>
							</div>
							<div className="flex justify-between font-bold pt-2 border-t">
								<span>Final Amount:</span>
								<span>₹{finalAmount.toFixed(2)}</span>
							</div>
						</div>
					</CardContent>
					<CardFooter>
						<Button
							onClick={handleGenerateBill}
							className="w-full"
							variant="default"
						>
							<Receipt className="mr-2 h-4 w-4" /> Generate Bill
						</Button>
					</CardFooter>
				</Card>
			</div>

			{/* Billing Table */}
			<Card>
				<CardHeader>
					<CardTitle>Bill Items</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Medicine Name</TableHead>
								<TableHead>Phone Number</TableHead>
								<TableHead>Quantity</TableHead>
								<TableHead>Unit Price (₹)</TableHead>
								<TableHead>Amount (₹)</TableHead>
								<TableHead className="w-[50px]"></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{billItems.length > 0 ? (
								billItems.map((item) => (
									<TableRow key={item.id}>
										<TableCell>
											{item.medicineName}
										</TableCell>
										<TableCell>
											{item.phoneNumber}
										</TableCell>
										<TableCell>{item.quantity}</TableCell>
										<TableCell>
											{item.unitPrice.toFixed(2)}
										</TableCell>
										<TableCell>
											{item.amount.toFixed(2)}
										</TableCell>
										<TableCell>
											<Button
												variant="ghost"
												size="icon"
												onClick={() =>
													handleRemoveItem(item.id)
												}
											>
												<Trash2 className="h-4 w-4 text-red-500" />
											</Button>
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell
										colSpan={6}
										className="text-center py-4"
									>
										No items added to the bill
									</TableCell>
								</TableRow>
							)}
						</TableBody>
						<TableFooter>
							<TableRow>
								<TableCell
									colSpan={4}
									className="text-right font-medium"
								>
									Total
								</TableCell>
								<TableCell className="font-bold">
									₹{totalAmount.toFixed(2)}
								</TableCell>
								<TableCell></TableCell>
							</TableRow>
							<TableRow>
								<TableCell
									colSpan={4}
									className="text-right font-medium"
								>
									Discount ({discountPercentage}%)
								</TableCell>
								<TableCell className="font-bold">
									₹{discountAmount.toFixed(2)}
								</TableCell>
								<TableCell></TableCell>
							</TableRow>
							<TableRow>
								<TableCell
									colSpan={4}
									className="text-right font-medium"
								>
									Final Amount
								</TableCell>
								<TableCell className="font-bold">
									₹{finalAmount.toFixed(2)}
								</TableCell>
								<TableCell></TableCell>
							</TableRow>
						</TableFooter>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
