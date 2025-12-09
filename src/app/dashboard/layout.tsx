
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  ChefHat,
  ClipboardList,
  LayoutDashboard,
  LineChart,
  LogOut,
  Menu,
  Settings,
  Table,
  Users,
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
} from "@/components/ui/sidebar";
import { XChefLogo } from "@/components/icons";
import { UserNav } from "@/components/user-nav";
import { RestaurantProvider } from "@/context/RestaurantContext";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/lib/types";

const allNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ["Gerente", "Mesero"] },
  { href: "/dashboard/mesas", icon: Table, label: "Gestión de Mesas", roles: ["Gerente", "Mesero"] },
  { href: "/dashboard/pedidos", icon: ClipboardList, label: "Pedidos", roles: ["Gerente", "Mesero"] },
  { href: "/dashboard/cocina", icon: ChefHat, label: "KDS Cocina", roles: ["Gerente", "Cocinero"] },
  { href: "/dashboard/menu", icon: Menu, label: "Menú", roles: ["Gerente", "Cocinero"] },
  { href: "/dashboard/inventario", icon: Boxes, label: "Inventario", roles: ["Gerente", "Cocinero"] },
  { href: "/dashboard/finanzas", icon: LineChart, label: "Finanzas", roles: ["Gerente"] },
  { href: "/dashboard/usuarios", icon: Users, label: "Usuarios", roles: ["Gerente"] },
];

const bottomNavItems = [
  { href: "#", icon: Settings, label: "Ajustes", roles: ["Gerente", "Mesero", "Cocinero"] },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const userRole = user?.role;

  const navItems = allNavItems.filter(item => userRole && item.roles.includes(userRole));
  const filteredBottomNavItems = bottomNavItems.filter(item => userRole && item.roles.includes(userRole));

  return (
    <RestaurantProvider>
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
                  <Link href={item.href}>
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
              {filteredBottomNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href}>
                    <SidebarMenuButton tooltip={item.label}>
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Cerrar Sesión" onClick={logout}>
                    <LogOut />
                    <span>Cerrar Sesión</span>
                  </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
              <SidebarTrigger className="md:hidden" />
              <div className="flex-1">
                  <h1 className="text-lg font-semibold font-headline">
                      {allNavItems.find(item => pathname.startsWith(item.href))?.label || "Dashboard"}
                  </h1>
              </div>
              <UserNav />
          </header>
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
              {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </RestaurantProvider>
  );
}
