// file: ./src/components/invoice/InvoicePreview.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface OrderItem {
	medicine_name: string;
	brand_name: string;
	quantity: number;
	unit_price: number;
	gst: number;
	amount: number;
}

interface OrderData {
	order_id: number;
	customer_name: string;
	total_amount: number;
	order_date: string;
	payment_type: string;
	cash_amount: number;
	upi_amount: number;
	items?: OrderItem[];
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

			{/* Medicine Items */}
			<div className="mb-8">
				<h3 className="text-lg font-semibold mb-4">Purchased Items</h3>
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-4 py-2 text-left font-medium text-gray-700">
									Medicine Name
								</th>
								<th className="px-4 py-2 text-left font-medium text-gray-700">
									Brand
								</th>
								<th className="px-4 py-2 text-right font-medium text-gray-700">
									Qty
								</th>
								<th className="px-4 py-2 text-right font-medium text-gray-700">
									Unit Price
								</th>
								<th className="px-4 py-2 text-right font-medium text-gray-700">
									GST
								</th>
								<th className="px-4 py-2 text-right font-medium text-gray-700">
									Amount
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200">
							{orderData.items?.map((item, index) => (
								<tr key={index} className="text-gray-700">
									<td className="px-4 py-2">
										{item.medicine_name}
									</td>
									<td className="px-4 py-2">
										{item.brand_name}
									</td>
									<td className="px-4 py-2 text-right">
										{item.quantity}
									</td>
									<td className="px-4 py-2 text-right">
										{formatCurrency(item.unit_price)}
									</td>
									<td className="px-4 py-2 text-right">
										{item.gst}%
									</td>
									<td className="px-4 py-2 text-right">
										{formatCurrency(item.amount)}
									</td>
								</tr>
							))}
							{!orderData.items?.length && (
								<tr>
									<td
										colSpan={6}
										className="px-4 py-2 text-center text-gray-500"
									>
										No items found
									</td>
								</tr>
							)}
						</tbody>
					</table>
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
