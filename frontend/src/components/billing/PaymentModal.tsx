// file: ./src/components/billing/PaymentModal.tsx
import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { PaymentInfo } from "@/types/billing";
import { validateUpiId } from "@/utils/billing";

interface PaymentModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	finalAmount: number;
	onPaymentComplete: (paymentInfo: PaymentInfo) => Promise<void>;
	isProcessing?: boolean;
}

export function PaymentModal({
	open,
	onOpenChange,
	finalAmount,
	onPaymentComplete,
	isProcessing = false,
}: PaymentModalProps) {
	const [paymentMethod, setPaymentMethod] = useState<
		"cash" | "upi" | "split"
	>("cash");
	const [cashAmount, setCashAmount] = useState(finalAmount);
	const [upiAmount, setUpiAmount] = useState(0);
	const [upiId, setUpiId] = useState("");
	const [receivedCash, setReceivedCash] = useState(finalAmount);
	const [changeAmount, setChangeAmount] = useState(0);

	// Reset state when modal opens or amount changes
	useEffect(() => {
		setCashAmount(finalAmount);
		setUpiAmount(0);
		setUpiId("");
		setChangeAmount(0);
		setReceivedCash(finalAmount);
		setPaymentMethod("cash");
	}, [open, finalAmount]);

	// Calculate change amount for cash payment
	useEffect(() => {
		if (paymentMethod === "cash" && receivedCash > finalAmount) {
			setChangeAmount(receivedCash - finalAmount);
		} else if (paymentMethod === "split" && receivedCash > cashAmount) {
			setChangeAmount(receivedCash - cashAmount);
		} else {
			setChangeAmount(0);
		}
	}, [receivedCash, finalAmount, cashAmount, paymentMethod]);

	// Handle payment method change
	const handlePaymentMethodChange = (value: string) => {
		const method = value as "cash" | "upi" | "split";
		setPaymentMethod(method);
		if (method === "cash") {
			setCashAmount(finalAmount);
			setUpiAmount(0);
			setReceivedCash(finalAmount);
		} else if (method === "upi") {
			setCashAmount(0);
			setUpiAmount(finalAmount);
			setReceivedCash(0);
		} else {
			// Default split to 50/50
			setCashAmount(Math.round(finalAmount / 2));
			setUpiAmount(finalAmount - Math.round(finalAmount / 2));
			setReceivedCash(Math.round(finalAmount / 2));
		}
	};

	// Handle cash amount change when split payment
	const handleCashAmountChange = (value: number) => {
		const newCashAmount = Math.min(Math.max(0, value), finalAmount);
		setCashAmount(newCashAmount);
		setUpiAmount(finalAmount - newCashAmount);
		setReceivedCash(newCashAmount);
	};

	// Handle UPI amount change when split payment
	const handleUpiAmountChange = (value: number) => {
		const newUpiAmount = Math.min(Math.max(0, value), finalAmount);
		setUpiAmount(newUpiAmount);
		setCashAmount(finalAmount - newUpiAmount);
	};

	// Process payment
	const handleProcessPayment = async () => {
		if (paymentMethod === "upi" || paymentMethod === "split") {
			if (upiAmount > 0) {
				const upiValidation = validateUpiId(upiId);
				if (!upiValidation.isValid) {
					toast.error(upiValidation.message || "Invalid UPI ID");
					return;
				}
			}
		}

		if (paymentMethod === "cash" && receivedCash < finalAmount) {
			toast.error("Received cash amount is less than the bill amount");
			return;
		}

		if (paymentMethod === "split" && receivedCash < cashAmount) {
			toast.error("Received cash amount is less than the cash portion");
			return;
		}

		const paymentInfo: PaymentInfo = {
			method: paymentMethod,
			cashAmount,
			upiAmount,
			upiId: upiId || undefined,
			receivedCash: receivedCash || undefined,
			changeAmount: changeAmount || undefined,
		};

		try {
			await onPaymentComplete(paymentInfo);
		} catch (error) {
			console.error("Payment processing failed:", error);
			toast.error("Payment processing failed. Please try again.");
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Payment</DialogTitle>
					<DialogDescription>
						Total amount to be paid: ₹{finalAmount.toFixed(2)}
					</DialogDescription>
				</DialogHeader>

				<Tabs
					value={paymentMethod}
					onValueChange={handlePaymentMethodChange}
				>
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="cash">Cash</TabsTrigger>
						<TabsTrigger value="upi">UPI</TabsTrigger>
						<TabsTrigger value="split">Split</TabsTrigger>
					</TabsList>

					<TabsContent value="cash" className="space-y-4">
						<Card>
							<CardContent className="pt-6 space-y-4">
								<div className="space-y-2">
									<Label htmlFor="received-cash">
										Received Cash (₹)
									</Label>
									<Input
										id="received-cash"
										type="number"
										step="0.01"
										value={receivedCash}
										onChange={(e) =>
											setReceivedCash(
												parseFloat(e.target.value) || 0
											)
										}
									/>
								</div>
								{changeAmount > 0 && (
									<div className="p-3 bg-green-50 rounded-md">
										<div className="text-sm font-medium text-green-800">
											Change to return: ₹
											{changeAmount.toFixed(2)}
										</div>
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="upi" className="space-y-4">
						<Card>
							<CardContent className="pt-6 space-y-4">
								<div className="space-y-2">
									<Label htmlFor="upi-id">UPI ID</Label>
									<Input
										id="upi-id"
										placeholder="customer@paytm"
										value={upiId}
										onChange={(e) =>
											setUpiId(e.target.value)
										}
									/>
								</div>
								<div className="p-3 bg-blue-50 rounded-md">
									<div className="text-sm text-blue-800">
										Amount: ₹{finalAmount.toFixed(2)}
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="split" className="space-y-4">
						<Card>
							<CardContent className="pt-6 space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="cash-amount">
											Cash Amount (₹)
										</Label>
										<Input
											id="cash-amount"
											type="number"
											step="0.01"
											value={cashAmount}
											onChange={(e) =>
												handleCashAmountChange(
													parseFloat(
														e.target.value
													) || 0
												)
											}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="upi-amount">
											UPI Amount (₹)
										</Label>
										<Input
											id="upi-amount"
											type="number"
											step="0.01"
											value={upiAmount}
											onChange={(e) =>
												handleUpiAmountChange(
													parseFloat(
														e.target.value
													) || 0
												)
											}
										/>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="received-cash-split">
										Received Cash (₹)
									</Label>
									<Input
										id="received-cash-split"
										type="number"
										step="0.01"
										value={receivedCash}
										onChange={(e) =>
											setReceivedCash(
												parseFloat(e.target.value) || 0
											)
										}
									/>
								</div>

								{upiAmount > 0 && (
									<div className="space-y-2">
										<Label htmlFor="upi-id-split">
											UPI ID
										</Label>
										<Input
											id="upi-id-split"
											placeholder="customer@paytm"
											value={upiId}
											onChange={(e) =>
												setUpiId(e.target.value)
											}
										/>
									</div>
								)}

								{changeAmount > 0 && (
									<div className="p-3 bg-green-50 rounded-md">
										<div className="text-sm font-medium text-green-800">
											Change to return: ₹
											{changeAmount.toFixed(2)}
										</div>
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isProcessing}
					>
						Cancel
					</Button>
					<Button
						onClick={handleProcessPayment}
						disabled={isProcessing}
					>
						{isProcessing ? (
							"Processing..."
						) : (
							<>
								<Check className="mr-2 h-4 w-4" />
								Process Payment
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
