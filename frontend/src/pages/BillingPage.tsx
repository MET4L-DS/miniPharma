import { useState, useMemo } from "react";
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
} from "@/components/ui/table";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogAction,
	AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface BillingItem {
	id: string;
	medicineName: string;
	phoneNumber: string;
	quantity: number;
	unitPrice: number;
}

export default function BillingPage() {
	const [items, setItems] = useState<BillingItem[]>([
		{
			id: "1",
			medicineName: "Paracetamol",
			phoneNumber: "1234567890",
			quantity: 2,
			unitPrice: 50,
		},
		{
			id: "2",
			medicineName: "Amoxicillin",
			phoneNumber: "9876543210",
			quantity: 1,
			unitPrice: 120,
		},
		{
			id: "3",
			medicineName: "Metformin",
			phoneNumber: "5556667777",
			quantity: 3,
			unitPrice: 75,
		},
	]);
	const [discount, setDiscount] = useState<number>(0);
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [paymentCash, setPaymentCash] = useState<number>(0);
	const [paymentUPI, setPaymentUPI] = useState<number>(0);

	const itemsWithAmount = useMemo(
		() =>
			items.map((item) => ({
				...item,
				totalAmount: item.quantity * item.unitPrice,
			})),
		[items]
	);

	const totalPrice = useMemo(
		() => itemsWithAmount.reduce((sum, i) => sum + i.totalAmount, 0),
		[itemsWithAmount]
	);

	const finalBill = useMemo(
		() => totalPrice - (discount / 100) * totalPrice,
		[totalPrice, discount]
	);

	const remainingDue = useMemo(
		() => finalBill - paymentCash - paymentUPI,
		[finalBill, paymentCash, paymentUPI]
	);

	const handleAdd = (item: BillingItem) => {
		setItems((prev) => [...prev, item]);
		toast.success("Item added successfully");
	};

	const handleDelete = (id: string) => {
		setItems((prev) => prev.filter((i) => i.id !== id));
		toast.success("Item deleted");
	};

	const handlePay = () => {
		if (remainingDue !== 0) {
			toast.error("Payment amounts must sum to final bill");
			return;
		}
		toast.success("Payment successful");
		alert(`Paid Cash: ${paymentCash}, UPI: ${paymentUPI}`);
		setPaymentCash(0);
		setPaymentUPI(0);
	};

	return (
		<div className="px-16 py-8">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">Billing Summary</h1>
				<Dialog>
					<DialogTrigger asChild>
						<Button>Add Item</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle>Add Billing Item</DialogTitle>
							<DialogDescription>
								Enter details to add a new item.
							</DialogDescription>
						</DialogHeader>
						<AddItemForm onAdd={handleAdd} />
					</DialogContent>
				</Dialog>
			</div>

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Medicine Name</TableHead>
						<TableHead>Phone Number</TableHead>
						<TableHead>Quantity</TableHead>
						<TableHead>Unit Price</TableHead>
						<TableHead>Total Amount</TableHead>
						<TableHead className="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{itemsWithAmount.map((item) => (
						<TableRow key={item.id}>
							<TableCell>{item.medicineName}</TableCell>
							<TableCell>{item.phoneNumber}</TableCell>
							<TableCell>{item.quantity}</TableCell>
							<TableCell>{item.unitPrice}</TableCell>
							<TableCell>{item.totalAmount}</TableCell>
							<TableCell className="text-right">
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => setDeleteId(item.id)}
										>
											Delete
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>
												Confirm Deletion
											</AlertDialogTitle>
											<AlertDialogDescription>
												Are you sure you want to delete
												this item?
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogCancel>
											Cancel
										</AlertDialogCancel>
										<AlertDialogAction
											onClick={() => {
												handleDelete(item.id);
												setDeleteId(null);
											}}
											className="bg-red-600"
										>
											Delete
										</AlertDialogAction>
									</AlertDialogContent>
								</AlertDialog>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			<Card className="w-1/3 mt-8">
				<CardHeader>
					<CardTitle>Totals</CardTitle>
					<CardDescription>
						Review your billing totals
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="flex justify-between">
							<span>Total Price:</span>
							<span>{totalPrice}</span>
						</div>
						<div className="flex justify-between items-center">
							<Label htmlFor="discount">Discount %:</Label>
							<Input
								id="discount"
								type="number"
								value={discount}
								onChange={(e) =>
									setDiscount(parseFloat(e.target.value) || 0)
								}
								className="w-24"
							/>
						</div>
						<div className="flex justify-between">
							<span>Final Bill Amount:</span>
							<span>{finalBill}</span>
						</div>
						<div className="flex flex-col space-y-2">
							<div className="flex justify-between items-center">
								<Label htmlFor="paymentCash">
									Cash Payment:
								</Label>
								<Input
									id="paymentCash"
									type="number"
									value={paymentCash}
									onChange={(e) =>
										setPaymentCash(
											parseFloat(e.target.value) || 0
										)
									}
									className="w-24"
								/>
							</div>
							<div className="flex justify-between items-center">
								<Label htmlFor="paymentUPI">UPI Payment:</Label>
								<Input
									id="paymentUPI"
									type="number"
									value={paymentUPI}
									onChange={(e) =>
										setPaymentUPI(
											parseFloat(e.target.value) || 0
										)
									}
									className="w-24"
								/>
							</div>
							{remainingDue !== 0 && (
								<p className="text-red-600">
									Remaining due: {remainingDue}
								</p>
							)}
						</div>
					</div>
				</CardContent>
				<CardFooter>
					<Button onClick={handlePay}>Pay Now</Button>
				</CardFooter>
			</Card>
		</div>
	);
}

function AddItemForm({ onAdd }: { onAdd: (item: BillingItem) => void }) {
	const [form, setForm] = useState<Omit<BillingItem, "id">>({
		medicineName: "",
		phoneNumber: "",
		quantity: 1,
		unitPrice: 0,
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setForm((prev) => ({
			...prev,
			[name]:
				name === "quantity" || name === "unitPrice"
					? parseFloat(value)
					: value,
		}));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const newItem: BillingItem = {
			id: Date.now().toString(),
			...form,
		};
		onAdd(newItem);
		setForm({
			medicineName: "",
			phoneNumber: "",
			quantity: 1,
			unitPrice: 0,
		});
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="grid grid-cols-2 gap-4">
				<div>
					<Label htmlFor="medicineName">Medicine Name</Label>
					<Input
						id="medicineName"
						name="medicineName"
						value={form.medicineName}
						onChange={handleChange}
						required
					/>
				</div>
				<div>
					<Label htmlFor="phoneNumber">Phone Number</Label>
					<Input
						id="phoneNumber"
						name="phoneNumber"
						value={form.phoneNumber}
						onChange={handleChange}
						required
					/>
				</div>
				<div>
					<Label htmlFor="quantity">Quantity</Label>
					<Input
						id="quantity"
						name="quantity"
						type="number"
						value={form.quantity}
						onChange={handleChange}
						required
					/>
				</div>
				<div>
					<Label htmlFor="unitPrice">Unit Price</Label>
					<Input
						id="unitPrice"
						name="unitPrice"
						type="number"
						value={form.unitPrice}
						onChange={handleChange}
						required
					/>
				</div>
			</div>
			<DialogFooter>
				<Button type="submit">Add</Button>
			</DialogFooter>
		</form>
	);
}
