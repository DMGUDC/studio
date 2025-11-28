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
import { PlusCircle, FileDown } from "lucide-react";

const inventoryItems = [
  { name: "Tomates", category: "Vegetales", stock: 20, unit: "kg", threshold: 5 },
  { name: "Pechuga de Pollo", category: "Carnes", stock: 15, unit: "kg", threshold: 10 },
  { name: "Queso Mozzarella", category: "Lácteos", stock: 8, unit: "kg", threshold: 4 },
  { name: "Harina de Trigo", category: "Secos", stock: 50, unit: "kg", threshold: 20 },
  { name: "Aceite de Oliva", category: "Aceites", stock: 10, unit: "litros", threshold: 5 },
  { name: "Vino Tinto", category: "Bebidas", stock: 3, unit: "botellas", threshold: 5 },
  { name: "Servilletas", category: "No Alimentos", stock: 5, unit: "paquetes", threshold: 2 },
  { name: "Sal", category: "Condimentos", stock: 25, unit: "kg", threshold: 2 }
];

export default function InventarioPage() {
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
        <div className="mb-4">
            <Input placeholder="Buscar producto en inventario..." />
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
            {inventoryItems.map((item) => {
              const stockLevel = (item.stock / (item.threshold * 3)) * 100;
              const isLowStock = item.stock <= item.threshold;
              return (
                <TableRow key={item.name}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    {item.stock} {item.unit}
                  </TableCell>
                  <TableCell>
                    <Progress value={stockLevel} className="w-40" indicatorClassName={isLowStock ? "bg-destructive" : "bg-primary"}/>
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
