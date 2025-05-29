// file: ./src/pages/DashboardPage.tsx
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pill, Receipt, TrendingUp, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
	const navigate = useNavigate();

	const stats = [
		{
			title: "Total Medicines",
			value: "1,234",
			description: "Active medicines in inventory",
			icon: Pill,
			color: "text-blue-600",
		},
		{
			title: "Today's Sales",
			value: "₹12,450",
			description: "Revenue generated today",
			icon: TrendingUp,
			color: "text-green-600",
		},
		{
			title: "Pending Bills",
			value: "23",
			description: "Bills awaiting payment",
			icon: Receipt,
			color: "text-orange-600",
		},
		{
			title: "Low Stock Items",
			value: "8",
			description: "Items below minimum threshold",
			icon: Package,
			color: "text-red-600",
		},
	];

	const quickActions = [
		{
			title: "Add New Medicine",
			description: "Add a new medicine to inventory",
			action: () => navigate("/medicines"),
			icon: Pill,
		},
		{
			title: "Create Bill",
			description: "Generate a new customer bill",
			action: () => navigate("/billing"),
			icon: Receipt,
		},
	];

	return (
		<DashboardLayout title="Dashboard">
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						Dashboard
					</h1>
					<p className="text-muted-foreground">
						Welcome to your pharmacy management system
					</p>
				</div>

				{/* Stats Grid */}
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					{stats.map((stat) => (
						<Card key={stat.title}>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									{stat.title}
								</CardTitle>
								<stat.icon
									className={`h-4 w-4 ${stat.color}`}
								/>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{stat.value}
								</div>
								<p className="text-xs text-muted-foreground">
									{stat.description}
								</p>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Quick Actions */}
				<div className="grid gap-4 md:grid-cols-2">
					{quickActions.map((action) => (
						<Card
							key={action.title}
							className="cursor-pointer hover:shadow-md transition-shadow"
						>
							<CardHeader>
								<div className="flex items-center space-x-2">
									<action.icon className="h-6 w-6 text-primary" />
									<CardTitle className="text-lg">
										{action.title}
									</CardTitle>
								</div>
								<CardDescription>
									{action.description}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Button
									onClick={action.action}
									className="w-full"
								>
									Get Started
								</Button>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Recent Activity */}
				<Card>
					<CardHeader>
						<CardTitle>Recent Activity</CardTitle>
						<CardDescription>
							Latest transactions and system updates
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="flex items-center space-x-4">
								<div className="w-2 h-2 bg-green-500 rounded-full"></div>
								<div className="flex-1">
									<p className="text-sm font-medium">
										New medicine added: Paracetamol 500mg
									</p>
									<p className="text-xs text-muted-foreground">
										2 minutes ago
									</p>
								</div>
							</div>
							<div className="flex items-center space-x-4">
								<div className="w-2 h-2 bg-blue-500 rounded-full"></div>
								<div className="flex-1">
									<p className="text-sm font-medium">
										Bill generated for customer #1234
									</p>
									<p className="text-xs text-muted-foreground">
										5 minutes ago
									</p>
								</div>
							</div>
							<div className="flex items-center space-x-4">
								<div className="w-2 h-2 bg-orange-500 rounded-full"></div>
								<div className="flex-1">
									<p className="text-sm font-medium">
										Low stock alert: Amoxicillin
									</p>
									<p className="text-xs text-muted-foreground">
										1 hour ago
									</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</DashboardLayout>
	);
}
