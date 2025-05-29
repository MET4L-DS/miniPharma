// file: ./src/pages/BillingPage.tsx
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { AddItemCard } from "@/components/billing/AddItemCard";
import { BillSummaryCard } from "@/components/billing/BillSummaryCard";
import { BillItemsTable } from "@/components/billing/BillItemsTable";
import { PaymentModal } from "@/components/billing/PaymentModal";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
	BillItem,
	CustomerInfo,
	PaymentInfo,
	OrderSummary,
} from "@/types/billing";
import { apiService } from "@/services/api";

export default function BillingPage() {
	const [billItems, setBillItems] = useState<BillItem[]>([]);
	const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
		name: "",
		phoneNumber: "",
		doctorName: "",
	});
	const [discountPercentage, setDiscountPercentage] = useState(0);
	const [paymentModalOpen, setPaymentModalOpen] = useState(false);
	const [isProcessingPayment, setIsProcessingPayment] = useState(false);

	// Calculate amounts including GST
	const orderSummary: OrderSummary = useMemo(() => {
		const subtotal = billItems.reduce((sum, item) => {
			const itemSubtotal =
				(item.unitPrice * item.quantity) / (1 + item.gst / 100);
			return sum + itemSubtotal;
		}, 0);

		const gstAmount = billItems.reduce((sum, item) => {
			const itemSubtotal =
				(item.unitPrice * item.quantity) / (1 + item.gst / 100);
			const itemGst = itemSubtotal * (item.gst / 100);
			return sum + itemGst;
		}, 0);

		const totalAmount = subtotal + gstAmount;
		const discountAmount = (totalAmount * discountPercentage) / 100;
		const finalAmount = totalAmount - discountAmount;

		return {
			totalAmount,
			discountPercentage,
			discountAmount,
			finalAmount,
			gstAmount,
		};
	}, [billItems, discountPercentage]);

	const handleAddItem = (item: BillItem) => {
		// Check if item already exists
		const existingItemIndex = billItems.findIndex(
			(existingItem) =>
				existingItem.product_id === item.product_id &&
				existingItem.batch_id === item.batch_id
		);

		if (existingItemIndex >= 0) {
			// Update existing item quantity
			const updatedItems = [...billItems];
			const existingItem = updatedItems[existingItemIndex];
			const newQuantity = existingItem.quantity + item.quantity;

			if (newQuantity > item.availableStock) {
				toast.error(
					`Cannot add more. Only ${item.availableStock} units available.`
				);
				return;
			}

			updatedItems[existingItemIndex] = {
				...existingItem,
				quantity: newQuantity,
				amount: existingItem.unitPrice * newQuantity,
			};
			setBillItems(updatedItems);
		} else {
			// Add new item
			setBillItems([...billItems, item]);
		}
	};

	const handleRemoveItem = (id: string) => {
		setBillItems(billItems.filter((item) => item.id !== id));
		toast.success("Item removed from bill");
	};

	const handleGenerateBill = () => {
		if (billItems.length === 0) {
			toast.error("Cannot generate bill with no items");
			return;
		}

		if (!customerInfo.phoneNumber.trim()) {
			toast.error("Please enter customer phone number");
			return;
		}

		if (customerInfo.phoneNumber.length !== 10) {
			toast.error("Please enter a valid 10-digit phone number");
			return;
		}

		setPaymentModalOpen(true);
	};

	const handlePaymentComplete = async (paymentInfo: PaymentInfo) => {
		setIsProcessingPayment(true);

		try {
			// Prepare order data
			const orderData = {
				customer_name: customerInfo.name || "Walk-in Customer",
				customer_number: customerInfo.phoneNumber,
				doctor_name: customerInfo.doctorName || "",
				total_amount: orderSummary.finalAmount,
				discount_percentage: discountPercentage,
			};

			// Prepare order items
			// In handlePaymentComplete function
			const orderItems = billItems.map((item) => ({
				product_id: item.product_id,
				batch_id: item.batch_id, // Changed from batch_number
				quantity: item.quantity,
				unit_price: item.unitPrice,
			}));

			// Prepare payments
			const payments = [];
			if (paymentInfo.method === "cash") {
				payments.push({
					payment_type: "cash" as const,
					transaction_amount: orderSummary.finalAmount,
				});
			} else if (paymentInfo.method === "upi") {
				payments.push({
					payment_type: "upi" as const,
					transaction_amount: orderSummary.finalAmount,
				});
			} else if (paymentInfo.method === "split") {
				if (paymentInfo.cashAmount > 0) {
					payments.push({
						payment_type: "cash" as const,
						transaction_amount: paymentInfo.cashAmount,
					});
				}
				if (paymentInfo.upiAmount > 0) {
					payments.push({
						payment_type: "upi" as const,
						transaction_amount: paymentInfo.upiAmount,
					});
				}
			}

			// Process complete order
			const result = await apiService.processCompleteOrder(
				orderData,
				orderItems,
				payments
			);

			if (result.success) {
				toast.success(
					`Bill generated successfully! Order ID: ${result.order_id}`
				);

				// Reset form
				setBillItems([]);
				setCustomerInfo({ name: "", phoneNumber: "", doctorName: "" });
				setDiscountPercentage(0);
				setPaymentModalOpen(false);
			} else {
				toast.error(result.error || "Failed to process order");
			}
		} catch (error) {
			console.error("Payment processing failed:", error);
			toast.error("Failed to process payment. Please try again.");
		} finally {
			setIsProcessingPayment(false);
		}
	};

	return (
		<DashboardLayout title="Billing" breadcrumbs={[{ label: "Billing" }]}>
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						Billing
					</h1>
					<p className="text-muted-foreground">
						Create and manage customer bills
					</p>
				</div>

				<div className="grid gap-6 lg:grid-cols-3">
					<div className="lg:col-span-2 space-y-6">
						<AddItemCard onAddItem={handleAddItem} />

						<BillItemsTable
							billItems={billItems}
							handleRemoveItem={handleRemoveItem}
							totalAmount={orderSummary.totalAmount}
							discountPercentage={discountPercentage}
							discountAmount={orderSummary.discountAmount}
							gstAmount={orderSummary.gstAmount}
							finalAmount={orderSummary.finalAmount}
						/>
					</div>

					<div>
						<BillSummaryCard
							customerInfo={customerInfo}
							setCustomerInfo={setCustomerInfo}
							discountPercentage={discountPercentage}
							setDiscountPercentage={setDiscountPercentage}
							orderSummary={orderSummary}
							onGenerateBill={handleGenerateBill}
						/>
					</div>
				</div>

				<PaymentModal
					open={paymentModalOpen}
					onOpenChange={setPaymentModalOpen}
					finalAmount={orderSummary.finalAmount}
					onPaymentComplete={handlePaymentComplete}
					isProcessing={isProcessingPayment}
				/>
			</div>
		</DashboardLayout>
	);
}
