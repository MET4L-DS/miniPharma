// file: ./src/types/stock.ts

export interface StockStats {
	totalBatches: number;
	lowStockBatches: number;
	outOfStockBatches: number;
	expiringSoonBatches: number;
}

export interface StockFilters {
	searchTerm: string;
	stockStatus: "all" | "low" | "out" | "expiring";
	sortBy: "expiry" | "stock" | "name";
}
