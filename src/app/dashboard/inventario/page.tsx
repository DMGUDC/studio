"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { PlusCircle, FileDown, ArrowDownUp } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";

const inventoryItems = [
  { id: "inv1", name: "Tomates", category: "Vegetales", stock: 20, unit: "kg", threshold: 5 },
  { id: "inv2", name: "Pechuga de Pollo", category: "Carnes", stock: 15, unit: "kg", threshold: 10 },
  { id: "inv3", name: "Queso Mozzarella", category: "Lácteos", stock: 8, unit: "kg", threshold: 4 },
  { id: "inv4", name: "Harina de Trigo", category: "Secos", stock: 50, unit: "kg", threshold: 20 },
  { id: "inv5", name: "Aceite de Oliva", category: "Aceites", stock: 10, unit: "litros", threshold: 5 },
  { id: "inv6", name: "Vino Tinto", category: "Bebidas", stock: 3, unit: "botellas", threshold: 5 },
  { id: "inv7", name: "Servilletas", category: "No Alimentos", stock: 5, unit: "paquetes", threshold: 2 },
  { id: "inv8", name: "Sal", category: "Condimentos", stock: 25, unit: "kg", threshold: 2 },
];

type InventoryItem = typeof inventoryItems[0];
type SortKey = "name" | "category";

export default function InventarioPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const sortedAndFilteredItems = useMemo(() => {
    let items = [...inventoryItems].filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    items.sort((a, b) => {
      const aValue = a[sortKey].toLowerCase();
      const bValue = b[sortKey].toLowerCase();
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return items;
  }, [searchTerm, sortKey, sortOrder]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
        setSortKey(key);
        setSortOrder('asc');
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Gestión de Inventario</CardTitle>
            <CardDescription>
              Controla el stock de todos los productos de tu restaurante.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <FileDown className="mr-2 h-4 w-4" /> Exportar
            </Button>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Producto
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center justify-between">
            <Input 
                placeholder="Buscar producto en inventario..." 
                className="max-w-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        <ArrowDownUp className="mr-2 h-4 w-4" />
                        Ordenar por: {sortKey === 'name' ? 'Nombre' : 'Categoría'}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleSort('name')}>Nombre</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('category')}>Categoría</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Stock Actual</TableHead>
              <TableHead>Nivel de Stock</TableHead>
              <TableHead className="text-right">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAndFilteredItems.map((item) => {
              const stockPercentage = Math.min(100, (item.stock / (item.threshold * 3)) * 100);
              const isLowStock = item.stock <= item.threshold;
              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    {item.stock} {item.unit}
                  </TableCell>
                  <TableCell>
                    <Progress
                      value={stockPercentage}
                      className="w-40"
                      indicatorClassName={
                        isLowStock ? "bg-destructive" : "bg-primary"
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    {isLowStock ? (
                      <Badge variant="destructive">Bajo Stock</Badge>
                    ) : (
                      <Badge variant="outline">En Stock</Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}