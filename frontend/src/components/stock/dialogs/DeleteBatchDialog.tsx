// file: ./src/components/stock/dialogs/DeleteBatchDialog.tsx
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

interface DeleteBatchDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => Promise<void>;
	batchNumber: string;
}

export function DeleteBatchDialog({
	isOpen,
	onClose,
	onConfirm,
	batchNumber,
}: DeleteBatchDialogProps) {
	const handleConfirm = async () => {
		try {
			await onConfirm();
		} catch (error) {
			console.error("Failed to delete batch:", error);
		}
	};

	return (
		<AlertDialog open={isOpen} onOpenChange={onClose}>
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
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={handleConfirm}>
						Delete
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
