// file: ./src/components/payment/PaymentSummaryCards.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, DollarSign, CreditCard } from "lucide-react";
import { formatCurrency } from "@/utils/payment";

interface PaymentSummaryCardsProps {
	totalTransactions: number;
	totalAmount: number;
	totalCashAmount: number;
	totalUpiAmount: number;
}

export function PaymentSummaryCards({
	totalTransactions,
	totalAmount,
	totalCashAmount,
	totalUpiAmount,
}: PaymentSummaryCardsProps) {
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">
						Total Orders
					</CardTitle>
					<User className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">
						{totalTransactions}
					</div>
					<p className="text-xs text-muted-foreground">
						Unique orders with payments
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">
						Total Revenue
					</CardTitle>
					<DollarSign className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">
						{formatCurrency(totalAmount)}
					</div>
					<p className="text-xs text-muted-foreground">
						Total order value collected
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">
						Total Cash
					</CardTitle>
					<CreditCard className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">
						{formatCurrency(totalCashAmount)}
					</div>
					<p className="text-xs text-muted-foreground">
						Cash payments received
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">
						Total UPI
					</CardTitle>
					<CreditCard className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">
						{formatCurrency(totalUpiAmount)}
					</div>
					<p className="text-xs text-muted-foreground">
						UPI payments received
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
