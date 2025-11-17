import { StatCard } from "@/components/dashboard/StatCard";
import { Pill, Package, AlertTriangle, TrendingUp } from "lucide-react";
import { MedicineStats as MedicineStatsType } from "@/types/medicine";

interface MedicineStatsProps {
	stats: MedicineStatsType;
}

export function MedicineStats({ stats }: MedicineStatsProps) {
	const medicineStats = [
		{
			title: "Total Medicines",
			value: stats.total_medicines.toLocaleString(),
			description: "Active medicines in inventory",
			icon: Pill,
			color: "text-blue-600",
		},
		{
			title: "Categories",
			value: stats.categories.toString(),
			description: "Therapeutic categories",
			icon: Package,
			color: "text-green-600",
		},
		{
			title: "Prescription Required",
			value: stats.prescription_required.toString(),
			description: "Medicines requiring prescription",
			icon: AlertTriangle,
			color: "text-orange-600",
		},
		{
			title: "OTC Medicines",
			value: stats.otc_medicines.toString(),
			description: "Over-the-counter medicines",
			icon: TrendingUp,
			color: "text-purple-600",
		},
	];

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			{medicineStats.map((stat) => (
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
