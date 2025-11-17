import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { ExpiringItem } from "@/services/api";

interface ExpiringItemsProps {
	items: ExpiringItem[];
	loading: boolean;
	onViewAll: () => void;
}

function formatExpiryDate(dateString: string) {
	const date = new Date(dateString);
	const today = new Date();
	const diffTime = date.getTime() - today.getTime();
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	if (diffDays < 0) {
		return {
			text: "Expired",
			variant: "destructive" as const,
			days: diffDays,
		};
	} else if (diffDays <= 7) {
		return {
			text: `${diffDays} days`,
			variant: "destructive" as const,
			days: diffDays,
		};
	} else if (diffDays <= 15) {
		return {
			text: `${diffDays} days`,
			variant: "secondary" as const,
			days: diffDays,
		};
	} else {
		return {
			text: `${diffDays} days`,
			variant: "outline" as const,
			days: diffDays,
		};
	}
}

export function ExpiringItems({
	items,
	loading,
	onViewAll,
}: ExpiringItemsProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Calendar className="h-5 w-5 text-orange-600" />
					Expiring Soon
					{items.length > 0 && (
						<Badge variant="secondary" className="ml-auto">
							{items.length}
						</Badge>
					)}
				</CardTitle>
				<CardDescription>
					Items expiring within 30 days - sorted by expiry date
				</CardDescription>
			</CardHeader>
			<CardContent>
				{loading ? (
					<div className="flex items-center justify-center py-8">
						<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
						<span className="ml-2 text-sm text-gray-600">
							Loading expiring items...
						</span>
					</div>
				) : items.length > 0 ? (
					<div className="space-y-3 max-h-80 overflow-y-auto">
						{items.map((item, index) => {
							const expiryInfo = formatExpiryDate(
								item.expiry_date
							);
							return (
								<div
									key={`${item.batch_number}-${index}`}
									className={`p-3 rounded-lg border-l-4 ${
										expiryInfo.days < 0
											? "border-red-500 bg-red-50"
											: expiryInfo.days <= 7
											? "border-orange-500 bg-orange-50"
											: "border-yellow-500 bg-yellow-50"
									}`}
								>
									<div className="flex justify-between items-start">
										<div className="flex-1 min-w-0">
											<h4 className="font-medium text-sm truncate">
												{item.brand_name}
											</h4>
											<p className="text-xs text-gray-600 truncate">
												{item.generic_name}
											</p>
											<div className="flex items-center gap-2 mt-1">
												<span className="text-xs text-gray-500">
													Batch: {item.batch_number}
												</span>
												<span className="text-xs text-gray-500">
													•
												</span>
												<span className="text-xs text-gray-500">
													Stock:{" "}
													{item.quantity_in_stock}
												</span>
											</div>
										</div>
										<div className="flex flex-col items-end gap-1">
											<Badge
												variant={expiryInfo.variant}
												className="text-xs"
											>
												{expiryInfo.text}
											</Badge>
											<span className="text-xs text-gray-500">
												{new Date(
													item.expiry_date
												).toLocaleDateString("en-IN")}
											</span>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<div className="text-center py-8">
						<Calendar className="h-12 w-12 text-gray-300 mx-auto mb-2" />
						<p className="text-gray-500 text-sm">
							No items expiring within 30 days
						</p>
						<p className="text-gray-400 text-xs mt-1">
							Your inventory is well-managed!
						</p>
					</div>
				)}

				{items.length > 0 && (
					<div className="mt-4 pt-3 border-t">
						<div className="flex justify-between items-center text-xs text-gray-500">
							<span>Total: {items.length} items</span>
							<Button
								variant="outline"
								size="sm"
								onClick={onViewAll}
								className="text-xs"
							>
								View All Stock
							</Button>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
