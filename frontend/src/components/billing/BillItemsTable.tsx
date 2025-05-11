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
import { Trash2 } from "lucide-react";

interface BillItem {
	id: string;
	medicineName: string;
	quantity: number;
	unitPrice: number;
	amount: number;
}

interface BillItemsTableProps {
	billItems: BillItem[];
	handleRemoveItem: (id: string) => void;
	totalAmount: number;
	discountPercentage: number;
	discountAmount: number;
	finalAmount: number;
}

export function BillItemsTable({
	billItems,
	handleRemoveItem,
	totalAmount,
	discountPercentage,
	discountAmount,
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
							<TableHead>Medicine Name</TableHead>
							<TableHead>Quantity</TableHead>
							<TableHead>Unit Price (₹)</TableHead>
							<TableHead>Amount (₹)</TableHead>
							<TableHead className="w-[50px]"></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{billItems.length > 0 ? (
							billItems.map((item) => (
								<TableRow key={item.id}>
									<TableCell>{item.medicineName}</TableCell>
									<TableCell>{item.quantity}</TableCell>
									<TableCell>
										{item.unitPrice.toFixed(2)}
									</TableCell>
									<TableCell>
										{item.amount.toFixed(2)}
									</TableCell>
									<TableCell>
										<Button
											variant="ghost"
											size="icon"
											onClick={() =>
												handleRemoveItem(item.id)
											}
										>
											<Trash2 className="h-4 w-4 text-red-500" />
										</Button>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={5}
									className="text-center py-4"
								>
									No items added to the bill
								</TableCell>
							</TableRow>
						)}
					</TableBody>
					<TableFooter>
						<TableRow>
							<TableCell
								colSpan={3}
								className="text-right font-medium"
							>
								Total
							</TableCell>
							<TableCell className="font-bold">
								₹{totalAmount.toFixed(2)}
							</TableCell>
							<TableCell></TableCell>
						</TableRow>
						<TableRow>
							<TableCell
								colSpan={3}
								className="text-right font-medium"
							>
								Discount ({discountPercentage}%)
							</TableCell>
							<TableCell className="font-bold">
								₹{discountAmount.toFixed(2)}
							</TableCell>
							<TableCell></TableCell>
						</TableRow>
						<TableRow>
							<TableCell
								colSpan={3}
								className="text-right font-medium"
							>
								Final Amount
							</TableCell>
							<TableCell className="font-bold">
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
