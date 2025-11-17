// file: ./src/components/billing/AddItemCard.tsx
import { useState, useRef, useEffect } from "react";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, Calendar, AlertTriangle } from "lucide-react";
import { apiService, MedicineBatchResult } from "@/services/api";
import { toast } from "sonner";
import { format } from "date-fns";

interface AddItemCardProps {
	onAddItem: (item: any) => void;
}

export function AddItemCard({ onAddItem }: AddItemCardProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<MedicineBatchResult[]>(
		[]
	);
	const [isSearching, setIsSearching] = useState(false);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [selectedMedicine, setSelectedMedicine] =
		useState<MedicineBatchResult | null>(null);
	const [quantity, setQuantity] = useState(1);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Debounced search
	useEffect(() => {
		const timeoutId = setTimeout(async () => {
			if (searchQuery.trim().length >= 2) {
				setIsSearching(true);
				try {
					const results = await apiService.searchMedicinesWithBatches(
						searchQuery
					);
					setSearchResults(results);
					setIsDropdownOpen(results.length > 0);
				} catch (error) {
					console.error("Search failed:", error);
					toast.error("Failed to search medicines");
				} finally {
					setIsSearching(false);
				}
			} else {
				setSearchResults([]);
				setIsDropdownOpen(false);
			}
		}, 300);

		return () => clearTimeout(timeoutId);
	}, [searchQuery]);

	// Handle click outside to close dropdown
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsDropdownOpen(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleSelectMedicine = (medicine: MedicineBatchResult) => {
		setSelectedMedicine(medicine);
		setSearchQuery(
			`${medicine.brand_name} (${medicine.generic_name}) - Batch: ${medicine.batch_number}`
		);
		setIsDropdownOpen(false);
	};

	const handleAddItem = () => {
		if (!selectedMedicine) {
			toast.error("Please select a medicine");
			return;
		}

		if (quantity <= 0) {
			toast.error("Please enter a valid quantity");
			return;
		}

		if (quantity > (selectedMedicine.quantity_in_stock || 0)) {
			toast.error(
				`Only ${selectedMedicine.quantity_in_stock} units available in stock`
			);
			return;
		}

		const newItem = {
			id: `${selectedMedicine.batch_id}-${Date.now()}`,
			product_id: selectedMedicine.product_id,
			batch_id: selectedMedicine.batch_id,
			batch_number: selectedMedicine.batch_number,
			medicineName: selectedMedicine.generic_name,
			brandName: selectedMedicine.brand_name,
			quantity: quantity,
			unitPrice: Number(selectedMedicine.selling_price || 0),
			amount: Number(selectedMedicine.selling_price || 0) * quantity,
			availableStock: Number(selectedMedicine.quantity_in_stock || 0),
			expiryDate: selectedMedicine.expiry_date,
			gst: Number(selectedMedicine.gst || 0),
		};

		onAddItem(newItem);

		// Reset form
		setSearchQuery("");
		setSelectedMedicine(null);
		setQuantity(1);
		setSearchResults([]);

		toast.success("Item added to bill");
	};

	const isExpiringSoon = (expiryDate: string) => {
		const expiry = new Date(expiryDate);
		const today = new Date();
		const diffTime = expiry.getTime() - today.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays <= 30 && diffDays > 0;
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Plus className="h-5 w-5" />
					Add Medicine to Bill
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2" ref={dropdownRef}>
					<Label htmlFor="medicine-search">Search Medicine</Label>
					<div className="relative">
						<Input
							id="medicine-search"
							placeholder="Type medicine name to search..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							onFocus={() =>
								searchResults.length > 0 &&
								setIsDropdownOpen(true)
							}
						/>

						{isDropdownOpen && searchResults.length > 0 && (
							<div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
								{searchResults.map((medicine) => (
									<div
										key={`${medicine.batch_id}-${medicine.product_id}`}
										className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
										onClick={() =>
											handleSelectMedicine(medicine)
										}
									>
										<div className="flex justify-between items-start">
											<div className="flex-1">
												<div className="font-medium text-sm">
													{medicine.brand_name}
												</div>
												<div className="text-xs text-gray-600">
													{medicine.generic_name}
												</div>
												<div className="flex items-center gap-2 mt-1">
													<Badge
														variant="outline"
														className="text-xs"
													>
														Batch:{" "}
														{medicine.batch_number}
													</Badge>
													<div className="flex items-center gap-1 text-xs text-gray-500">
														<Package className="h-3 w-3" />
														{
															medicine.quantity_in_stock
														}{" "}
														units
													</div>
												</div>
												<div className="flex items-center gap-2 mt-1">
													<div className="flex items-center gap-1 text-xs text-gray-500">
														<Calendar className="h-3 w-3" />
														Exp:{" "}
														{format(
															new Date(
																medicine.expiry_date
															),
															"MMM yyyy"
														)}
													</div>
													{isExpiringSoon(
														medicine.expiry_date
													) && (
														<Badge
															variant="secondary"
															className="text-xs"
														>
															<AlertTriangle className="h-3 w-3 mr-1" />
															Expiring Soon
														</Badge>
													)}
												</div>
											</div>
											<div className="text-right">
												<div className="font-semibold text-sm">
													₹
													{Number(
														medicine.selling_price ||
															0
													).toFixed(2)}
												</div>
												<div className="text-xs text-gray-500">
													GST:{" "}
													{Number(
														medicine.gst || 0
													).toFixed(2)}
													%
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						)}

						{isSearching && (
							<div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3">
								<div className="text-sm text-gray-500">
									Searching...
								</div>
							</div>
						)}
					</div>
				</div>

				{selectedMedicine && (
					<div className="p-3 bg-blue-50 rounded-md">
						<div className="text-sm font-medium">
							{selectedMedicine.brand_name}
						</div>
						<div className="text-xs text-gray-600">
							{selectedMedicine.generic_name}
						</div>
						<div className="text-xs text-gray-500 mt-1">
							Batch: {selectedMedicine.batch_number} | Available:{" "}
							{selectedMedicine.quantity_in_stock} units
						</div>
					</div>
				)}

				<div className="space-y-2">
					<Label htmlFor="quantity">Quantity</Label>
					<Input
						id="quantity"
						type="number"
						min="1"
						max={selectedMedicine?.quantity_in_stock || 999}
						value={quantity}
						onChange={(e) =>
							setQuantity(parseInt(e.target.value) || 1)
						}
						disabled={!selectedMedicine}
					/>
				</div>
			</CardContent>
			<CardFooter>
				<Button
					onClick={handleAddItem}
					className="w-full"
					disabled={!selectedMedicine || quantity <= 0}
				>
					<Plus className="mr-2 h-4 w-4" />
					Add to Bill
				</Button>
			</CardFooter>
		</Card>
	);
}
