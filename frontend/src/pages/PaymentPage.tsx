import { useEffect, useState, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
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
import { Button } from "@/components/ui/button";
import { apiService } from "@/services/api";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { InvoicePreview } from "@/components/invoice/InvoicePreview";
import { useReactToPrint } from "react-to-print";
import { MergedPaymentData } from "@/types/payment";
import { OrderItemDetails } from "@/types/api";
import { PaymentSummaryCards, PaymentTable } from "@/components/payment";
import { mergePaymentsByOrder, calculatePaymentStats } from "@/utils/payment";

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
			const data = await apiService.getPayments();
			const mergedPayments = mergePaymentsByOrder(data);
			setPayments(mergedPayments);
		} catch (error) {
			console.error("Error fetching payments:", error);
			toast.error("Failed to fetch payments");
		} finally {
			setLoading(false);
		}
	};

	const fetchOrderItems = async (
		orderId: number
	): Promise<OrderItemDetails[]> => {
		try {
			// Fetch order items for the specific order
			const orderItems = await apiService.getOrderItems(orderId);

			// Transform the API response to match our OrderItemDetails interface
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
				batch_number: item.batch_number || "",
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
	const handlePrint = useReactToPrint({
		contentRef: printRef,
		documentTitle: `Invoice-${selectedOrder?.order_id}`,
		onAfterPrint: () => {
			toast.success("Invoice printed successfully!");
		},
	});

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
	const { totalTransactions, totalAmount, totalCashAmount, totalUpiAmount } =
		calculatePaymentStats(payments);

	return (
		<DashboardLayout
			title="Payment Transactions"
			breadcrumbs={[{ label: "Payments" }]}
		>
			<PaymentSummaryCards
				totalTransactions={totalTransactions}
				totalAmount={totalAmount}
				totalCashAmount={totalCashAmount}
				totalUpiAmount={totalUpiAmount}
			/>

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
					<PaymentTable
						payments={payments}
						loading={loading}
						loadingOrderDetails={loadingOrderDetails}
						onPreviewOrder={handlePreviewOrder}
					/>
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
