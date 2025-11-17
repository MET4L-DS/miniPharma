import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import { LowStockItem } from "@/services/api";

interface LowStockAlertProps {
	items: LowStockItem[];
	onViewAll: () => void;
}

export function LowStockAlert({ items, onViewAll }: LowStockAlertProps) {
	if (items.length === 0) return null;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Package className="h-5 w-5 text-red-600" />
					Low Stock Alert
					<Badge variant="destructive" className="ml-auto">
						{items.length}
					</Badge>
				</CardTitle>
				<CardDescription>Items that need restocking</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{items.slice(0, 6).map((item, index) => (
						<div
							key={`${item.batch_number}-${index}`}
							className="p-3 border border-red-200 rounded-lg bg-red-50"
						>
							<h4 className="font-medium text-sm">
								{item.brand_name}
							</h4>
							<p className="text-xs text-gray-600 truncate">
								{item.generic_name}
							</p>
							<div className="flex justify-between items-center mt-2">
								<Badge
									variant="destructive"
									className="text-xs"
								>
									{item.quantity_in_stock} left
								</Badge>
								<span className="text-xs text-gray-500">
									Batch: {item.batch_number}
								</span>
							</div>
						</div>
					))}
				</div>
				{items.length > 6 && (
					<div className="mt-4 text-center">
						<Button variant="outline" onClick={onViewAll}>
							View All Low Stock Items ({items.length})
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
