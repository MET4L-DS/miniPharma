import { useEffect, useState } from "react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { apiService, SalesPoint } from "@/services/api";
import {
	ResponsiveContainer,
	LineChart,
	Line,
	CartesianGrid,
	XAxis,
	YAxis,
	Tooltip,
} from "recharts";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TimePeriod = "7" | "30" | "180" | "365" | "1825";

const TIME_PERIODS: Record<
	TimePeriod,
	{ label: string; days: number; description: string }
> = {
	"7": {
		label: "1W",
		days: 7,
		description: "Daily revenue over the last week",
	},
	"30": {
		label: "1M",
		days: 30,
		description: "Daily revenue over the last 30 days",
	},
	"180": {
		label: "6M",
		days: 180,
		description: "Daily revenue over the last 6 months",
	},
	"365": {
		label: "1Y",
		days: 365,
		description: "Daily revenue over the last year",
	},
	"1825": {
		label: "5Y",
		days: 1825,
		description: "Daily revenue over the last 5 years",
	},
};

export function SalesChart() {
	const [data, setData] = useState<SalesPoint[]>([]);
	const [loading, setLoading] = useState(false);
	const [period, setPeriod] = useState<TimePeriod>("30");

	useEffect(() => {
		fetchSales(period);
	}, [period]);

	const fetchSales = async (timePeriod: TimePeriod) => {
		try {
			setLoading(true);
			const days = TIME_PERIODS[timePeriod].days;
			const res = await apiService.getSalesData(days);
			// Map to recharts-friendly format (date label)
			setData(
				res.map((p) => ({
					date: p.date,
					revenue: Number(p.revenue),
				}))
			);
		} catch (err) {
			console.error("Failed to fetch sales data:", err);
		} finally {
			setLoading(false);
		}
	};

	const handleRefresh = () => {
		fetchSales(period);
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle>Sales Revenue</CardTitle>
					<Button
						variant="ghost"
						size="sm"
						onClick={handleRefresh}
						disabled={loading}
					>
						<RefreshCw
							className={`${
								loading ? "animate-spin" : ""
							} h-4 w-4`}
						/>
					</Button>
				</div>
				<CardDescription>
					{TIME_PERIODS[period].description}
				</CardDescription>
				<Tabs
					value={period}
					onValueChange={(val) => setPeriod(val as TimePeriod)}
					className="mt-4"
				>
					<TabsList className="grid w-full grid-cols-5">
						{(Object.keys(TIME_PERIODS) as TimePeriod[]).map(
							(key) => (
								<TabsTrigger key={key} value={key}>
									{TIME_PERIODS[key].label}
								</TabsTrigger>
							)
						)}
					</TabsList>
				</Tabs>
			</CardHeader>
			<CardContent>
				{loading ? (
					<div className="flex items-center justify-center py-8">
						<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto" />
					</div>
				) : (
					<div style={{ width: "100%", height: 240 }}>
						<ResponsiveContainer width="100%" height="100%">
							<LineChart
								data={data}
								margin={{
									top: 10,
									right: 20,
									left: 0,
									bottom: 0,
								}}
							>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="date" tick={{ fontSize: 11 }} />
								<YAxis />
								<Tooltip />
								<Line
									type="monotone"
									dataKey="revenue"
									stroke="#4f46e5"
									strokeWidth={2}
									dot={false}
								/>
							</LineChart>
						</ResponsiveContainer>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
