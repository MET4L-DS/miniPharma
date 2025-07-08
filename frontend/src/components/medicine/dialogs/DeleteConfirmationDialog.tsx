// file: ./src/components/medicine/dialogs/DeleteConfirmationDialog.tsx

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

interface DeleteConfirmationDialogProps {
	onConfirm: () => Promise<void>;
	medicineId: string;
	trigger?: React.ReactNode;
}

export function DeleteConfirmationDialog({
	onConfirm,
	medicineId,
	trigger,
}: DeleteConfirmationDialogProps) {
	const [open, setOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const handleConfirm = async () => {
		try {
			setIsLoading(true);
			await onConfirm();
			setOpen(false);
			toast.success("Medicine deleted successfully!");
		} catch (error) {
			console.error("Failed to delete medicine:", error);
			toast.error("Failed to delete medicine. Please try again.");
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
						Are you sure you want to delete this medicine?
					</AlertDialogTitle>
					<AlertDialogDescription>
						This will permanently remove the medicine with ID:{" "}
						<strong>{medicineId}</strong> from the system. This
						action cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isLoading}>
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleConfirm}
						disabled={isLoading}
						className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
					>
						{isLoading ? "Deleting..." : "Delete"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
