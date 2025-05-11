// file: ./src/components/billing/PaymentModal.tsx

import { useState, useEffect } from "react";
import { Smartphone, BadgeDollarSign, Check } from "lucide-react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface PaymentModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	finalAmount: number;
	onPaymentComplete: () => void;
}

export function PaymentModal({
	open,
	onOpenChange,
	finalAmount,
	onPaymentComplete,
}: PaymentModalProps) {
	const [paymentMethod, setPaymentMethod] = useState<
		"cash" | "upi" | "split"
	>("cash");
	const [cashAmount, setCashAmount] = useState<number>(finalAmount);
	const [upiAmount, setUpiAmount] = useState<number>(0);
	const [upiId, setUpiId] = useState<string>("");
	const [isProcessing, setIsProcessing] = useState<boolean>(false);
	const [changeAmount, setChangeAmount] = useState<number>(0);
	const [receivedCash, setReceivedCash] = useState<number>(finalAmount);

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
		if (receivedCash > cashAmount) {
			setChangeAmount(receivedCash - cashAmount);
		} else {
			setChangeAmount(0);
		}
	}, [receivedCash, cashAmount]);

	// Handle payment method change
	const handlePaymentMethodChange = (value: string) => {
		const method = value as "cash" | "upi" | "split";
		setPaymentMethod(method);

		if (method === "cash") {
			setCashAmount(finalAmount);
			setUpiAmount(0);
		} else if (method === "upi") {
			setCashAmount(0);
			setUpiAmount(finalAmount);
		} else {
			// Default split to 50/50
			setCashAmount(finalAmount / 2);
			setUpiAmount(finalAmount / 2);
		}
	};

	// Handle cash amount change when split payment
	const handleCashAmountChange = (value: number) => {
		const newCashAmount = Math.min(Math.max(0, value), finalAmount);
		setCashAmount(newCashAmount);
		setUpiAmount(finalAmount - newCashAmount);
	};

	// Handle UPI amount change when split payment
	const handleUpiAmountChange = (value: number) => {
		const newUpiAmount = Math.min(Math.max(0, value), finalAmount);
		setUpiAmount(newUpiAmount);
		setCashAmount(finalAmount - newUpiAmount);
	};

	// Process payment
	const handleProcessPayment = () => {
		if (paymentMethod === "upi" || paymentMethod === "split") {
			if (!upiId) {
				toast.error("Please enter a valid UPI ID");
				return;
			}

			if (upiAmount > 0 && !upiId.includes("@")) {
				toast.error("Please enter a valid UPI ID with '@' symbol");
				return;
			}
		}

		setIsProcessing(true);

		// Simulating payment processing
		setTimeout(() => {
			setIsProcessing(false);
			toast.success("Payment processed successfully");
			onPaymentComplete();
			onOpenChange(false);
		}, 1500);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md max-h-11/12 overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Payment</DialogTitle>
					<DialogDescription>
						Total amount to be paid: ₹{finalAmount.toFixed(2)}
					</DialogDescription>
				</DialogHeader>

				<RadioGroup
					defaultValue="cash"
					value={paymentMethod}
					onValueChange={handlePaymentMethodChange}
					className="grid grid-cols-3 gap-4 pt-4"
				>
					<Label
						htmlFor="cash"
						className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
					>
						<RadioGroupItem
							value="cash"
							id="cash"
							className="sr-only"
						/>
						<BadgeDollarSign className="mb-2 h-6 w-6" />
						<span className="text-center text-sm font-medium">
							Cash
						</span>
					</Label>
					<Label
						htmlFor="upi"
						className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
					>
						<RadioGroupItem
							value="upi"
							id="upi"
							className="sr-only"
						/>
						<Smartphone className="mb-2 h-6 w-6" />
						<span className="text-center text-sm font-medium">
							UPI
						</span>
					</Label>
					<Label
						htmlFor="split"
						className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
					>
						<RadioGroupItem
							value="split"
							id="split"
							className="sr-only"
						/>
						<div className="flex mb-2">
							<BadgeDollarSign className="h-6 w-6" />
							<span className="mx-1">+</span>
							<Smartphone className="h-6 w-6" />
						</div>
						<span className="text-center text-sm font-medium">
							Split
						</span>
					</Label>
				</RadioGroup>

				<Tabs defaultValue="payment-details" className="w-full">
					<TabsList className="grid grid-cols-1 w-full">
						<TabsTrigger value="payment-details">
							Payment Details
						</TabsTrigger>
					</TabsList>
					<TabsContent value="payment-details" className="mt-4">
						{(paymentMethod === "cash" ||
							paymentMethod === "split") && (
							<Card className="mb-4">
								<CardContent className="p-4 space-y-4">
									<div className="space-y-2">
										<Label htmlFor="cash-amount">
											Cash Amount (₹)
										</Label>
										<Input
											id="cash-amount"
											type="number"
											min="0"
											max={finalAmount}
											value={cashAmount}
											onChange={(e) =>
												paymentMethod === "split" &&
												handleCashAmountChange(
													parseFloat(
														e.target.value
													) || 0
												)
											}
											className="col-span-3"
											readOnly={paymentMethod === "cash"}
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="received-cash">
											Received Cash (₹)
										</Label>
										<Input
											id="received-cash"
											type="number"
											min={cashAmount}
											value={receivedCash}
											onChange={(e) =>
												setReceivedCash(
													parseFloat(
														e.target.value
													) || cashAmount
												)
											}
											className="col-span-3"
										/>
									</div>

									{changeAmount > 0 && (
										<div className="flex justify-between p-2 bg-green-50 rounded-md">
											<span>Change to return:</span>
											<span className="font-semibold">
												₹{changeAmount.toFixed(2)}
											</span>
										</div>
									)}
								</CardContent>
							</Card>
						)}

						{(paymentMethod === "upi" ||
							paymentMethod === "split") && (
							<Card>
								<CardContent className="p-4 space-y-4">
									{paymentMethod === "split" && (
										<div className="space-y-2">
											<Label htmlFor="upi-amount">
												UPI Amount (₹)
											</Label>
											<Input
												id="upi-amount"
												type="number"
												min="0"
												max={finalAmount}
												value={upiAmount}
												onChange={(e) =>
													handleUpiAmountChange(
														parseFloat(
															e.target.value
														) || 0
													)
												}
												className="col-span-3"
											/>
										</div>
									)}

									<div className="space-y-2">
										<Label htmlFor="upi-id">UPI ID</Label>
										<Input
											id="upi-id"
											type="text"
											placeholder="user@upi"
											value={upiId}
											onChange={(e) =>
												setUpiId(e.target.value)
											}
											className="col-span-3"
										/>
									</div>
								</CardContent>
							</Card>
						)}
					</TabsContent>
				</Tabs>

				<DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-4">
					<div className="flex flex-col w-full sm:w-auto">
						<div className="font-semibold flex justify-between sm:flex-col">
							<span className="text-muted-foreground">
								Total:
							</span>
							<span>₹{finalAmount.toFixed(2)}</span>
						</div>
					</div>
					<Button
						type="submit"
						onClick={handleProcessPayment}
						disabled={isProcessing}
						className="w-full sm:w-auto"
					>
						{isProcessing ? (
							"Processing..."
						) : (
							<>
								Process Payment{" "}
								<Check className="ml-2 h-4 w-4" />
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
