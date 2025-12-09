
"use client";

import { RestaurantProvider } from "@/context/RestaurantContext";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RestaurantProvider>
            {children}
        </RestaurantProvider>
    )
}
