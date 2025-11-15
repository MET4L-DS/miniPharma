import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Pill,
	Receipt,
	TrendingUp,
	Package,
	AlertTriangle,
	Calendar,
	RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
	apiService,
	DashboardStats,
	ExpiringItem,
	LowStockItem,
} from "@/services/api";
import { SaltPredictionChart } from "@/components/dashboard/SaltPredictionChart";
import { SalesChart } from "@/components/dashboard/SalesChart";

export default function DashboardPage() {
	const navigate = useNavigate();
	const [stats, setStats] = useState<DashboardStats | null>(null);
	const [expiringItems, setExpiringItems] = useState<ExpiringItem[]>([]);
	const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchDashboardData();
		// Set up auto-refresh every 5 minutes
		const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
		return () => clearInterval(interval);
	}, []);

	const fetchDashboardData = async () => {
		try {
			setLoading(true);
			setError(null);

			const [statsData, expiringData, lowStockData] = await Promise.all([
				apiService.getDashboardStats(),
				apiService.getExpiringSoon(),
				apiService.getLowStockItems(10),
			]);

			setStats(statsData);
			setExpiringItems(expiringData);
			setLowStockItems(lowStockData);
		} catch (err) {
			setError(
				"Failed to fetch dashboard data. Please check your connection."
			);
			console.error("Dashboard data fetch error:", err);
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	const handleRefresh = async () => {
		setRefreshing(true);
		await fetchDashboardData();
	};

	const formatExpiryDate = (dateString: string) => {
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
	};

	const dashboardStats = stats
		? [
				{
					title: "Total Medicines",
					value: stats.total_products.toLocaleString(),
					description: "Active medicines in inventory",
					icon: Pill,
					color: "text-blue-600",
				},
				{
					title: "Today's Revenue",
					value: `₹${stats.todays_revenue.toLocaleString()}`,
					description: `${stats.todays_orders} orders today`,
					icon: TrendingUp,
					color: "text-green-600",
				},
				{
					title: "Total Orders",
					value: stats.total_orders.toLocaleString(),
					description: "All time orders",
					icon: Receipt,
					color: "text-purple-600",
				},
				{
					title: "Low Stock Items",
					value: stats.low_stock_items.toString(),
					description: "Items below minimum threshold",
					icon: Package,
					color: "text-red-600",
				},
		  ]
		: [];

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
		{
			title: "View Payments",
			description: "Check payment history",
			action: () => navigate("/payments"),
			icon: TrendingUp,
		},
	];

	if (loading && !stats) {
		return (
			<DashboardLayout title="Dashboard">
				<div className="flex items-center justify-center h-64">
					<div className="text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
						<p className="mt-2 text-gray-600">
							Loading dashboard...
						</p>
					</div>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout title="Dashboard">
			<div className="space-y-6">
				{/* Header */}
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-3xl font-bold">Dashboard</h1>
						<p className="text-gray-600">
							Welcome to your pharmacy management system
						</p>
					</div>
					<Button
						onClick={handleRefresh}
						disabled={refreshing}
						variant="outline"
						size="sm"
					>
						<RefreshCw
							className={`h-4 w-4 mr-2 ${
								refreshing ? "animate-spin" : ""
							}`}
						/>
						{refreshing ? "Refreshing..." : "Refresh"}
					</Button>
				</div>

				{/* Error Alert */}
				{error && (
					<Alert variant="destructive">
						<AlertTriangle className="h-4 w-4" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{/* Stats Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{dashboardStats.map((stat) => (
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
								<p className="text-xs text-gray-600">
									{stat.description}
								</p>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Alerts Section */}
				{stats &&
					(stats.expired_items > 0 || stats.low_stock_items > 0) && (
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{stats.expired_items > 0 && (
								<Alert variant="destructive">
									<AlertTriangle className="h-4 w-4" />
									<AlertDescription>
										<strong>{stats.expired_items}</strong>{" "}
										items have expired and need immediate
										attention.
									</AlertDescription>
								</Alert>
							)}
							{stats.low_stock_items > 0 && (
								<Alert>
									<Package className="h-4 w-4" />
									<AlertDescription>
										<strong>{stats.low_stock_items}</strong>{" "}
										items are running low on stock.
									</AlertDescription>
								</Alert>
							)}
						</div>
					)}

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Quick Actions */}
					<Card>
						<CardHeader>
							<CardTitle>Quick Actions</CardTitle>
							<CardDescription>
								Common tasks and shortcuts
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{quickActions.map((action) => (
								<div
									key={action.title}
									className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
								>
									<div className="flex items-center space-x-3">
										<action.icon className="h-5 w-5 text-blue-600" />
										<div>
											<h3 className="font-medium">
												{action.title}
											</h3>
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

					{/* Expiring Soon - Enhanced Implementation */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Calendar className="h-5 w-5 text-orange-600" />
								Expiring Soon
								{expiringItems.length > 0 && (
									<Badge
										variant="secondary"
										className="ml-auto"
									>
										{expiringItems.length}
									</Badge>
								)}
							</CardTitle>
							<CardDescription>
								Items expiring within 30 days - sorted by expiry
								date
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
							) : expiringItems.length > 0 ? (
								<div className="space-y-3 max-h-80 overflow-y-auto">
									{expiringItems.map((item, index) => {
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
																Batch:{" "}
																{
																	item.batch_number
																}
															</span>
															<span className="text-xs text-gray-500">
																•
															</span>
															<span className="text-xs text-gray-500">
																Stock:{" "}
																{
																	item.quantity_in_stock
																}
															</span>
														</div>
													</div>
													<div className="flex flex-col items-end gap-1">
														<Badge
															variant={
																expiryInfo.variant
															}
															className="text-xs"
														>
															{expiryInfo.text}
														</Badge>
														<span className="text-xs text-gray-500">
															{new Date(
																item.expiry_date
															).toLocaleDateString(
																"en-IN"
															)}
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

							{expiringItems.length > 0 && (
								<div className="mt-4 pt-3 border-t">
									<div className="flex justify-between items-center text-xs text-gray-500">
										<span>
											Total: {expiringItems.length} items
										</span>
										<Button
											variant="outline"
											size="sm"
											onClick={() => navigate("/stock")}
											className="text-xs"
										>
											View All Stock
										</Button>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Prediction and Analytics Section */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Sales Chart */}
					<SalesChart />

					{/* Salt Demand Prediction Chart */}
					<SaltPredictionChart />

					{/* Low Stock Items */}
					{lowStockItems.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Package className="h-5 w-5 text-red-600" />
									Low Stock Alert
									<Badge
										variant="destructive"
										className="ml-auto"
									>
										{lowStockItems.length}
									</Badge>
								</CardTitle>
								<CardDescription>
									Items that need restocking
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									{lowStockItems
										.slice(0, 6)
										.map((item, index) => (
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
														{item.quantity_in_stock}{" "}
														left
													</Badge>
													<span className="text-xs text-gray-500">
														Batch:{" "}
														{item.batch_number}
													</span>
												</div>
											</div>
										))}
								</div>
								{lowStockItems.length > 6 && (
									<div className="mt-4 text-center">
										<Button
											variant="outline"
											onClick={() => navigate("/stock")}
										>
											View All Low Stock Items (
											{lowStockItems.length})
										</Button>
									</div>
								)}
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</DashboardLayout>
	);
}
