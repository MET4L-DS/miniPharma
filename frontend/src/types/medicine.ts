export interface Medicine {
    medicine_id: string;
    composition_id: number;
    name: string;
    brand: string;
    hsn_code: string;
    gst_rate: number;
    requires_prescription: boolean;
    therapeutic_category: string;
}

export interface MedicineTableProps {
    medicines: Medicine[];
    onUpdate: (updatedMedicine: Medicine) => void;
    onDelete: (id: string) => void;
}

export interface MedicineActionsProps {
    medicineId: string;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}