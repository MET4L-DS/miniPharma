// file: ./src/types/layout.ts

import { LucideIcon } from "lucide-react";

export interface NavigationItem {
	title: string;
	url: string;
	icon: LucideIcon;
}

export interface BreadcrumbItem {
	label: string;
	href?: string;
}

export interface DashboardLayoutProps {
	children: React.ReactNode;
	title?: string;
	breadcrumbs?: BreadcrumbItem[];
}

export interface UserInfo {
	shopname?: string;
	phone?: string;
	email?: string;
	manager_name?: string;
}
