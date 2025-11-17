import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface QuickAction {
	title: string;
	description: string;
	action: () => void;
	icon: LucideIcon;
}

interface QuickActionsProps {
	actions: QuickAction[];
}

export function QuickActions({ actions }: QuickActionsProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Quick Actions</CardTitle>
				<CardDescription>Common tasks and shortcuts</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{actions.map((action) => (
					<div
						key={action.title}
						className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
					>
						<div className="flex items-center space-x-3">
							<action.icon className="h-5 w-5 text-blue-600" />
							<div>
								<h3 className="font-medium">{action.title}</h3>
								<p className="text-sm text-gray-600">
									{action.description}
								</p>
							</div>
						</div>
						<Button onClick={action.action} size="sm">
							Go
						</Button>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
