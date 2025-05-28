// file: ./src/components/medicine/dialogs/DeleteConfirmationDialog.tsx

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteConfirmationDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => Promise<void>;
	medicineId: string;
}

export function DeleteConfirmationDialog({
	isOpen,
	onClose,
	onConfirm,
	medicineId,
}: DeleteConfirmationDialogProps) {
	const handleConfirm = async () => {
		try {
			await onConfirm();
		} catch (error) {
			// Error handling is done in parent component
			console.error("Failed to delete medicine:", error);
		}
	};

	return (
		<AlertDialog open={isOpen} onOpenChange={onClose}>
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
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleConfirm}
						className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
					>
						Delete
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
