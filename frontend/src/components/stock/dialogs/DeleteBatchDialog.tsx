// file: ./src/components/stock/dialogs/DeleteBatchDialog.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { DeleteBatchDialogProps } from "@/types/stock-dialog";

export function DeleteBatchDialog({
	onConfirm,
	batchNumber,
	trigger,
}: DeleteBatchDialogProps) {
	const [open, setOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const handleConfirm = async () => {
		try {
			setIsLoading(true);
			await onConfirm();
			setOpen(false);
			toast.success("Batch deleted successfully!");
		} catch (error) {
			console.error("Failed to delete batch:", error);
			toast.error("Failed to delete batch. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger asChild>
				{trigger || (
					<Button variant="outline" size="sm">
						<Trash2 className="mr-2 h-4 w-4" />
						Delete
					</Button>
				)}
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						Are you sure you want to delete this batch?
					</AlertDialogTitle>
					<AlertDialogDescription>
						This will permanently remove the batch "{batchNumber}"
						from the system. This action cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isLoading}>
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleConfirm}
						disabled={isLoading}
					>
						{isLoading ? "Deleting..." : "Delete"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
