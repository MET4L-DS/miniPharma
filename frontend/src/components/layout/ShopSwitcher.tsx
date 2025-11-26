// file: ./src/components/layout/ShopSwitcher.tsx
import { useState, useEffect } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";
import { toast } from "sonner";
import { Store, Loader2 } from "lucide-react";

interface Shop {
	shop_id: number;
	shopname: string;
	manager: string;
}

export function ShopSwitcher() {
	const { user, updateShop, isManager } = useAuth();
	const [shops, setShops] = useState<Shop[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isSwitching, setIsSwitching] = useState(false);

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

	const handleShopSwitch = async (shopIdStr: string) => {
		const shopId = parseInt(shopIdStr);
		if (shopId === user?.shopId) return;

		setIsSwitching(true);
		try {
			const response = await apiService.switchShop(shopId);

			// Update context with new shop and token
			const selectedShop = shops.find((s) => s.shop_id === shopId);
			if (selectedShop) {
				updateShop(
					{
						shopId: selectedShop.shop_id,
						shopname: selectedShop.shopname,
					},
					response.token
				);
				toast.success(`Switched to ${selectedShop.shopname}`);

				// Reload the page to refresh all data
				window.location.reload();
			}
		} catch (error) {
			console.error("Failed to switch shop:", error);
			toast.error("Failed to switch shop");
		} finally {
			setIsSwitching(false);
		}
	};

	// Don't show for staff users
	if (!isManager) {
		return null;
	}

	// Show loading state
	if (isLoading) {
		return (
			<div className="flex items-center gap-2 text-sm text-muted-foreground">
				<Loader2 className="h-4 w-4 animate-spin" />
				<span>Loading shops...</span>
			</div>
		);
	}

	// Don't show if only one shop
	if (shops.length <= 1) {
		return null;
	}

	return (
		<div className="flex items-center gap-2">
			<Store className="h-4 w-4 text-muted-foreground" />
			<Select
				value={user?.shopId?.toString() || ""}
				onValueChange={handleShopSwitch}
				disabled={isSwitching}
			>
				<SelectTrigger className="w-[200px]">
					<SelectValue placeholder="Select shop">
						{isSwitching
							? "Switching..."
							: user?.shopname || "Select shop"}
					</SelectValue>
				</SelectTrigger>
				<SelectContent>
					{shops.map((shop) => (
						<SelectItem
							key={shop.shop_id}
							value={shop.shop_id.toString()}
						>
							{shop.shopname}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
