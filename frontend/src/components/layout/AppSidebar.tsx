// file: ./src/components/layout/AppSidebar.tsx
import { useLocation } from "react-router-dom";
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
	CreditCard, // Add this import
} from "lucide-react";

const navigationItems = [
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
		title: "Payments", // Add this new navigation item
		url: "/payments",
		icon: CreditCard,
	},
];

export function AppSidebar() {
	const location = useLocation();

	return (
		<Sidebar>
			<SidebarHeader>
				<h2 className="text-lg font-semibold">Pharmacy System</h2>
				<p className="text-sm text-muted-foreground">
					Management Portal
				</p>
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
									<Avatar className="h-8 w-8">
										<AvatarFallback>AU</AvatarFallback>
									</Avatar>
									<div className="flex flex-col text-left">
										<span className="text-sm font-medium">
											Admin User
										</span>
										<span className="text-xs text-muted-foreground">
											admin@pharmacy.com
										</span>
									</div>
									<ChevronUp className="ml-auto" />
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								side="top"
								className="w-[--radix-popper-anchor-width]"
							>
								<DropdownMenuItem>
									<Settings />
									<span>Settings</span>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<LogOut />
									<span>Log out</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
