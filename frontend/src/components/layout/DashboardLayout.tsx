// file: ./src/components/layout/DashboardLayout.tsx
import { ReactNode } from "react";
import {
	SidebarProvider,
	SidebarInset,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface DashboardLayoutProps {
	children: ReactNode;
	title?: string;
	breadcrumbs?: { label: string; href?: string }[];
}

export function DashboardLayout({
	children,
	title = "Dashboard",
	breadcrumbs = [],
}: DashboardLayoutProps) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
					<SidebarTrigger className="-ml-1" />
					<div className="h-4 w-px bg-border mx-2" />
					<Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem>
								<BreadcrumbLink href="/dashboard">
									Dashboard
								</BreadcrumbLink>
							</BreadcrumbItem>
							{breadcrumbs.map((crumb, index) => (
								<div key={index} className="flex items-center">
									<BreadcrumbSeparator />
									<BreadcrumbItem>
										{crumb.href ? (
											<BreadcrumbLink href={crumb.href}>
												{crumb.label}
											</BreadcrumbLink>
										) : (
											<BreadcrumbPage>
												{crumb.label}
											</BreadcrumbPage>
										)}
									</BreadcrumbItem>
								</div>
							))}
						</BreadcrumbList>
					</Breadcrumb>
				</header>
				<div className="flex flex-1 flex-col gap-4 p-4">
					<div className="min-h-[100vh] flex-1 rounded-xl bg-background">
						{children}
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
