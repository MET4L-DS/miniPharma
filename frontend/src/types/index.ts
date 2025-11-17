// file: ./src/types/index.ts

// Export everything from api.ts (contains all API-related interfaces)
export * from "./api";

// Export local types that don't conflict
export type {
	Medicine,
	MedicineTableProps,
	MedicineStats,
	CreateMedicineData,
	UpdateMedicineData,
} from "./medicine";

export type { Batch, BatchTableProps, CreateBatchData } from "./batch";

export type {
	BillItem,
	CustomerInfo,
	PaymentInfo,
	OrderSummary,
} from "./billing";

export type { StockStats, StockFilters } from "./stock";

export type {
	InvoiceOrderItem,
	InvoiceOrderData,
	InvoicePreviewProps,
} from "./invoice";

export type {
	NavigationItem,
	BreadcrumbItem,
	DashboardLayoutProps,
	UserInfo,
} from "./layout";

export type {
	AddBatchDialogProps,
	EditBatchDialogProps,
	DeleteBatchDialogProps,
	StockFiltersProps,
} from "./stock-dialog";

export type {
	AddMedicineDialogProps,
	EditMedicineDialogProps,
	DeleteConfirmationDialogProps,
	MedicineFiltersProps,
} from "./medicine-dialog";

// Note: SearchResult, OrderItem, PaymentData, PaymentSummary are already in api.ts
// Import those from api.ts directly when needed
