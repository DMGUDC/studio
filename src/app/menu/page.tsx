"use client";

import { useRestaurant } from "@/context/RestaurantContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { XChefLogo } from "@/components/icons";
import Link from "next/link";
import { useMemo } from "react";
import type { Dish } from "@/lib/types";

export default function PublicMenuPage() {
  const { dishes, isDishAvailable } = useRestaurant();

  const groupedMenu = useMemo(() => {
    const publicDishes = dishes.filter(dish => dish.isPublic && isDishAvailable(dish.id));
    
    return publicDishes.reduce((acc, dish) => {
      const category = dish.category || "Otros";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(dish);
      return acc;
    }, {} as Record<string, Dish[]>);
  }, [dishes, isDishAvailable]);

  return (
    <div className="bg-background min-h-screen">
      <header className="sticky top-0 z-10 border-b bg-background/80 px-4 py-3 backdrop-blur-sm sm:px-6">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <XChefLogo className="h-8 w-8 text-primary" />
            <span className="text-lg font-semibold font-headline">XChef Restaurante</span>
          </Link>
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-headline tracking-tight">Nuestro Menú</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Platillos frescos preparados al momento para ti.
          </p>
        </div>
        <div className="space-y-8">
            {Object.keys(groupedMenu).length > 0 ? (
                Object.entries(groupedMenu).map(([category, categoryDishes]) => (
                    <div key={category}>
                    <h2 className="text-2xl font-semibold font-headline mb-4 pb-2 border-b-2 border-primary">{category}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categoryDishes.map((dish) => (
                        <Card key={dish.id} className="flex flex-col">
                            <CardHeader>
                            <CardTitle className="text-xl">{dish.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col justify-between">
                                <p className="text-muted-foreground mb-4">
                                    {dish.description || 'Delicioso platillo preparado por nuestros chefs.'}
                                </p>
                                <p className="text-xl font-bold text-right text-primary">
                                    ${dish.price.toFixed(2)}
                                </p>
                            </CardContent>
                        </Card>
                        ))}
                    </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-16">
                     <p className="text-muted-foreground text-lg">No hay platillos publicados en el menú en este momento. Por favor, vuelve más tarde.</p>
                </div>
            )}
        </div>
      </main>
      <footer className="mt-12 py-6 border-t">
        <div className="container mx-auto text-center text-muted-foreground text-sm">
            <p>&copy; {new Date().getFullYear()} XChef Restaurante. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
