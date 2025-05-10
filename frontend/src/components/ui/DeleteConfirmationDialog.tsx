// file: ./src/components/ui/MedicinePage.tsx

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
import { toast } from "sonner";

interface DeleteConfirmationDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	medicineId: string;
}

export function DeleteConfirmationDialog({
	isOpen,
	onClose,
	onConfirm,
	medicineId,
}: DeleteConfirmationDialogProps) {
	return (
		<AlertDialog open={isOpen} onOpenChange={onClose}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						Are you sure you want to delete this medicine?
					</AlertDialogTitle>
					<AlertDialogDescription>
						This will permanently remove the medicine with ID:{" "}
						{medicineId} from the system. This action cannot be
						undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={() => {
							onConfirm();
							toast.success("Medicine deleted successfully");
						}}
						className="bg-red-600 hover:bg-red-700"
					>
						Delete
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
