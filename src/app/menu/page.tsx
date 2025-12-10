"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XChefLogo } from "@/components/icons";
import Link from "next/link";
import { useState, useEffect } from "react";
import { apiPlatillos } from "@/services/api";

type Dish = {
  id: string;
  name: string;
  nombre?: string;
  category: string;
  categoria?: string;
  price: number;
  precio?: number;
  description?: string;
  descripcion?: string;
  isPublic?: boolean;
  esPublico?: boolean;
};

export default function PublicMenuPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Menú | XChef Restaurante";
    
    // Cargar platillos públicos directamente desde la API
    const loadDishes = async () => {
      try {
        const response = await apiPlatillos.obtenerPublicos();
        const formattedDishes = response.map((p: { id: string; nombre?: string; name?: string; categoria?: string; category?: string; precio?: number | string; price?: number; descripcion?: string; description?: string }) => ({
          id: p.id,
          name: p.name || p.nombre || '',
          category: p.category || p.categoria || 'Otros',
          price: parseFloat(String(p.price ?? p.precio ?? 0)) || 0,
          description: p.description || p.descripcion || '',
        }));
        setDishes(formattedDishes);
      } catch (error) {
        console.error('Error al cargar menú:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadDishes();
  }, []);

  // Agrupar platillos por categoría
  const groupedMenu = dishes.reduce((acc, dish) => {
    const category = dish.category || "Otros";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(dish);
    return acc;
  }, {} as Record<string, Dish[]>);

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
            {loading ? (
                <div className="text-center py-16">
                     <p className="text-muted-foreground text-lg">Cargando menú...</p>
                </div>
            ) : Object.keys(groupedMenu).length > 0 ? (
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
