import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import { Medicine } from "@/types/medicine";

interface CategoryDistributionProps {
	medicines: Medicine[];
}

export function CategoryDistribution({ medicines }: CategoryDistributionProps) {
	const categories = Array.from(
		new Set(medicines.map((m) => m.therapeutic_category))
	).filter((cat) => cat);

	if (categories.length === 0) {
		return null;
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Package className="h-5 w-5" />
					Category Distribution
				</CardTitle>
				<CardDescription>
					Overview of medicines by therapeutic category
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid gap-2">
					{categories.map((category) => {
						const count = medicines.filter(
							(m) => m.therapeutic_category === category
						).length;
						const percentage = (
							(count / medicines.length) *
							100
						).toFixed(1);
						return (
							<div
								key={category}
								className="flex justify-between items-center p-2 rounded-lg border"
							>
								<span className="font-medium">{category}</span>
								<div className="flex items-center gap-2">
									<Badge variant="outline">
										{count} medicines
									</Badge>
									<span className="text-sm text-muted-foreground">
										{percentage}%
									</span>
								</div>
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}
