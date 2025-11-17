// file: ./src/services/api/auth.ts

import { BaseApiService } from "./base";
import type {
	LoginRequest,
	LoginResponse,
	RegisterRequest,
	RegisterResponse,
} from "@/types/api";

export class AuthService extends BaseApiService {
	async login(credentials: LoginRequest): Promise<LoginResponse> {
		return this.makeRequest("/login/", {
			method: "POST",
			body: JSON.stringify(credentials),
		});
	}

	async register(userData: RegisterRequest): Promise<RegisterResponse> {
		return this.makeRequest("/register/", {
			method: "POST",
			body: JSON.stringify(userData),
		});
	}
}
