// file: ./src/components/dashboard/SaltPredictionChart.tsx
import { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { apiService, SaltPrediction } from "@/services/api";
import { RefreshCw, TrendingUp, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
} from "recharts";

const MONTHS = [
	{ value: "1", label: "January" },
	{ value: "2", label: "February" },
	{ value: "3", label: "March" },
	{ value: "4", label: "April" },
	{ value: "5", label: "May" },
	{ value: "6", label: "June" },
	{ value: "7", label: "July" },
	{ value: "8", label: "August" },
	{ value: "9", label: "September" },
	{ value: "10", label: "October" },
	{ value: "11", label: "November" },
	{ value: "12", label: "December" },
];

const CITIES = [
	{ value: "mumbai", label: "Mumbai" },
	{ value: "delhi", label: "Delhi" },
	{ value: "kolkata", label: "Kolkata" },
	{ value: "bangalore", label: "Bangalore" },
	{ value: "chennai", label: "Chennai" },
	{ value: "hyderabad", label: "Hyderabad" },
];

export function SaltPredictionChart() {
	const [selectedCity, setSelectedCity] = useState("mumbai");
	const [selectedMonth, setSelectedMonth] = useState(
		new Date().getMonth() + 1
	);
	const [prediction, setPrediction] = useState<SaltPrediction | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		fetchPrediction();
	}, [selectedCity, selectedMonth]);

	const fetchPrediction = async () => {
		try {
			setLoading(true);
			const data = await apiService.getSaltPredictions(
				selectedCity,
				selectedMonth
			);
			setPrediction(data);
		} catch (error) {
			toast.error("Failed to fetch salt predictions");
			console.error("Prediction fetch error:", error);
		} finally {
			setLoading(false);
		}
	};

	const chartData = prediction
		? prediction.predicted_salts.map((salt, index) => ({
				name: salt,
				value: Math.max(100 - index * 20, 20),
		  }))
		: [];

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Sparkles className="h-5 w-5 text-purple-600" />
						<CardTitle>Salt Demand Prediction</CardTitle>
					</div>
					<Button
						variant="ghost"
						size="sm"
						onClick={fetchPrediction}
						disabled={loading}
					>
						<RefreshCw
							className={`h-4 w-4 ${
								loading ? "animate-spin" : ""
							}`}
						/>
					</Button>
				</div>
				<CardDescription>
					AI-powered prediction for top demanded salts
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Filters */}
				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-2">
						<label className="text-sm font-medium">City</label>
						<Select
							value={selectedCity}
							onValueChange={setSelectedCity}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select city" />
							</SelectTrigger>
							<SelectContent>
								{CITIES.map((city) => (
									<SelectItem
										key={city.value}
										value={city.value}
									>
										{city.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium">Month</label>
						<Select
							value={selectedMonth.toString()}
							onValueChange={(val) =>
								setSelectedMonth(parseInt(val))
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select month" />
							</SelectTrigger>
							<SelectContent>
								{MONTHS.map((month) => (
									<SelectItem
										key={month.value}
										value={month.value}
									>
										{month.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				{/* Prediction Results */}
				{loading ? (
					<div className="flex items-center justify-center py-8">
						<div className="text-center">
							<RefreshCw className="h-6 w-6 animate-spin mx-auto text-purple-600" />
							<p className="mt-2 text-sm text-muted-foreground">
								Analyzing demand patterns...
							</p>
						</div>
					</div>
				) : prediction ? (
					<div className="space-y-4">
						{/* Selected Salt */}
						{prediction.selected_salt && (
							<div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
								<div className="flex items-center gap-2 mb-2">
									<TrendingUp className="h-4 w-4 text-purple-600" />
									<span className="text-sm font-medium text-purple-900 dark:text-purple-100">
										Top Predicted Salt
									</span>
								</div>
								<p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
									{prediction.selected_salt}
								</p>
							</div>
						)}

						{/* All Predictions as Bar Chart */}
						<div className="space-y-3">
							<h4 className="text-sm font-medium">
								Predicted High-Demand Salts
							</h4>
							<div style={{ width: "100%", height: 200 }}>
								<ResponsiveContainer width="100%" height="100%">
									<BarChart
										data={chartData}
										layout="vertical"
										margin={{
											top: 5,
											right: 10,
											left: 10,
											bottom: 5,
										}}
									>
										<XAxis type="number" hide />
										<YAxis
											dataKey="name"
											type="category"
											width={140}
										/>
										<Tooltip />
										<Bar dataKey="value" fill="#7c3aed" />
									</BarChart>
								</ResponsiveContainer>
							</div>
						</div>

						{/* Note */}
						{prediction.note && (
							<div className="text-xs text-muted-foreground italic p-3 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-200 dark:border-amber-800">
								ℹ️ {prediction.note}
							</div>
						)}
					</div>
				) : (
					<div className="text-center py-8 text-muted-foreground">
						<p>No prediction data available</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
