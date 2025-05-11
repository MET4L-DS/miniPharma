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
import { Receipt, CreditCard } from "lucide-react";

interface BillSummaryCardProps {
	discountPercentage: number;
	setDiscountPercentage: (value: number) => void;
	totalAmount: number;
	discountAmount: number;
	finalAmount: number;
	handleGenerateBill: () => void;
}

export function BillSummaryCard({
	discountPercentage,
	setDiscountPercentage,
	totalAmount,
	discountAmount,
	finalAmount,
	handleGenerateBill,
}: BillSummaryCardProps) {
	return (
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
									Math.max(0, parseInt(e.target.value) || 0)
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
			<CardFooter className="flex flex-col sm:flex-row gap-2">
				<Button
					onClick={handleGenerateBill}
					className="w-full"
					variant="default"
				>
					<Receipt className="mr-2 h-4 w-4" /> Generate Bill
				</Button>
			</CardFooter>
		</Card>
	);
}
