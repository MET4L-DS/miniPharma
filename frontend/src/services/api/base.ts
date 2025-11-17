// file: ./src/services/api/base.ts

// Read API base URL from Vite env (must be prefixed with `VITE_`).
// Fallback to localhost when not provided (useful for local dev).
export const API_BASE_URL =
	(import.meta.env as Record<string, string>).VITE_API_BASE_URL ||
	"http://localhost:8000/api";

export class BaseApiService {
	protected async makeRequest(endpoint: string, options: RequestInit = {}) {
		const url = `${API_BASE_URL}${endpoint}`;
		const defaultOptions: RequestInit = {
			headers: {
				"Content-Type": "application/json",
				...options.headers,
			},
		};

		const response = await fetch(url, { ...defaultOptions, ...options });

		if (!response.ok) {
			const errorData = await response
				.json()
				.catch(() => ({ error: "Unknown error" }));
			throw new Error(
				errorData.error ||
					`HTTP ${response.status}: ${response.statusText}`
			);
		}

		return response.json();
	}

	protected safeParseNumber(value: any): number {
		if (value === null || value === undefined || value === "") {
			return 0;
		}

		const parsed =
			typeof value === "string" ? parseFloat(value) : Number(value);
		return isNaN(parsed) ? 0 : parsed;
	}

	protected safeParseInteger(value: any): number {
		if (value === null || value === undefined || value === "") {
			return 0;
		}

		const parsed =
			typeof value === "string" ? parseInt(value, 10) : Number(value);
		return isNaN(parsed) ? 0 : Math.floor(parsed);
	}
}
