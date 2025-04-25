import React from "react";

const medicines = [
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
	{
		medicine_id: "MED002",
		composition_id: 102,
		name: "Amoxicillin",
		brand: "Mox",
		hsn_code: "30049012",
		gst_rate: 18.0,
		requires_prescription: true,
		therapeutic_category: "Antibiotic",
	},
];

export function MedicineTable() {
	return (
		<div className="overflow-x-auto">
			<table className="min-w-full border-collapse border border-gray-200">
				<thead>
					<tr className="bg-gray-100">
						<th className="border border-gray-300 px-4 py-2">
							Medicine ID
						</th>
						<th className="border border-gray-300 px-4 py-2">
							Composition ID
						</th>
						<th className="border border-gray-300 px-4 py-2">
							Name
						</th>
						<th className="border border-gray-300 px-4 py-2">
							Brand
						</th>
						<th className="border border-gray-300 px-4 py-2">
							HSN Code
						</th>
						<th className="border border-gray-300 px-4 py-2">
							GST Rate (%)
						</th>
						<th className="border border-gray-300 px-4 py-2">
							Requires Prescription
						</th>
						<th className="border border-gray-300 px-4 py-2">
							Therapeutic Category
						</th>
					</tr>
				</thead>
				<tbody>
					{medicines.map((medicine) => (
						<tr
							key={medicine.medicine_id}
							className="hover:bg-gray-50"
						>
							<td className="border border-gray-300 px-4 py-2">
								{medicine.medicine_id}
							</td>
							<td className="border border-gray-300 px-4 py-2">
								{medicine.composition_id}
							</td>
							<td className="border border-gray-300 px-4 py-2">
								{medicine.name}
							</td>
							<td className="border border-gray-300 px-4 py-2">
								{medicine.brand}
							</td>
							<td className="border border-gray-300 px-4 py-2">
								{medicine.hsn_code}
							</td>
							<td className="border border-gray-300 px-4 py-2">
								{medicine.gst_rate}
							</td>
							<td className="border border-gray-300 px-4 py-2">
								{medicine.requires_prescription ? "Yes" : "No"}
							</td>
							<td className="border border-gray-300 px-4 py-2">
								{medicine.therapeutic_category}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
