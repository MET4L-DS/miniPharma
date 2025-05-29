export const THERAPEUTIC_CATEGORIES = [
    "Analgesic",
    "Antibiotic",
    "Antiviral",
    "Antipyretic",
    "Antifungal",
    "Antidiabetic",
    "Anticholesterol",
    "Antacid",
    "Other",
] as const;

export const SAMPLE_MEDICINES = [
    {
        medicine_id: "MED001",
        composition_id: 101,
        name: "Paracetamol",
        brand: "Dolo",
        hsn_code: "30049011",
        gst_rate: 12.0,
        requires_prescription: false,
        therapeutic_category: "Analgesic",
    },
    // ... other sample medicines
];