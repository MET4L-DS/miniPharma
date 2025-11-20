// file: ./src/pages/StaffManagementPage.tsx
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
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
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";
import { UserPlus, Trash2, Users, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Staff {
	phone: string;
	name: string;
	is_active: boolean;
	shop_id: number;
}

const StaffManagementPage = () => {
	const { user, isManager } = useAuth();
	const navigate = useNavigate();
	const [staff, setStaff] = useState<Staff[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [isAdding, setIsAdding] = useState(false);
	const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	// Add staff form fields
	const [newStaffPhone, setNewStaffPhone] = useState("");
	const [newStaffName, setNewStaffName] = useState("");
	const [newStaffPassword, setNewStaffPassword] = useState("");

	useEffect(() => {
		// Redirect if not a manager
		if (!isManager) {
			toast.error("Access denied: Manager account required");
			navigate("/dashboard");
			return;
		}
		loadStaff();
	}, [isManager, navigate, user?.shopId]);

	const loadStaff = async () => {
		if (!user?.shopId) return;

		setIsLoading(true);
		try {
			const staffList = await apiService.listStaff(user.shopId);
			setStaff(staffList);
		} catch (error) {
			console.error("Failed to load staff:", error);
			toast.error("Failed to load staff members");
		} finally {
			setIsLoading(false);
		}
	};

	const handleAddStaff = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!user?.shopId) {
			toast.error("No shop selected");
			return;
		}

		// Validate phone number
		if (newStaffPhone.length !== 10 || !/^\d+$/.test(newStaffPhone)) {
			toast.error("Please enter a valid 10-digit phone number");
			return;
		}

		if (newStaffPassword.length < 6) {
			toast.error("Password must be at least 6 characters");
			return;
		}

		setIsAdding(true);
		try {
			await apiService.addStaff(user.shopId, {
				phone: newStaffPhone,
				name: newStaffName,
				password: newStaffPassword,
			});

			toast.success("Staff member added successfully");
			setIsAddDialogOpen(false);
			resetForm();
			loadStaff();
		} catch (error) {
			console.error("Failed to add staff:", error);
			const errorMessage =
				error instanceof Error ? error.message : "Failed to add staff";
			toast.error(errorMessage);
		} finally {
			setIsAdding(false);
		}
	};

	const handleDeleteStaff = async () => {
		if (!staffToDelete || !user?.shopId) return;

		setIsDeleting(true);
		try {
			await apiService.removeStaff(user.shopId, staffToDelete.phone);
			toast.success("Staff member removed successfully");
			setStaffToDelete(null);
			loadStaff();
		} catch (error) {
			console.error("Failed to remove staff:", error);
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to remove staff";
			toast.error(errorMessage);
		} finally {
			setIsDeleting(false);
		}
	};

	const resetForm = () => {
		setNewStaffPhone("");
		setNewStaffName("");
		setNewStaffPassword("");
	};

	return (
		<DashboardLayout
			breadcrumbs={[{ label: "Staff Management", href: "/staff" }]}
		>
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">
							Staff Management
						</h1>
						<p className="text-muted-foreground">
							Manage staff members for{" "}
							{user?.shopname || "your shop"}
						</p>
					</div>
					<Dialog
						open={isAddDialogOpen}
						onOpenChange={setIsAddDialogOpen}
					>
						<DialogTrigger asChild>
							<Button>
								<UserPlus className="mr-2 h-4 w-4" />
								Add Staff
							</Button>
						</DialogTrigger>
						<DialogContent>
							<form onSubmit={handleAddStaff}>
								<DialogHeader>
									<DialogTitle>
										Add New Staff Member
									</DialogTitle>
									<DialogDescription>
										Create a new staff account for your
										pharmacy
									</DialogDescription>
								</DialogHeader>
								<div className="space-y-4 py-4">
									<div className="space-y-2">
										<Label htmlFor="staffPhone">
											Phone Number
										</Label>
										<Input
											id="staffPhone"
											type="tel"
											placeholder="Enter 10-digit phone"
											value={newStaffPhone}
											onChange={(e) =>
												setNewStaffPhone(e.target.value)
											}
											maxLength={10}
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="staffName">
											Full Name
										</Label>
										<Input
											id="staffName"
											type="text"
											placeholder="Enter staff name"
											value={newStaffName}
											onChange={(e) =>
												setNewStaffName(e.target.value)
											}
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="staffPassword">
											Password
										</Label>
										<Input
											id="staffPassword"
											type="password"
											placeholder="Minimum 6 characters"
											value={newStaffPassword}
											onChange={(e) =>
												setNewStaffPassword(
													e.target.value
												)
											}
											minLength={6}
											required
										/>
									</div>
								</div>
								<DialogFooter>
									<Button
										type="button"
										variant="outline"
										onClick={() => {
											setIsAddDialogOpen(false);
											resetForm();
										}}
										disabled={isAdding}
									>
										Cancel
									</Button>
									<Button type="submit" disabled={isAdding}>
										{isAdding ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Adding...
											</>
										) : (
											"Add Staff"
										)}
									</Button>
								</DialogFooter>
							</form>
						</DialogContent>
					</Dialog>
				</div>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Users className="h-5 w-5" />
							Staff Members
						</CardTitle>
						<CardDescription>
							View and manage all staff members in your pharmacy
						</CardDescription>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<div className="flex items-center justify-center py-8">
								<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
							</div>
						) : staff.length === 0 ? (
							<div className="text-center py-8 text-muted-foreground">
								<Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
								<p>No staff members added yet</p>
								<p className="text-sm">
									Click "Add Staff" to create your first staff
									account
								</p>
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Phone Number</TableHead>
										<TableHead>Name</TableHead>
										<TableHead>Status</TableHead>
										<TableHead className="text-right">
											Actions
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{staff.map((member) => (
										<TableRow key={member.phone}>
											<TableCell className="font-medium">
												{member.phone}
											</TableCell>
											<TableCell>{member.name}</TableCell>
											<TableCell>
												<span
													className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
														member.is_active
															? "bg-green-100 text-green-800"
															: "bg-gray-100 text-gray-800"
													}`}
												>
													{member.is_active
														? "Active"
														: "Inactive"}
												</span>
											</TableCell>
											<TableCell className="text-right">
												<Button
													variant="ghost"
													size="sm"
													onClick={() =>
														setStaffToDelete(member)
													}
												>
													<Trash2 className="h-4 w-4 text-destructive" />
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>

				{/* Delete Confirmation Dialog */}
				<AlertDialog
					open={!!staffToDelete}
					onOpenChange={(open) => !open && setStaffToDelete(null)}
				>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>
								Remove Staff Member?
							</AlertDialogTitle>
							<AlertDialogDescription>
								Are you sure you want to remove{" "}
								<strong>{staffToDelete?.name}</strong> (
								{staffToDelete?.phone})? This action cannot be
								undone and they will no longer be able to access
								the system.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel disabled={isDeleting}>
								Cancel
							</AlertDialogCancel>
							<AlertDialogAction
								onClick={handleDeleteStaff}
								disabled={isDeleting}
								className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							>
								{isDeleting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Removing...
									</>
								) : (
									"Remove Staff"
								)}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</DashboardLayout>
	);
};

export default StaffManagementPage;
