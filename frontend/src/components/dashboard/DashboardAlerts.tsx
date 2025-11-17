import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Package } from "lucide-react";

interface DashboardAlertsProps {
	expiredItems: number;
	lowStockItems: number;
}

export function DashboardAlerts({
	expiredItems,
	lowStockItems,
}: DashboardAlertsProps) {
	if (expiredItems === 0 && lowStockItems === 0) return null;

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
			{expiredItems > 0 && (
				<Alert variant="destructive">
					<AlertTriangle className="h-4 w-4" />
					<AlertDescription>
						<strong>{expiredItems}</strong> items have expired and
						need immediate attention.
					</AlertDescription>
				</Alert>
			)}
			{lowStockItems > 0 && (
				<Alert>
					<Package className="h-4 w-4" />
					<AlertDescription>
						<strong>{lowStockItems}</strong> items are running low
						on stock.
					</AlertDescription>
				</Alert>
			)}
		</div>
	);
}
