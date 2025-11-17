// file: ./src/types/stock-dialog.ts

import { Batch, CreateBatchData } from "./batch";

export interface AddBatchDialogProps {
	onAdd: (batch: CreateBatchData) => Promise<void>;
}

export interface EditBatchDialogProps {
	batch: Batch;
	onSave: (batch: Batch) => Promise<void>;
	trigger?: React.ReactNode;
}

export interface DeleteBatchDialogProps {
	onConfirm: () => Promise<void>;
	batchNumber: string;
	trigger?: React.ReactNode;
}

export interface StockFiltersProps {
	searchTerm: string;
	onSearchChange: (value: string) => void;
	stockFilter: string;
	onStockFilterChange: (value: string) => void;
}
