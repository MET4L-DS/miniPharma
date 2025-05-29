// file: ./src/components/billing/BillSummaryCard.tsx
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Receipt, User, Phone, UserCheck } from "lucide-react";
import { CustomerInfo, OrderSummary } from "@/types/billing";

interface BillSummaryCardProps {
	customerInfo: CustomerInfo;
	setCustomerInfo: (info: CustomerInfo) => void;
	discountPercentage: number;
	setDiscountPercentage: (value: number) => void;
	orderSummary: OrderSummary;
	onGenerateBill: () => void;
}

export function BillSummaryCard({
	customerInfo,
	setCustomerInfo,
	discountPercentage,
	setDiscountPercentage,
	orderSummary,
	onGenerateBill,
}: BillSummaryCardProps) {
	return (
		<Card className="sticky top-4">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Receipt className="h-5 w-5" />
					Bill Summary
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<Label
						htmlFor="customer-name"
						className="flex items-center gap-2"
					>
						<User className="h-4 w-4" />
						Customer Name
					</Label>
					<Input
						id="customer-name"
						placeholder="Enter customer name (optional)"
						value={customerInfo.name}
						onChange={(e) =>
							setCustomerInfo({
								...customerInfo,
								name: e.target.value,
							})
						}
					/>
				</div>

				<div className="space-y-2">
					<Label
						htmlFor="phone-number"
						className="flex items-center gap-2"
					>
						<Phone className="h-4 w-4" />
						Phone Number*
					</Label>
					<Input
						id="phone-number"
						placeholder="Enter 10-digit phone number"
						value={customerInfo.phoneNumber}
						onChange={(e) => {
							const value = e.target.value
								.replace(/\D/g, "")
								.slice(0, 10);
							setCustomerInfo({
								...customerInfo,
								phoneNumber: value,
							});
						}}
						maxLength={10}
						required
					/>
				</div>

				<div className="space-y-2">
					<Label
						htmlFor="doctor-name"
						className="flex items-center gap-2"
					>
						<UserCheck className="h-4 w-4" />
						Doctor Name
					</Label>
					<Input
						id="doctor-name"
						placeholder="Enter doctor name (optional)"
						value={customerInfo.doctorName}
						onChange={(e) =>
							setCustomerInfo({
								...customerInfo,
								doctorName: e.target.value,
							})
						}
					/>
				</div>

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
									Math.max(0, parseInt(e.target.value) || 0)
								)
							)
						}
					/>
				</div>

				<div className="space-y-2 pt-4 border-t">
					<div className="flex justify-between text-sm">
						<span>Subtotal:</span>
						<span>
							₹
							{(
								orderSummary.totalAmount -
								orderSummary.gstAmount
							).toFixed(2)}
						</span>
					</div>
					<div className="flex justify-between text-sm">
						<span>GST:</span>
						<span>₹{orderSummary.gstAmount.toFixed(2)}</span>
					</div>
					<div className="flex justify-between text-sm">
						<span>Total:</span>
						<span>₹{orderSummary.totalAmount.toFixed(2)}</span>
					</div>
					{discountPercentage > 0 && (
						<div className="flex justify-between text-sm text-red-600">
							<span>Discount ({discountPercentage}%):</span>
							<span>
								-₹{orderSummary.discountAmount.toFixed(2)}
							</span>
						</div>
					)}
					<div className="flex justify-between font-bold text-lg border-t pt-2">
						<span>Final Amount:</span>
						<span>₹{orderSummary.finalAmount.toFixed(2)}</span>
					</div>
				</div>
			</CardContent>
			<CardFooter>
				<Button
					onClick={onGenerateBill}
					className="w-full"
					disabled={
						!customerInfo.phoneNumber ||
						customerInfo.phoneNumber.length !== 10
					}
				>
					<Receipt className="mr-2 h-4 w-4" />
					Generate Bill
				</Button>
			</CardFooter>
		</Card>
	);
}
