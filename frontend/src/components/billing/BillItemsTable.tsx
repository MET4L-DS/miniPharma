// file: ./src/components/billing/BillItemsTable.tsx
import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Package, Calendar } from "lucide-react";
import { format } from "date-fns";
import { BillItem } from "@/types/billing";

interface BillItemsTableProps {
	billItems: BillItem[];
	handleRemoveItem: (id: string) => void;
	totalAmount: number;
	discountPercentage: number;
	discountAmount: number;
	gstAmount: number;
	finalAmount: number;
}

export function BillItemsTable({
	billItems,
	handleRemoveItem,
	totalAmount,
	discountPercentage,
	discountAmount,
	gstAmount,
	finalAmount,
}: BillItemsTableProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Bill Items</CardTitle>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Medicine Details</TableHead>
							<TableHead>Batch Info</TableHead>
							<TableHead className="text-center">Qty</TableHead>
							<TableHead className="text-right">
								Unit Price
							</TableHead>
							<TableHead className="text-right">GST</TableHead>
							<TableHead className="text-right">Amount</TableHead>
							<TableHead className="text-center">
								Action
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{billItems.length > 0 ? (
							billItems.map((item) => (
								<TableRow key={item.id}>
									<TableCell>
										<div>
											<div className="font-medium">
												{item.brandName}
											</div>
											<div className="text-sm text-muted-foreground">
												{item.medicineName}
											</div>
										</div>
									</TableCell>
									<TableCell>
										<div className="space-y-1">
											<Badge
												variant="outline"
												className="text-xs"
											>
												{item.batch_number}
											</Badge>
											<div className="flex items-center gap-1 text-xs text-muted-foreground">
												<Package className="h-3 w-3" />
												{item.availableStock} available
											</div>
											<div className="flex items-center gap-1 text-xs text-muted-foreground">
												<Calendar className="h-3 w-3" />
												Exp:{" "}
												{format(
													new Date(item.expiryDate),
													"MMM yyyy"
												)}
											</div>
										</div>
									</TableCell>
									<TableCell className="text-center">
										{item.quantity}
									</TableCell>
									<TableCell className="text-right">
										₹{item.unitPrice.toFixed(2)}
									</TableCell>
									<TableCell className="text-right">
										{item.gst}%
									</TableCell>
									<TableCell className="text-right">
										₹{item.amount.toFixed(2)}
									</TableCell>
									<TableCell className="text-center">
										<Button
											variant="ghost"
											size="sm"
											onClick={() =>
												handleRemoveItem(item.id)
											}
											className="text-red-600 hover:text-red-700"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={7}
									className="text-center text-muted-foreground"
								>
									No items added to the bill
								</TableCell>
							</TableRow>
						)}
					</TableBody>
					<TableFooter>
						<TableRow>
							<TableCell colSpan={5} className="font-medium">
								Subtotal
							</TableCell>
							<TableCell className="text-right">
								₹{(totalAmount - gstAmount).toFixed(2)}
							</TableCell>
							<TableCell></TableCell>
						</TableRow>
						<TableRow>
							<TableCell colSpan={5} className="font-medium">
								GST
							</TableCell>
							<TableCell className="text-right">
								₹{gstAmount.toFixed(2)}
							</TableCell>
							<TableCell></TableCell>
						</TableRow>
						<TableRow>
							<TableCell colSpan={5} className="font-medium">
								Total
							</TableCell>
							<TableCell className="text-right">
								₹{totalAmount.toFixed(2)}
							</TableCell>
							<TableCell></TableCell>
						</TableRow>
						{discountPercentage > 0 && (
							<TableRow>
								<TableCell colSpan={5} className="font-medium">
									Discount ({discountPercentage}%)
								</TableCell>
								<TableCell className="text-right text-red-600">
									-₹{discountAmount.toFixed(2)}
								</TableCell>
								<TableCell></TableCell>
							</TableRow>
						)}
						<TableRow className="bg-muted/50">
							<TableCell colSpan={5} className="font-bold">
								Final Amount
							</TableCell>
							<TableCell className="text-right font-bold text-lg">
								₹{finalAmount.toFixed(2)}
							</TableCell>
							<TableCell></TableCell>
						</TableRow>
					</TableFooter>
				</Table>
			</CardContent>
		</Card>
	);
}
