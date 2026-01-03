import AppHeaderLayout from '@/layouts/app/app-header-layout';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function AppLayout({
    children,
    breadcrumbs,
    ...props
}: AppLayoutProps) {
    const { auth } = usePage<SharedData>().props;
    const isAdmin =
        auth?.isAdmin ||
        auth?.user?.permission?.name === 'Amministratore' ||
        auth?.user?.permission_id === 3; // fallback by seeder ordering

    const LayoutComponent = isAdmin ? AppSidebarLayout : AppHeaderLayout;

    return (
        <LayoutComponent breadcrumbs={breadcrumbs} {...props}>
            {children}
        </LayoutComponent>
    );
}
