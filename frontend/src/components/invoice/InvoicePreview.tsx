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
		<div className="w-full bg-white print:bg-white print:shadow-none">
			{/* Header */}
			<div className="text-center mb-6 print:mb-8">
				<h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
					PHARMACY INVOICE
				</h1>
				<p className="text-sm md:text-base text-gray-600">
					Professional Pharmacy Management System
				</p>
			</div>

			{/* Invoice Details */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-6 print:mb-8">
				<div className="space-y-3">
					<h3 className="text-base md:text-lg font-semibold border-b pb-2">
						Invoice Details
					</h3>
					<div className="space-y-2 text-sm md:text-base">
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

				<div className="space-y-3">
					<h3 className="text-base md:text-lg font-semibold border-b pb-2">
						Customer Information
					</h3>
					<div className="space-y-2 text-sm md:text-base">
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

			<Separator className="my-4 md:my-6" />

			{/* Medicine Items */}
			<div className="mb-6 print:mb-8">
				<h3 className="text-base md:text-lg font-semibold mb-4">
					Purchased Items
				</h3>

				{/* Mobile-friendly table */}
				<div className="block md:hidden space-y-3">
					{orderData.items?.map((item, index) => (
						<div
							key={index}
							className="bg-gray-50 p-3 rounded-lg border"
						>
							<div className="font-medium text-sm mb-2">
								{item.medicine_name}
							</div>
							<div className="text-xs text-gray-600 space-y-1">
								<div className="flex justify-between">
									<span>Brand:</span>
									<span>{item.brand_name}</span>
								</div>
								<div className="flex justify-between">
									<span>Quantity:</span>
									<span>{item.quantity}</span>
								</div>
								<div className="flex justify-between">
									<span>Unit Price:</span>
									<span>
										{formatCurrency(item.unit_price)}
									</span>
								</div>
								<div className="flex justify-between">
									<span>GST:</span>
									<span>{item.gst}%</span>
								</div>
								<div className="flex justify-between font-medium">
									<span>Amount:</span>
									<span>{formatCurrency(item.amount)}</span>
								</div>
							</div>
						</div>
					))}
					{!orderData.items?.length && (
						<div className="text-center text-gray-500 py-4">
							No items found
						</div>
					)}
				</div>

				{/* Desktop table */}
				<div className="hidden md:block">
					<div className="border rounded-lg overflow-hidden">
						<table className="w-full text-sm">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-3 py-3 text-left font-medium text-gray-700">
										Medicine Name
									</th>
									<th className="px-3 py-3 text-left font-medium text-gray-700">
										Brand
									</th>
									<th className="px-3 py-3 text-right font-medium text-gray-700">
										Qty
									</th>
									<th className="px-3 py-3 text-right font-medium text-gray-700">
										Unit Price
									</th>
									<th className="px-3 py-3 text-right font-medium text-gray-700">
										GST
									</th>
									<th className="px-3 py-3 text-right font-medium text-gray-700">
										Amount
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200">
								{orderData.items?.map((item, index) => (
									<tr key={index} className="text-gray-700">
										<td className="px-3 py-3">
											{item.medicine_name}
										</td>
										<td className="px-3 py-3">
											{item.brand_name}
										</td>
										<td className="px-3 py-3 text-right">
											{item.quantity}
										</td>
										<td className="px-3 py-3 text-right">
											{formatCurrency(item.unit_price)}
										</td>
										<td className="px-3 py-3 text-right">
											{item.gst}%
										</td>
										<td className="px-3 py-3 text-right">
											{formatCurrency(item.amount)}
										</td>
									</tr>
								))}
								{!orderData.items?.length && (
									<tr>
										<td
											colSpan={6}
											className="px-3 py-4 text-center text-gray-500"
										>
											No items found
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			</div>

			<Separator className="my-4 md:my-6" />

			{/* Payment Information */}
			<div className="mb-6 print:mb-8">
				<h3 className="text-base md:text-lg font-semibold mb-4">
					Payment Information
				</h3>
				<div className="bg-gray-50 p-4 rounded-lg">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						<div>
							<p className="text-xs md:text-sm text-gray-600 mb-1">
								Payment Method
							</p>
							<p className="font-medium text-sm md:text-base">
								{orderData.payment_type}
							</p>
						</div>
						{orderData.cash_amount > 0 && (
							<div>
								<p className="text-xs md:text-sm text-gray-600 mb-1">
									Cash Amount
								</p>
								<p className="font-medium text-sm md:text-base">
									{formatCurrency(orderData.cash_amount)}
								</p>
							</div>
						)}
						{orderData.upi_amount > 0 && (
							<div>
								<p className="text-xs md:text-sm text-gray-600 mb-1">
									UPI Amount
								</p>
								<p className="font-medium text-sm md:text-base">
									{formatCurrency(orderData.upi_amount)}
								</p>
							</div>
						)}
					</div>
				</div>
			</div>

			<Separator className="my-4 md:my-6" />

			{/* Total Section */}
			<div className="flex justify-end mb-6 print:mb-8">
				<div className="w-full sm:w-80">
					<div className="bg-gray-800 text-white p-4 rounded-lg">
						<div className="flex justify-between items-center">
							<span className="text-base md:text-lg font-semibold">
								Total Amount:
							</span>
							<span className="text-lg md:text-xl font-bold">
								{formatCurrency(orderData.total_amount)}
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Footer */}
			<div className="text-center text-gray-600 text-xs md:text-sm mt-8 pt-6 border-t print:mt-12 print:pt-8">
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
