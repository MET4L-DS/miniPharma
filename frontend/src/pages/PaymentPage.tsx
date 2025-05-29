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
	total_amount: number;
	order_date: string;
}

export default function PaymentPage() {
	const [payments, setPayments] = useState<PaymentData[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchPayments();
	}, []);

	const fetchPayments = async () => {
		try {
			setLoading(true);
			const data = await apiService.makeRequest("/payments/");
			setPayments(data);
		} catch (error) {
			console.error("Error fetching payments:", error);
			toast.error("Failed to fetch payments");
		} finally {
			setLoading(false);
		}
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-IN", {
			style: "currency",
			currency: "INR",
		}).format(amount);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-IN", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getPaymentTypeBadge = (type: string) => {
		const variant = type.toLowerCase() === "cash" ? "default" : "secondary";
		return (
			<Badge variant={variant} className="capitalize">
				{type}
			</Badge>
		);
	};

	// Calculate summary statistics
	const totalTransactions = payments.length;
	const totalAmount = payments.reduce(
		(sum, payment) => sum + payment.transaction_amount,
		0
	);
	const cashTransactions = payments.filter(
		(p) => p.payment_type.toLowerCase() === "cash"
	).length;
	const upiTransactions = payments.filter(
		(p) => p.payment_type.toLowerCase() === "upi"
	).length;

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
								Total Transactions
							</CardTitle>
							<CreditCard className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{totalTransactions}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Total Amount
							</CardTitle>
							<DollarSign className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{formatCurrency(totalAmount)}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Cash Payments
							</CardTitle>
							<CreditCard className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{cashTransactions}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								UPI Payments
							</CardTitle>
							<CreditCard className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{upiTransactions}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Payment Table */}
				<Card>
					<CardHeader>
						<CardTitle>Payment Transactions</CardTitle>
						<CardDescription>
							View all payment transactions with order details
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
												Transaction Amount
											</TableHead>
											<TableHead className="text-right">
												Order Total
											</TableHead>
											<TableHead>Date</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{payments.map((payment, index) => (
											<TableRow
												key={`${payment.order_id}-${index}`}
											>
												<TableCell className="font-medium">
													#{payment.order_id}
												</TableCell>
												<TableCell>
													<div className="flex items-center space-x-2">
														<User className="h-4 w-4 text-muted-foreground" />
														<span>
															{
																payment.customer_name
															}
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
														payment.transaction_amount
													)}
												</TableCell>
												<TableCell className="text-right">
													{formatCurrency(
														payment.total_amount
													)}
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
