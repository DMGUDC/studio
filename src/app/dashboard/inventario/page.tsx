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
import { PlusCircle, FileDown, ArrowDownUp, Trash } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
  } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const initialInventoryItems = [
  { id: "inv1", name: "Tomates", category: "Vegetales", stock: 20, unit: "kg", threshold: 5, price: 1.50 },
  { id: "inv2", name: "Pechuga de Pollo", category: "Carnes", stock: 15, unit: "kg", threshold: 10, price: 8.00 },
  { id: "inv3", name: "Queso Mozzarella", category: "Lácteos", stock: 8, unit: "kg", threshold: 4, price: 7.50 },
  { id: "inv4", name: "Harina de Trigo", category: "Secos", stock: 50, unit: "kg", threshold: 20, price: 1.00 },
  { id: "inv5", name: "Aceite de Oliva", category: "Aceites", stock: 10, unit: "litros", threshold: 5, price: 12.00 },
  { id: "inv6", name: "Vino Tinto", category: "Bebidas", stock: 3, unit: "botellas", threshold: 5, price: 9.50 },
  { id: "inv7", name: "Servilletas", category: "No Alimentos", stock: 5, unit: "paquetes", threshold: 2, price: 2.00 },
  { id: "inv8", name: "Sal", category: "Condimentos", stock: 25, unit: "kg", threshold: 2, price: 0.50 },
];

type InventoryItem = typeof initialInventoryItems[0];
type SortKey = "name" | "category";
type NewProduct = Omit<InventoryItem, 'id'>;

function NewProductForm({ onSave }: { onSave: (product: NewProduct) => void; }) {
    const [product, setProduct] = useState<Partial<NewProduct>>({
        name: '',
        category: '',
        stock: 0,
        unit: '',
        threshold: 0,
        price: 0
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setProduct(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value,
        }));
    };

    const handleSave = () => {
        // Basic validation
        if (product.name && product.category && product.unit) {
            onSave(product as NewProduct);
        } else {
            // You might want to add better user feedback here
            alert("Por favor, completa todos los campos requeridos.");
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nombre del Producto</Label>
                    <Input id="name" name="name" value={product.name} onChange={handleInputChange} placeholder="Ej: Tomates" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="category">Categoría</Label>
                    <Input id="category" name="category" value={product.category} onChange={handleInputChange} placeholder="Ej: Vegetales" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="price">Precio por Unidad</Label>
                    <Input id="price" name="price" type="number" value={product.price || ''} onChange={handleInputChange} placeholder="Ej: 1.50" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="unit">Unidad</Label>
                    <Input id="unit" name="unit" value={product.unit} onChange={handleInputChange} placeholder="Ej: kg, litros, uds" />
                </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="stock">Stock Inicial</Label>
                    <Input id="stock" name="stock" type="number" value={product.stock || ''} onChange={handleInputChange} placeholder="Ej: 20" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="threshold">Umbral de Stock Bajo</Label>
                    <Input id="threshold" name="threshold" type="number" value={product.threshold || ''} onChange={handleInputChange} placeholder="Ej: 5" />
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button onClick={handleSave}>Guardar Producto</Button>
            </DialogFooter>
        </div>
    );
}

export default function InventarioPage() {
  const [inventoryItems, setInventoryItems] = useState(initialInventoryItems);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isNewProductModalOpen, setNewProductModalOpen] = useState(false);

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
  }, [searchTerm, sortKey, sortOrder, inventoryItems]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
        setSortKey(key);
        setSortOrder('asc');
    }
  }

  const handleSaveProduct = (product: NewProduct) => {
    const newProduct: InventoryItem = {
        id: `inv${Date.now()}`,
        ...product
    };
    setInventoryItems(prev => [...prev, newProduct]);
    setNewProductModalOpen(false);
  };

  const handleDeleteItem = (itemId: string) => {
    setInventoryItems(prev => prev.filter(item => item.id !== itemId));
  };


  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Gestión de Inventario</CardTitle>
            <CardDescription>
              Controla el stock y los costos de todos los productos de tu restaurante.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <FileDown className="mr-2 h-4 w-4" /> Exportar
            </Button>
            <Button onClick={() => setNewProductModalOpen(true)}>
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
              <TableHead>Precio/Unidad</TableHead>
              <TableHead>Stock Actual</TableHead>
              <TableHead>Nivel de Stock</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
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
                  <TableCell>${item.price.toFixed(2)} / {item.unit}</TableCell>
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
                  <TableCell>
                    {isLowStock ? (
                      <Badge variant="destructive">Bajo Stock</Badge>
                    ) : (
                      <Badge variant="outline">En Stock</Badge>
                    )}
                  </TableCell>
                   <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)}>
                            <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                   </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <Dialog open={isNewProductModalOpen} onOpenChange={setNewProductModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Nuevo Producto de Inventario</DialogTitle>
                <DialogDescription>Añade un nuevo producto al sistema de inventario.</DialogDescription>
            </DialogHeader>
            <NewProductForm onSave={handleSaveProduct} />
        </DialogContent>
    </Dialog>
    </>
  );
}
