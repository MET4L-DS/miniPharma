// file: ./src/pages/PaymentPage.tsx
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiService } from "@/services/api";
import { toast } from "sonner";
import { CreditCard, Calendar, User, DollarSign } from "lucide-react";

interface PaymentData {
	order_id: number;
	payment_type: string;
	transaction_amount: number;
	customer_name: string;
	total_amount: number | null;
	order_date: string;
}

interface MergedPaymentData {
	order_id: number;
	payment_type: string;
	customer_name: string;
	total_amount: number;
	order_date: string;
	cash_amount: number;
	upi_amount: number;
}

export default function PaymentPage() {
	const [payments, setPayments] = useState<MergedPaymentData[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchPayments();
	}, []);

	const fetchPayments = async () => {
		try {
			setLoading(true);
			const data: PaymentData[] = await apiService.makeRequest(
				"/payments/"
			);

			// Merge payments by order_id
			const mergedPayments = mergePaymentsByOrder(data);
			setPayments(mergedPayments);
		} catch (error) {
			console.error("Error fetching payments:", error);
			toast.error("Failed to fetch payments");
		} finally {
			setLoading(false);
		}
	};

	const mergePaymentsByOrder = (
		payments: PaymentData[]
	): MergedPaymentData[] => {
		const orderMap = new Map<number, MergedPaymentData>();

		payments.forEach((payment) => {
			const orderId = payment.order_id;

			if (orderMap.has(orderId)) {
				const existing = orderMap.get(orderId)!;

				// Track cash and UPI amounts separately
				if (payment.payment_type.toLowerCase() === "cash") {
					existing.cash_amount += payment.transaction_amount || 0;
				} else if (payment.payment_type.toLowerCase() === "upi") {
					existing.upi_amount += payment.transaction_amount || 0;
				}

				// Update payment type to show combination
				const hasCash = existing.cash_amount > 0;
				const hasUpi = existing.upi_amount > 0;

				if (hasCash && hasUpi) {
					existing.payment_type = "Cash + UPI";
				} else if (hasCash) {
					existing.payment_type = "Cash";
				} else if (hasUpi) {
					existing.payment_type = "UPI";
				}

				orderMap.set(orderId, existing);
			} else {
				// First payment for this order
				const totalAmount = payment.total_amount || 0;
				const transactionAmount = payment.transaction_amount || 0;

				const mergedPayment: MergedPaymentData = {
					order_id: payment.order_id,
					payment_type: payment.payment_type,
					customer_name: payment.customer_name || "Unknown Customer",
					total_amount: totalAmount,
					order_date: payment.order_date,
					cash_amount:
						payment.payment_type.toLowerCase() === "cash"
							? transactionAmount
							: 0,
					upi_amount:
						payment.payment_type.toLowerCase() === "upi"
							? transactionAmount
							: 0,
				};
				orderMap.set(orderId, mergedPayment);
			}
		});

		return Array.from(orderMap.values()).sort(
			(a, b) =>
				new Date(b.order_date).getTime() -
				new Date(a.order_date).getTime()
		);
	};

	const formatCurrency = (amount: number) => {
		// Ensure amount is a valid number
		const validAmount =
			isNaN(amount) || amount === null || amount === undefined
				? 0
				: amount;
		return new Intl.NumberFormat("en-IN", {
			style: "currency",
			currency: "INR",
		}).format(validAmount);
	};

	const formatDate = (dateString: string) => {
		if (!dateString) return "Invalid Date";
		try {
			return new Date(dateString).toLocaleDateString("en-IN", {
				year: "numeric",
				month: "short",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			});
		} catch (error) {
			return "Invalid Date";
		}
	};

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

		return (
			<Badge variant={variant} className="capitalize">
				{type}
			</Badge>
		);
	};

	// Calculate summary statistics with proper null/undefined handling
	const totalTransactions = payments.length;

	const totalAmount = payments.reduce((sum, payment) => {
		const amount = payment.total_amount;
		// Only add if amount is a valid number
		if (typeof amount === "number" && !isNaN(amount)) {
			return sum + amount;
		}
		return sum;
	}, 0);

	const totalCashAmount = payments.reduce((sum, payment) => {
		const amount = payment.cash_amount;
		if (typeof amount === "number" && !isNaN(amount)) {
			return sum + amount;
		}
		return sum;
	}, 0);

	const totalUpiAmount = payments.reduce((sum, payment) => {
		const amount = payment.upi_amount;
		if (typeof amount === "number" && !isNaN(amount)) {
			return sum + amount;
		}
		return sum;
	}, 0);

	return (
		<DashboardLayout
			title="Payments"
			breadcrumbs={[
				{ label: "Dashboard", href: "/dashboard" },
				{ label: "Payments" },
			]}
		>
			<div className="space-y-6">
				{/* Summary Cards */}
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Total Orders
							</CardTitle>
							<CreditCard className="h-4 w-4 text-muted-foreground" />
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

				{/* Payment Table */}
				<Card>
					<CardHeader>
						<CardTitle>Payment Transactions</CardTitle>
						<CardDescription>
							View all payment transactions grouped by order with
							combined payment methods
						</CardDescription>
					</CardHeader>
					<CardContent>
						{loading ? (
							<div className="flex items-center justify-center h-32">
								<div className="text-muted-foreground">
									Loading payments...
								</div>
							</div>
						) : payments.length === 0 ? (
							<div className="flex items-center justify-center h-32">
								<div className="text-muted-foreground">
									No payments found
								</div>
							</div>
						) : (
							<div className="rounded-md border">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="w-[100px]">
												Order ID
											</TableHead>
											<TableHead>Customer</TableHead>
											<TableHead>Payment Type</TableHead>
											<TableHead className="text-right">
												Order Total
											</TableHead>
											<TableHead className="text-right">
												Cash Amount
											</TableHead>
											<TableHead className="text-right">
												UPI Amount
											</TableHead>
											<TableHead>Date</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{payments.map((payment) => (
											<TableRow key={payment.order_id}>
												<TableCell className="font-medium">
													#{payment.order_id}
												</TableCell>
												<TableCell>
													<div className="flex items-center space-x-2">
														<User className="h-4 w-4 text-muted-foreground" />
														<span>
															{payment.customer_name ||
																"Unknown Customer"}
														</span>
													</div>
												</TableCell>
												<TableCell>
													{getPaymentTypeBadge(
														payment.payment_type
													)}
												</TableCell>
												<TableCell className="text-right font-medium">
													{formatCurrency(
														payment.total_amount
													)}
												</TableCell>
												<TableCell className="text-right">
													{payment.cash_amount > 0
														? formatCurrency(
																payment.cash_amount
														  )
														: "-"}
												</TableCell>
												<TableCell className="text-right">
													{payment.upi_amount > 0
														? formatCurrency(
																payment.upi_amount
														  )
														: "-"}
												</TableCell>
												<TableCell>
													<div className="flex items-center space-x-2">
														<Calendar className="h-4 w-4 text-muted-foreground" />
														<span className="text-sm">
															{formatDate(
																payment.order_date
															)}
														</span>
													</div>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</DashboardLayout>
	);
}
