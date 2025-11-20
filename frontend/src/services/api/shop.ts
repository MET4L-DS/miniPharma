// file: ./src/services/api/shop.ts

import { BaseApiService } from "./base";

export interface Shop {
	shop_id: number;
	shopname: string;
	contact_number?: string;
	manager: string;
}

export interface SwitchShopResponse {
	success: boolean;
	token: string;
	shop: Shop;
}

export interface AddShopRequest {
	shopname: string;
	contact_number?: string;
}

export interface AddShopResponse {
	message: string;
	shop: Shop;
}

export class ShopService extends BaseApiService {
	/**
	 * Get all shops where the current user is a manager
	 */
	async getMyShops(): Promise<Shop[]> {
		return this.makeRequest("/shops/mine/");
	}

	/**
	 * Switch to a different shop (manager only)
	 * Returns a new JWT token scoped to the selected shop
	 */
	async switchShop(shopId: number): Promise<SwitchShopResponse> {
		return this.makeRequest(`/shops/${shopId}/switch/`, {
			method: "POST",
		});
	}

	/**
	 * Add a new shop (manager only)
	 */
	async addShop(shopData: AddShopRequest): Promise<AddShopResponse> {
		return this.makeRequest("/shops/add/", {
			method: "POST",
			body: JSON.stringify(shopData),
		});
	}
}
