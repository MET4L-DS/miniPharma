// file: ./src/pages/BillingPage.tsx

import { useState, useMemo } from "react";
import { toast } from "sonner";

import { AddItemCard } from "@/components/billing/AddItemCard";
import { BillSummaryCard } from "@/components/billing/BillSummaryCard";
import { BillItemsTable } from "@/components/billing/BillItemsTable";
import { PaymentModal } from "@/components/billing/PaymentModal";

// Define the BillItem interface
interface BillItem {
	id: string;
	medicineName: string;
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
			quantity: 2,
			unitPrice: 10.0,
			amount: 20.0,
		},
	]);

	const [discountPercentage, setDiscountPercentage] = useState(0);
	const [phoneNumber, setPhoneNumber] = useState("");
	const [newItem, setNewItem] = useState<{
		medicineName: string;
		quantity: number;
	}>({
		medicineName: "",
		quantity: 1,
	});

	// Payment modal state
	const [paymentModalOpen, setPaymentModalOpen] = useState(false);
	const [billGenerated, setBillGenerated] = useState(false);

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
		if (!newItem.medicineName || newItem.quantity <= 0) {
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
			quantity: newItem.quantity,
			unitPrice: unitPrice,
			amount: amount,
		};

		setBillItems([...billItems, newBillItem]);
		setNewItem({
			medicineName: "",
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

		if (!phoneNumber.trim()) {
			toast.error("Please enter customer phone number");
			return;
		}

		setBillGenerated(true);
		setPaymentModalOpen(true);
	};

	// Handle payment completion
	const handlePaymentComplete = () => {
		toast.success("Payment completed and bill finalized");
		// In a real app, this would save the transaction to a database

		// Reset the bill for a new transaction
		setBillItems([]);
		setDiscountPercentage(0);
		setPhoneNumber("");
		setBillGenerated(false);
	};

	return (
		<div className="px-4 md:px-16 py-8">
			<h1 className="text-2xl font-bold mb-6">Billing</h1>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
				<AddItemCard
					newItem={newItem}
					setNewItem={setNewItem}
					handleAddItem={handleAddItem}
					sampleMedicines={sampleMedicines}
				/>

				<BillSummaryCard
					discountPercentage={discountPercentage}
					setDiscountPercentage={setDiscountPercentage}
					totalAmount={totalAmount}
					discountAmount={discountAmount}
					finalAmount={finalAmount}
					phoneNumber={phoneNumber}
					setPhoneNumber={setPhoneNumber}
					handleGenerateBill={handleGenerateBill}
				/>
			</div>

			<BillItemsTable
				billItems={billItems}
				handleRemoveItem={handleRemoveItem}
				totalAmount={totalAmount}
				discountPercentage={discountPercentage}
				discountAmount={discountAmount}
				finalAmount={finalAmount}
			/>

			<PaymentModal
				open={paymentModalOpen}
				onOpenChange={setPaymentModalOpen}
				finalAmount={finalAmount}
				onPaymentComplete={handlePaymentComplete}
			/>
		</div>
	);
}
