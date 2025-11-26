// file: ./src/pages/ShopManagementPage.tsx

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddShopDialog } from "@/components/shop/AddShopDialog";
import { Store, CheckCircle2 } from "lucide-react";

interface Shop {
	shop_id: number;
	shopname: string;
	manager: string;
}

export default function ShopManagementPage() {
	const { user, isManager, updateShop } = useAuth();
	const [shops, setShops] = useState<Shop[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (isManager) {
			loadShops();
		}
	}, [isManager]);

	const loadShops = async () => {
		setIsLoading(true);
		try {
			const myShops = await apiService.getMyShops();
			setShops(myShops);
		} catch (error) {
			console.error("Failed to load shops:", error);
			toast.error("Failed to load your shops");
		} finally {
			setIsLoading(false);
		}
	};

	const handleShopAdded = () => {
		loadShops();
	};

	const handleSwitchShop = async (shopId: number) => {
		try {
			const response = await apiService.switchShop(shopId);
			const selectedShop = shops.find((s) => s.shop_id === shopId);

			if (selectedShop) {
				// Update the auth context with new shop and token
				updateShop(
					{
						shopId: selectedShop.shop_id,
						shopname: selectedShop.shopname,
					},
					response.token
				);

				toast.success(`Switched to ${selectedShop.shopname}`);
				// Reload the page to refresh all data with new shop context
				window.location.reload();
			}
		} catch (error) {
			console.error("Failed to switch shop:", error);
			toast.error("Failed to switch shop");
		}
	};

	if (!isManager) {
		return (
			<DashboardLayout
				breadcrumbs={[{ label: "My Shops", href: "/shops" }]}
			>
				<div className="container mx-auto p-6">
					<Card>
						<CardContent className="pt-6">
							<p className="text-center text-muted-foreground">
								Only managers can access shop management.
							</p>
						</CardContent>
					</Card>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout breadcrumbs={[{ label: "My Shops", href: "/shops" }]}>
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-3xl font-bold">My Shops</h1>
						<p className="text-muted-foreground mt-1">
							Manage all your pharmacy locations
						</p>
					</div>
					<AddShopDialog onShopAdded={handleShopAdded} />
				</div>

				{isLoading ? (
					<Card>
						<CardContent className="pt-6">
							<p className="text-center text-muted-foreground">
								Loading your shops...
							</p>
						</CardContent>
					</Card>
				) : shops.length === 0 ? (
					<Card>
						<CardContent className="pt-6">
							<p className="text-center text-muted-foreground">
								No shops found. Add your first shop to get
								started.
							</p>
						</CardContent>
					</Card>
				) : (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{shops.map((shop) => {
							const isCurrentShop = shop.shop_id === user?.shopId;
							return (
								<Card
									key={shop.shop_id}
									className={
										isCurrentShop
											? "border-primary shadow-md"
											: ""
									}
								>
									<CardHeader>
										<div className="flex items-start justify-between">
											<div className="flex items-center gap-2">
												<Store className="h-5 w-5 text-muted-foreground" />
												<CardTitle className="text-xl">
													{shop.shopname}
												</CardTitle>
											</div>
											{isCurrentShop && (
												<CheckCircle2 className="h-5 w-5 text-primary" />
											)}
										</div>
										<CardDescription>
											Shop ID: {shop.shop_id}
										</CardDescription>
									</CardHeader>
									<CardContent>
										{isCurrentShop ? (
											<Button
												variant="outline"
												className="w-full"
												disabled
											>
												Currently Active
											</Button>
										) : (
											<Button
												variant="default"
												className="w-full"
												onClick={() =>
													handleSwitchShop(
														shop.shop_id
													)
												}
											>
												Switch to This Shop
											</Button>
										)}
									</CardContent>
								</Card>
							);
						})}
					</div>
				)}
			</div>
		</DashboardLayout>
	);
}
