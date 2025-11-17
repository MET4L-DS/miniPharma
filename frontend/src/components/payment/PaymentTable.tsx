// file: ./src/components/payment/PaymentTable.tsx

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { MergedPaymentData } from "@/types/payment";
import { formatCurrency, formatDate } from "@/utils/payment";

interface PaymentTableProps {
	payments: MergedPaymentData[];
	loading: boolean;
	loadingOrderDetails: boolean;
	onPreviewOrder: (payment: MergedPaymentData) => void;
}

export function PaymentTable({
	payments,
	loading,
	loadingOrderDetails,
	onPreviewOrder,
}: PaymentTableProps) {
	const getPaymentTypeBadge = (type: string) => {
		let variant: "default" | "secondary" | "destructive" | "outline" =
			"default";
		if (type === "Cash") {
			variant = "default";
		} else if (type === "UPI") {
			variant = "secondary";
		} else if (type === "Cash + UPI") {
			variant = "outline";
		}

		return <Badge variant={variant}>{type}</Badge>;
	};

	if (loading) {
		return <div className="text-center py-4">Loading payments...</div>;
	}

	if (payments.length === 0) {
		return <div className="text-center py-4">No payments found</div>;
	}

	return (
		<div className="overflow-x-auto">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="min-w-[100px]">
							Order ID
						</TableHead>
						<TableHead className="min-w-[150px]">
							Customer
						</TableHead>
						<TableHead className="min-w-[120px]">
							Payment Type
						</TableHead>
						<TableHead className="min-w-[120px]">
							Order Total
						</TableHead>
						<TableHead className="min-w-[120px]">
							Cash Amount
						</TableHead>
						<TableHead className="min-w-[120px]">
							UPI Amount
						</TableHead>
						<TableHead className="min-w-[150px]">Date</TableHead>
						<TableHead className="min-w-[100px]">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{payments.map((payment) => (
						<TableRow key={payment.order_id}>
							<TableCell className="font-medium">
								#{payment.order_id}
							</TableCell>
							<TableCell className="max-w-[200px] truncate">
								{payment.customer_name || "Unknown Customer"}
							</TableCell>
							<TableCell>
								{getPaymentTypeBadge(payment.payment_type)}
							</TableCell>
							<TableCell>
								{formatCurrency(payment.total_amount)}
							</TableCell>
							<TableCell>
								{payment.cash_amount > 0
									? formatCurrency(payment.cash_amount)
									: "-"}
							</TableCell>
							<TableCell>
								{payment.upi_amount > 0
									? formatCurrency(payment.upi_amount)
									: "-"}
							</TableCell>
							<TableCell className="text-sm">
								{formatDate(payment.order_date)}
							</TableCell>
							<TableCell>
								<Button
									variant="outline"
									size="sm"
									onClick={() => onPreviewOrder(payment)}
									disabled={loadingOrderDetails}
									className="flex items-center gap-2 whitespace-nowrap"
								>
									<Eye className="h-4 w-4" />
									{loadingOrderDetails
										? "Loading..."
										: "Preview"}
								</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
