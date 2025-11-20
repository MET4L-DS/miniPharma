// file: ./src/components/shop/AddShopDialog.tsx

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { apiService } from "@/services/api";
import { Plus } from "lucide-react";

interface AddShopDialogProps {
	onShopAdded?: () => void;
}

export function AddShopDialog({ onShopAdded }: AddShopDialogProps) {
	const [open, setOpen] = useState(false);
	const [contactNumber, setContactNumber] = useState("");
	const [shopname, setShopname] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validation
		if (
			contactNumber &&
			(contactNumber.length !== 10 || !/^\d+$/.test(contactNumber))
		) {
			toast.error("Contact number must be exactly 10 digits");
			return;
		}

		if (!shopname.trim()) {
			toast.error("Shop name is required");
			return;
		}

		setIsLoading(true);
		try {
			await apiService.addShop({
				shopname,
				contact_number: contactNumber || undefined,
			});
			toast.success("Shop added successfully");
			setOpen(false);
			setContactNumber("");
			setShopname("");
			onShopAdded?.();
		} catch (error) {
			console.error("Failed to add shop:", error);
			const errorMessage =
				error instanceof Error ? error.message : "Failed to add shop";
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus className="h-4 w-4 mr-2" />
					Add New Shop
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Add New Shop</DialogTitle>
					<DialogDescription>
						Add another pharmacy to manage under your account.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="shopname">Shop Name *</Label>
							<Input
								id="shopname"
								type="text"
								placeholder="Enter shop name"
								value={shopname}
								onChange={(e) => setShopname(e.target.value)}
								required
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="contact">
								Contact Number (Optional)
							</Label>
							<Input
								id="contact"
								type="tel"
								placeholder="10-digit contact number"
								value={contactNumber}
								onChange={(e) =>
									setContactNumber(e.target.value)
								}
								maxLength={10}
							/>
							<p className="text-xs text-muted-foreground">
								Shop's contact number (optional)
							</p>
						</div>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={isLoading}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading ? "Adding..." : "Add Shop"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
