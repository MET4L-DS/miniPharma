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
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiService } from "@/services/api";
import { toast } from "sonner";
import { CreditCard, User, DollarSign, Eye, Download } from "lucide-react";
import { InvoicePreview } from "@/components/invoice/InvoicePreview";
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";

interface PaymentData {
	order_id: number;
	payment_type: string;
	transaction_amount: number;
	customer_name: string;
	total_amount: number | null;
	order_date: string;
}

interface OrderItem {
	medicine_name: string;
	brand_name: string;
	quantity: number;
	unit_price: number;
	gst: number;
	amount: number;
}

interface MergedPaymentData {
	order_id: number;
	payment_type: string;
	customer_name: string;
	total_amount: number;
	order_date: string;
	cash_amount: number;
	upi_amount: number;
	items?: OrderItem[];
}

export default function PaymentPage() {
	const [payments, setPayments] = useState<MergedPaymentData[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedOrder, setSelectedOrder] =
		useState<MergedPaymentData | null>(null);
	const [isPreviewOpen, setIsPreviewOpen] = useState(false);
	const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);
	const printRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		fetchPayments();
	}, []);

	const fetchPayments = async () => {
		try {
			setLoading(true);
			const data: PaymentData[] = await apiService.makeRequest(
				"/payments/"
			);
			const mergedPayments = mergePaymentsByOrder(data);
			setPayments(mergedPayments);
		} catch (error) {
			console.error("Error fetching payments:", error);
			toast.error("Failed to fetch payments");
		} finally {
			setLoading(false);
		}
	};

	const fetchOrderItems = async (orderId: number): Promise<OrderItem[]> => {
		try {
			// Fetch order items for the specific order
			const orderItems = await apiService.makeRequest(
				`/orders/${orderId}/items/`
			);

			// Transform the API response to match our OrderItem interface
			return orderItems.map((item: any) => ({
				medicine_name:
					item.medicine_name ||
					item.generic_name ||
					"Unknown Medicine",
				brand_name: item.brand_name || "Unknown Brand",
				quantity: item.quantity || 0,
				unit_price: item.unit_price || 0,
				gst: item.gst || 0,
				amount: (item.quantity || 0) * (item.unit_price || 0),
			}));
		} catch (error) {
			console.error(
				`Error fetching order items for order ${orderId}:`,
				error
			);
			toast.error(`Failed to fetch order items for order #${orderId}`);
			return [];
		}
	};

	const mergePaymentsByOrder = (
		payments: PaymentData[]
	): MergedPaymentData[] => {
		const orderMap = new Map();

		payments.forEach((payment) => {
			const orderId = payment.order_id;
			if (orderMap.has(orderId)) {
				const existing = orderMap.get(orderId)!;
				if (payment.payment_type.toLowerCase() === "cash") {
					existing.cash_amount += payment.transaction_amount || 0;
				} else if (payment.payment_type.toLowerCase() === "upi") {
					existing.upi_amount += payment.transaction_amount || 0;
				}

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
					items: [], // Initialize empty, will be loaded when needed
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

	const handlePrint = useReactToPrint({
		contentRef: printRef, // Changed from content to contentRef
		documentTitle: `Invoice-${selectedOrder?.order_id}`,
		onAfterPrint: () => {
			toast.success("Invoice printed successfully!");
		},
	});

	const formatCurrency = (amount: number) => {
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

		return <Badge variant={variant}>{type}</Badge>;
	};

	const handlePreviewOrder = async (payment: MergedPaymentData) => {
		setLoadingOrderDetails(true);
		try {
			// Fetch order items if not already loaded
			if (!payment.items || payment.items.length === 0) {
				const orderItems = await fetchOrderItems(payment.order_id);
				payment.items = orderItems;
			}

			setSelectedOrder(payment);
			setIsPreviewOpen(true);
		} catch (error) {
			console.error("Error loading order details:", error);
			toast.error("Failed to load order details");
		} finally {
			setLoadingOrderDetails(false);
		}
	};

	// Calculate summary statistics
	const totalTransactions = payments.length;
	const totalAmount = payments.reduce((sum, payment) => {
		const amount = payment.total_amount;
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
			title="Payment Transactions"
			breadcrumbs={[{ label: "Payments" }]}
		>
			{/* Summary Cards */}
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
						<div className="text-center py-4">
							Loading payments...
						</div>
					) : payments.length === 0 ? (
						<div className="text-center py-4">
							No payments found
						</div>
					) : (
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
										<TableHead className="min-w-[150px]">
											Date
										</TableHead>
										<TableHead className="min-w-[100px]">
											Actions
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{payments.map((payment) => (
										<TableRow key={payment.order_id}>
											<TableCell className="font-medium">
												#{payment.order_id}
											</TableCell>
											<TableCell className="max-w-[200px] truncate">
												{payment.customer_name ||
													"Unknown Customer"}
											</TableCell>
											<TableCell>
												{getPaymentTypeBadge(
													payment.payment_type
												)}
											</TableCell>
											<TableCell>
												{formatCurrency(
													payment.total_amount
												)}
											</TableCell>
											<TableCell>
												{payment.cash_amount > 0
													? formatCurrency(
															payment.cash_amount
													  )
													: "-"}
											</TableCell>
											<TableCell>
												{payment.upi_amount > 0
													? formatCurrency(
															payment.upi_amount
													  )
													: "-"}
											</TableCell>
											<TableCell className="text-sm">
												{formatDate(payment.order_date)}
											</TableCell>
											<TableCell>
												<Button
													variant="outline"
													size="sm"
													onClick={() =>
														handlePreviewOrder(
															payment
														)
													}
													disabled={
														loadingOrderDetails
													}
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
					)}
				</CardContent>
			</Card>

			{/* Invoice Preview Dialog */}
			<Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
				<DialogContent className="w-full max-w-6xl h-[95vh] p-0 gap-0">
					<DialogHeader className="px-6 py-4 border-b bg-gray-50">
						<DialogTitle className="flex items-center justify-between p-4">
							<span className="text-lg font-semibold">
								Invoice Preview - Order #
								{selectedOrder?.order_id}
							</span>
							<Button
								onClick={handlePrint}
								className="flex items-center gap-2"
								disabled={!selectedOrder}
								size="sm"
							>
								<Download className="h-4 w-4" />
								Print PDF
							</Button>
						</DialogTitle>
					</DialogHeader>

					<div className="flex-1 overflow-y-auto">
						<div className="p-6">
							<div ref={printRef}>
								{selectedOrder && (
									<InvoicePreview orderData={selectedOrder} />
								)}
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</DashboardLayout>
	);
}
