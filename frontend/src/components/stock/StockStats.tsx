import { StatCard } from "@/components/dashboard/StatCard";
import { Package, AlertTriangle, TrendingDown, Calendar } from "lucide-react";
import { StockStats as StockStatsType } from "@/types/stock";

interface StockStatsProps {
	stats: StockStatsType;
}

export function StockStats({ stats }: StockStatsProps) {
	const stockStats = [
		{
			title: "Total Batches",
			value: stats.totalBatches.toString(),
			description: "Total batches in inventory",
			icon: Package,
			color: "text-blue-600",
		},
		{
			title: "Low Stock",
			value: stats.lowStockBatches.toString(),
			description: "Batches with low stock",
			icon: TrendingDown,
			color: "text-orange-600",
		},
		{
			title: "Out of Stock",
			value: stats.outOfStockBatches.toString(),
			description: "Batches out of stock",
			icon: AlertTriangle,
			color: "text-red-600",
		},
		{
			title: "Expiring Soon",
			value: stats.expiringSoonBatches.toString(),
			description: "Batches expiring within 30 days",
			icon: Calendar,
			color: "text-yellow-600",
		},
	];

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			{stockStats.map((stat) => (
				<StatCard
					key={stat.title}
					title={stat.title}
					value={stat.value}
					description={stat.description}
					icon={stat.icon}
					color={stat.color}
				/>
			))}
		</div>
	);
}
