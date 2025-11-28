"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  ChefHat,
  ClipboardList,
  Home,
  LayoutDashboard,
  LineChart,
  LogOut,
  Settings,
  Table,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { XChefLogo } from "@/components/icons";
import { UserNav } from "@/components/user-nav";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/mesas", icon: Table, label: "Gestión de Mesas" },
  { href: "/dashboard/pedidos", icon: ClipboardList, label: "Pedidos" },
  { href: "/dashboard/cocina", icon: ChefHat, label: "KDS Cocina" },
  { href: "/dashboard/inventario", icon: Boxes, label: "Inventario" },
  { href: "/dashboard/finanzas", icon: LineChart, label: "Finanzas" },
];

const bottomNavItems = [
  { href: "#", icon: Settings, label: "Ajustes" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <XChefLogo className="h-8 w-8 text-primary" />
            <span className="text-lg font-semibold font-headline">XChef</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            {bottomNavItems.map((item) => (
               <SidebarMenuItem key={item.href}>
                 <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton tooltip={item.label}>
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                 </Link>
               </SidebarMenuItem>
            ))}
             <SidebarMenuItem>
                <Link href="/login" legacyBehavior passHref>
                  <SidebarMenuButton tooltip="Cerrar Sesión">
                    <LogOut />
                    <span>Cerrar Sesión</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1">
                <h1 className="text-lg font-semibold font-headline">
                    {navItems.find(item => pathname === item.href)?.label || "Dashboard"}
                </h1>
            </div>
            <UserNav />
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
