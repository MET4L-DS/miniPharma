// file: ./src/components/invoice/InvoicePreview.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface OrderData {
	order_id: number;
	customer_name: string;
	total_amount: number;
	order_date: string;
	payment_type: string;
	cash_amount: number;
	upi_amount: number;
}

interface InvoicePreviewProps {
	orderData: OrderData;
}

export function InvoicePreview({ orderData }: InvoicePreviewProps) {
	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-IN", {
			style: "currency",
			currency: "INR",
		}).format(amount);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-IN", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	return (
		<div className="max-w-4xl mx-auto p-8 bg-white print:p-0">
			{/* Header */}
			<div className="text-center mb-8">
				<h1 className="text-3xl font-bold text-gray-800 mb-2">
					PHARMACY INVOICE
				</h1>
				<p className="text-gray-600">
					Professional Pharmacy Management System
				</p>
			</div>

			{/* Invoice Details */}
			<div className="grid grid-cols-2 gap-8 mb-8">
				<div>
					<h3 className="text-lg font-semibold mb-4">
						Invoice Details
					</h3>
					<div className="space-y-2">
						<p>
							<span className="font-medium">Invoice #:</span> INV-
							{orderData.order_id}
						</p>
						<p>
							<span className="font-medium">Order ID:</span> #
							{orderData.order_id}
						</p>
						<p>
							<span className="font-medium">Date:</span>{" "}
							{formatDate(orderData.order_date)}
						</p>
					</div>
				</div>

				<div>
					<h3 className="text-lg font-semibold mb-4">
						Customer Information
					</h3>
					<div className="space-y-2">
						<p>
							<span className="font-medium">Name:</span>{" "}
							{orderData.customer_name}
						</p>
						<p>
							<span className="font-medium">Customer ID:</span>{" "}
							CUST-{orderData.order_id}
						</p>
					</div>
				</div>
			</div>

			<Separator className="my-6" />

			{/* Payment Information */}
			<div className="mb-8">
				<h3 className="text-lg font-semibold mb-4">
					Payment Information
				</h3>
				<div className="bg-gray-50 p-4 rounded-lg">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<p className="text-sm text-gray-600">
								Payment Method
							</p>
							<p className="font-medium">
								{orderData.payment_type}
							</p>
						</div>
						{orderData.cash_amount > 0 && (
							<div>
								<p className="text-sm text-gray-600">
									Cash Amount
								</p>
								<p className="font-medium">
									{formatCurrency(orderData.cash_amount)}
								</p>
							</div>
						)}
						{orderData.upi_amount > 0 && (
							<div>
								<p className="text-sm text-gray-600">
									UPI Amount
								</p>
								<p className="font-medium">
									{formatCurrency(orderData.upi_amount)}
								</p>
							</div>
						)}
					</div>
				</div>
			</div>

			<Separator className="my-6" />

			{/* Total Section */}
			<div className="flex justify-end mb-8">
				<div className="w-64">
					<div className="bg-gray-800 text-white p-4 rounded-lg">
						<div className="flex justify-between items-center">
							<span className="text-lg font-semibold">
								Total Amount:
							</span>
							<span className="text-xl font-bold">
								{formatCurrency(orderData.total_amount)}
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Footer */}
			<div className="text-center text-gray-600 text-sm mt-12 pt-8 border-t">
				<p>Thank you for your business!</p>
				<p className="mt-2">
					This is a computer-generated invoice and does not require a
					signature.
				</p>
				<p className="mt-4">
					Pharmacy Management System - Generated on{" "}
					{new Date().toLocaleDateString("en-IN")}
				</p>
			</div>
		</div>
	);
}
