// file: ./src/services/api/staff.ts

import { BaseApiService } from "./base";

export interface Staff {
	phone: string;
	name: string;
	is_active: boolean;
	shop_id: number;
}

export interface AddStaffRequest {
	phone: string;
	password: string;
	name: string;
}

export interface StaffResponse {
	success: boolean;
	staff?: Staff;
	message?: string;
}

export class StaffService extends BaseApiService {
	/**
	 * List all staff for a specific shop
	 */
	async listStaff(shopId: number): Promise<Staff[]> {
		return this.makeRequest(`/shops/${shopId}/staffs/`);
	}

	/**
	 * Add a new staff member to a shop
	 */
	async addStaff(
		shopId: number,
		staffData: AddStaffRequest
	): Promise<StaffResponse> {
		return this.makeRequest(`/shops/${shopId}/staffs/add/`, {
			method: "POST",
			body: JSON.stringify(staffData),
		});
	}

	/**
	 * Remove a staff member from a shop
	 */
	async removeStaff(
		shopId: number,
		staffPhone: string
	): Promise<{ success: boolean; message: string }> {
		return this.makeRequest(
			`/shops/${shopId}/staffs/${staffPhone}/remove/`,
			{
				method: "DELETE",
			}
		);
	}
}
