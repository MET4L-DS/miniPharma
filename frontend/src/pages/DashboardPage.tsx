import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Pill,
	Receipt,
	TrendingUp,
	Package,
	AlertTriangle,
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
import {
	StatCard,
	QuickActions,
	ExpiringItems,
	LowStockAlert,
	DashboardAlerts,
	SalesChart,
	SaltPredictionChart,
} from "@/components/dashboard";

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

				{/* Alerts Section */}
				{stats && (
					<DashboardAlerts
						expiredItems={stats.expired_items}
						lowStockItems={stats.low_stock_items}
					/>
				)}

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Quick Actions */}
					<QuickActions actions={quickActions} />

					{/* Expiring Soon */}
					<ExpiringItems
						items={expiringItems}
						loading={loading}
						onViewAll={() => navigate("/stock")}
					/>
				</div>

				{/* Prediction and Analytics Section */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Sales Chart */}
					<SalesChart />

					{/* Salt Demand Prediction Chart */}
					<SaltPredictionChart />

					{/* Low Stock Items */}
					<LowStockAlert
						items={lowStockItems}
						onViewAll={() => navigate("/stock")}
					/>
				</div>
			</div>
		</DashboardLayout>
	);
}
