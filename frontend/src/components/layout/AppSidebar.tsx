// file: ./src/components/layout/AppSidebar.tsx
import { useLocation, useNavigate } from "react-router-dom";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	Pill,
	Receipt,
	LayoutDashboard,
	ChevronUp,
	User2,
	LogOut,
	Settings,
	Package,
	CreditCard,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { NavigationItem } from "@/types/layout";

const navigationItems: NavigationItem[] = [
	{
		title: "Dashboard",
		url: "/dashboard",
		icon: LayoutDashboard,
	},
	{
		title: "Medicine Management",
		url: "/medicines",
		icon: Pill,
	},
	{
		title: "Stock Management",
		url: "/stock",
		icon: Package,
	},
	{
		title: "Billing",
		url: "/billing",
		icon: Receipt,
	},
	{
		title: "Payments",
		url: "/payments",
		icon: CreditCard,
	},
];

export function AppSidebar() {
	const location = useLocation();
	const navigate = useNavigate();
	const { user, logout } = useAuth();

	const handleLogout = () => {
		logout();
		toast.success("Logged out successfully");
		navigate("/login");
	};

	const getUserInitials = () => {
		if (user?.shopname) {
			return user.shopname.substring(0, 2).toUpperCase();
		}
		return user?.phone?.substring(0, 2) || "AU";
	};

	return (
		<Sidebar>
			<SidebarHeader>
				<div className="flex flex-col space-y-2 px-2">
					<h2 className="text-lg font-semibold">Pharmacy System</h2>
					<p className="text-sm text-muted-foreground">
						Management Portal
					</p>
				</div>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Navigation</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{navigationItems.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton
										asChild
										isActive={
											location.pathname === item.url
										}
									>
										<a href={item.url}>
											<item.icon />
											<span>{item.title}</span>
										</a>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton>
									<Avatar className="h-6 w-6">
										<AvatarFallback className="text-xs">
											{getUserInitials()}
										</AvatarFallback>
									</Avatar>
									<div className="flex flex-col items-start text-left">
										<span className="text-sm font-medium">
											{user?.shopname || "Admin User"}
										</span>
										<span className="text-xs text-muted-foreground">
											{user?.phone ||
												"admin@pharmacy.com"}
										</span>
									</div>
									<ChevronUp className="ml-auto" />
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								side="top"
								className="w-[--radix-popper-anchor-width]"
							>
								<DropdownMenuItem
									onClick={() => navigate("/profile")}
								>
									<User2 className="mr-2 h-4 w-4" />
									Profile
								</DropdownMenuItem>
								<DropdownMenuItem>
									<Settings className="mr-2 h-4 w-4" />
									Settings
								</DropdownMenuItem>
								<DropdownMenuItem onClick={handleLogout}>
									<LogOut className="mr-2 h-4 w-4" />
									Log out
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
