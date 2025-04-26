import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, MoreHorizontal } from "lucide-react";

interface MedicineActionsProps {
	medicineId: string;
	onEdit: (id: string) => void;
	onDelete: (id: string) => void;
}

export function MedicineActions({
	medicineId,
	onEdit,
	onDelete,
}: MedicineActionsProps) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="h-8 w-8 p-0">
					<span className="sr-only">Open menu</span>
					<MoreHorizontal className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem
					onClick={() => onEdit(medicineId)}
					className="cursor-pointer"
				>
					<Pencil className="mr-2 h-4 w-4" />
					Edit
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => {
						onDelete(medicineId);
					}}
					className="cursor-pointer text-red-600 focus:text-red-600"
				>
					<Trash2 className="mr-2 h-4 w-4" />
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
