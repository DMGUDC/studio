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
import { PlusCircle, FileDown, ArrowDownUp, Trash, Edit, MoreHorizontal, ShoppingCart, FileSpreadsheet, FileText } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel
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
import { useRestaurant } from "@/context/RestaurantContext";
import { apiInventario } from "@/services/api";
import type { InventoryItem } from "@/lib/types";

type ProductData = Omit<InventoryItem, 'id'>;

function RestockDialog({ item, onRestock, open, onOpenChange }: { item: InventoryItem | null, onRestock: (itemId: string, quantity: number) => void, open: boolean, onOpenChange: (open: boolean) => void }) {
    const [quantity, setQuantity] = useState(0);

    if (!item) return null;

    const totalCost = (quantity * item.price).toFixed(2);

    const handleSave = () => {
        if (quantity > 0) {
            onRestock(item.id, quantity);
            onOpenChange(false);
            setQuantity(0);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reabastecer: {item.name}</DialogTitle>
                    <DialogDescription>
                        Añade la cantidad de producto que ingresa al inventario. El costo se registrará como un gasto.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="quantity">Cantidad a añadir ({item.unit})</Label>
                        <Input 
                            id="quantity" 
                            type="number" 
                            value={quantity || ''} 
                            onChange={e => setQuantity(Number(e.target.value))} 
                            placeholder="Ej: 10" 
                        />
                    </div>
                     <div className="text-right font-medium">
                        <p>Costo por unidad: ${item.price.toFixed(2)}</p>
                        <p className="font-bold text-lg">Costo Total: ${totalCost}</p>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                    <Button onClick={handleSave}>Confirmar Reabastecimiento</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function ProductForm({ onSave, productToEdit }: { onSave: (product: ProductData) => void; productToEdit?: ProductData | null }) {
    const [product, setProduct] = useState<Partial<ProductData>>(productToEdit || {
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
            onSave(product as ProductData);
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
  const { inventoryItems, setInventoryItems, restockItem } = useRestaurant();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isProductModalOpen, setProductModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isRestockModalOpen, setRestockModalOpen] = useState(false);
  const [restockingItem, setRestockingItem] = useState<InventoryItem | null>(null);

  type SortKey = "name" | "category";

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
  
  const handleAddNew = () => {
    setEditingItem(null);
    setProductModalOpen(true);
  }

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setProductModalOpen(true);
  }

  const handleRestock = (item: InventoryItem) => {
    setRestockingItem(item);
    setRestockModalOpen(true);
  }

  const handleSaveProduct = async (product: ProductData) => {
    try {
        if(editingItem) {
            await apiInventario.actualizar(editingItem.id, {
                nombre: product.name,
                categoria: product.category,
                stock: product.stock,
                unidad: product.unit,
                umbral: product.threshold,
                precio: product.price,
            });
            setInventoryItems(prev => prev.map(item => item.id === editingItem.id ? { ...editingItem, ...product } : item));
        } else {
            const response = await apiInventario.crear({
                nombre: product.name,
                categoria: product.category,
                stock: product.stock,
                unidad: product.unit,
                umbral: product.threshold,
                precio: product.price,
            });
            const newProduct: InventoryItem = {
                id: response.producto?.id || `inv${Date.now()}`,
                ...product
            };
            setInventoryItems(prev => [...prev, newProduct]);
        }
    } catch (error) {
        console.error('Error al guardar producto:', error);
        // Fallback local
        if(editingItem) {
            setInventoryItems(prev => prev.map(item => item.id === editingItem.id ? { ...editingItem, ...product } : item));
        } else {
            const newProduct: InventoryItem = {
                id: `inv${Date.now()}`,
                ...product
            };
            setInventoryItems(prev => [...prev, newProduct]);
        }
    }
    setProductModalOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
        await apiInventario.eliminar(itemId);
    } catch (error) {
        console.error('Error al eliminar producto:', error);
    }
    setInventoryItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Función para exportar a CSV
  const handleExportCSV = () => {
    const headers = ['Producto', 'Categoría', 'Precio/Unidad', 'Stock Actual', 'Unidad', 'Umbral', 'Estado'];
    const rows = sortedAndFilteredItems.map(item => [
      item.name,
      item.category,
      `$${item.price.toFixed(2)}`,
      item.stock.toString(),
      item.unit,
      item.threshold.toString(),
      item.stock <= item.threshold ? 'Bajo Stock' : 'En Stock'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `inventario_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Función para exportar a PDF
  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Inventario - XChef</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px 8px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          tr:nth-child(even) { background-color: #fafafa; }
          .bajo-stock { color: #dc2626; font-weight: bold; }
          .en-stock { color: #16a34a; }
          .fecha { color: #666; font-size: 12px; margin-bottom: 20px; }
          @media print { body { print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <h1>Inventario - XChef Restaurante</h1>
        <p class="fecha">Generado el: ${new Date().toLocaleString('es-ES')}</p>
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Precio/Unidad</th>
              <th>Stock Actual</th>
              <th>Umbral</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${sortedAndFilteredItems.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td>$${item.price.toFixed(2)} / ${item.unit}</td>
                <td>${item.stock} ${item.unit}</td>
                <td>${item.threshold} ${item.unit}</td>
                <td class="${item.stock <= item.threshold ? 'bajo-stock' : 'en-stock'}">
                  ${item.stock <= item.threshold ? 'Bajo Stock' : 'En Stock'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <FileDown className="mr-2 h-4 w-4" /> Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleExportCSV}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> Exportar CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPDF}>
                  <FileText className="mr-2 h-4 w-4" /> Exportar PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={handleAddNew}>
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
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleEdit(item)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Editar</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleRestock(item)}>
                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                    <span>Reabastecer</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteItem(item.id)} className="text-destructive focus:text-destructive">
                                    <Trash className="mr-2 h-4 w-4" />
                                    <span>Eliminar</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                   </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <Dialog open={isProductModalOpen} onOpenChange={setProductModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{editingItem ? 'Editar Producto' : 'Nuevo Producto de Inventario'}</DialogTitle>
                <DialogDescription>
                    {editingItem ? 'Modifica los detalles de este producto.' : 'Añade un nuevo producto al sistema de inventario.'}
                </DialogDescription>
            </DialogHeader>
            <ProductForm onSave={handleSaveProduct} productToEdit={editingItem} />
        </DialogContent>
    </Dialog>
    <RestockDialog item={restockingItem} onRestock={restockItem} open={isRestockModalOpen} onOpenChange={setRestockModalOpen} />
    </>
  );
}
