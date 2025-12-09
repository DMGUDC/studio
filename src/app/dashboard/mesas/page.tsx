
"use client";

import { useState, useRef, DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, PlusCircle, Users, Save, X, Square, Circle, CreditCard, Wallet, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
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
  } from '@/components/ui/dialog';
import { Table as UiTable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRestaurant } from "@/context/RestaurantContext";
import type { Order, PaymentMethod } from "@/lib/types";

const initialFloors = {
  piso1: {
    name: "Piso Principal",
    tables: [
      { id: 1, name: "Mesa 1", status: "disponible", x: 10, y: 10, shape: "square" },
      { id: 2, name: "Mesa 2", status: "ocupada", x: 35, y: 10, people: 4, shape: "square", orderId: "ORD002" },
      { id: 3, name: "Mesa 3", status: "disponible", x: 60, y: 10, shape: "square" },
      { id: 4, name: "Mesa 4", status: "reservada", x: 10, y: 40, shape: "round" },
      { id: 5, name: "Mesa 5", status: "ocupada", x: 35, y: 40, people: 2, shape: "round", orderId: "ORD001" },
      { id: 6, name: "Barra 1", status: "ocupada", x: 85, y: 10, people: 1, shape: "square" },
      { id: 7, name: "Barra 2", status: "disponible", x: 85, y: 30, shape: "square" },
      { id: 8, name: "Mesa 8", status: "ocupada", x: 10, y: 70, shape: "square", orderId: "ORD004" },
    ],
  },
  terraza: {
    name: "Terraza",
    tables: [
      { id: 9, name: "Terraza 1", status: "ocupada", x: 15, y: 20, people: 3, shape: "square", orderId: "ORD003" },
      { id: 10, name: "Terraza 2", status: "disponible", x: 45, y: 20, shape: "square" },
      { id: 11, name: "Terraza 3", status: "reservada", x: 75, y: 20, shape: "round" },
      { id: 12, name: "Terraza 4", status: "disponible", x: 15, y: 60, shape: "round" },
    ],
  },
};

type Table = typeof initialFloors.piso1.tables[0];
type Floors = typeof initialFloors;
type FloorKey = keyof Floors;

const statusStyles = {
  disponible: "bg-green-500/20 border-green-600 text-green-800",
  ocupada: "bg-primary/20 border-primary text-primary-foreground",
  reservada: "bg-accent/20 border-accent text-accent-foreground",
};

const shapeStyles = {
    square: "w-24 h-24",
    round: "w-24 h-24 rounded-full",
}

function TableDetailsDialog({ table, order, open, onOpenChange, onSettle }: { table: Table | null, order: Order | null, open: boolean, onOpenChange: (open: boolean) => void, onSettle: (orderId: string, paymentMethod: PaymentMethod) => void }) {
    const [showPaymentOptions, setShowPaymentOptions] = useState(false);
    
    if (!table || !order) return null;

    const handleSettle = (method: PaymentMethod) => {
        onSettle(order.id, method);
        onOpenChange(false);
        setShowPaymentOptions(false);
    }
    
    return (
        <Dialog open={open} onOpenChange={(isOpen) => { onOpenChange(isOpen); if(!isOpen) setShowPaymentOptions(false); }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Detalles de {table.name}</DialogTitle>
                    <DialogDescription>Pedido: {order.id} | Mesero: {order.waiter}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <UiTable>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Cant.</TableHead>
                                <TableHead>Producto</TableHead>
                                <TableHead className="text-right">Subtotal</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {order.items.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.quantity}x</TableCell>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell className="text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </UiTable>
                    <div className="text-right font-bold text-lg pr-4">Total: ${order.total.toFixed(2)}</div>
                </div>
                <DialogFooter>
                    {showPaymentOptions ? (
                         <div className="w-full flex flex-col sm:flex-row justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowPaymentOptions(false)}>Atrás</Button>
                            <Button onClick={() => handleSettle("Efectivo")}><Wallet className="mr-2 h-4 w-4"/>Efectivo</Button>
                            <Button onClick={() => handleSettle("Tarjeta")}><CreditCard className="mr-2 h-4 w-4"/>Tarjeta</Button>
                            <Button onClick={() => handleSettle("Otro")}><Landmark className="mr-2 h-4 w-4"/>Otro</Button>
                         </div>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
                            <Button onClick={() => setShowPaymentOptions(true)}>Cobrar y Cerrar</Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function MesasPage() {
  const [floors, setFloors] = useState<Floors>(initialFloors);
  const [selectedFloor, setSelectedFloor] = useState<FloorKey>("piso1");
  const [isEditing, setIsEditing] = useState(false);
  const dragInfo = useRef<{ tableId: number; offsetX: number; offsetY: number } | null>(null);
  const layoutRef = useRef<HTMLDivElement>(null);
  const [originalFloors, setOriginalFloors] = useState<Floors>(initialFloors);

  const { orders, settleOrder } = useRestaurant();
  const [isDetailsOpen, setDetailsOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const handleEditToggle = () => {
    if(!isEditing) {
        setOriginalFloors(JSON.parse(JSON.stringify(floors))); // Deep copy
    }
    setIsEditing(!isEditing);
  };
  
  const handleCancelEdit = () => {
      setFloors(originalFloors);
      setIsEditing(false);
  }

  const handleSave = () => {
    setIsEditing(false);
    // Here you could persist the new layout
    console.log("Layout guardado:", floors);
  };

  const handleTableClick = (table: Table) => {
    if (isEditing) return;
    if (table.status === 'ocupada' && table.orderId) {
        setSelectedTable(table);
        setDetailsOpen(true);
    }
  }

  const handleSettleTable = (orderId: string, paymentMethod: PaymentMethod) => {
    settleOrder(orderId, paymentMethod);
    // Update table status in the local state of this component
    setFloors(prevFloors => {
        const newFloors = { ...prevFloors };
        const tables = newFloors[selectedFloor].tables.map(table => {
            if (table.orderId === orderId) {
                const { orderId, people, ...rest } = table;
                return { ...rest, status: 'disponible' as const };
            }
            return table;
        });
        newFloors[selectedFloor] = { ...newFloors[selectedFloor], tables };
        return newFloors;
    });
  }


  const handleDragStart = (e: DragEvent<HTMLDivElement>, table: Table) => {
    if (!isEditing || !layoutRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    
    dragInfo.current = {
      tableId: table.id,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    };
    e.dataTransfer.effectAllowed = 'move';
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    if (!isEditing) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    if (!isEditing || !dragInfo.current || !layoutRef.current) return;
    e.preventDefault();

    const { tableId, offsetX, offsetY } = dragInfo.current;
    const layoutRect = layoutRef.current.getBoundingClientRect();

    const newX = ((e.clientX - layoutRect.left - offsetX) / layoutRect.width) * 100;
    const newY = ((e.clientY - layoutRect.top - offsetY) / layoutRect.height) * 100;
    
    setFloors(prevFloors => {
        const newFloors = { ...prevFloors };
        const tables = newFloors[selectedFloor].tables.map(table => {
            if (table.id === tableId) {
                return { ...table, x: Math.max(0, Math.min(newX, 100 - (96 / layoutRect.width * 100))), y: Math.max(0, Math.min(newY, 100 - (96 / layoutRect.height * 100))) };
            }
            return table;
        });
        newFloors[selectedFloor] = { ...newFloors[selectedFloor], tables };
        return newFloors;
    });

    dragInfo.current = null;
  };
  
  const addTable = (shape: 'square' | 'round') => {
      const newTable: Omit<Table, 'orderId' | 'people'> = {
          id: Date.now(),
          name: `Mesa ${floors[selectedFloor].tables.length + 1}`,
          status: 'disponible',
          x: 5,
          y: 5,
          shape: shape
      };

      setFloors(prev => ({
          ...prev,
          [selectedFloor]: {
              ...prev[selectedFloor],
              tables: [...prev[selectedFloor].tables, newTable]
          }
      }))
  }

  const currentFloor = floors[selectedFloor];
  const selectedOrder = orders.find(o => o.id === selectedTable?.orderId);

  return (
    <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-4">
            <Select value={selectedFloor} onValueChange={(val) => setSelectedFloor(val as FloorKey)}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Seleccionar piso" />
                </SelectTrigger>
                <SelectContent>
                {Object.entries(floors).map(([key, floor]) => (
                    <SelectItem key={key} value={key}>{floor.name}</SelectItem>
                ))}
                </SelectContent>
            </Select>

            <div className="flex gap-2">
            {isEditing ? (
              <>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Añadir Mesa
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => addTable('square')}>
                            <Square className="mr-2 h-4 w-4" /> Cuadrada
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => addTable('round')}>
                             <Circle className="mr-2 h-4 w-4" /> Redonda
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline" onClick={handleCancelEdit}>
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleEditToggle}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar Plano
                </Button>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Añadir Piso
                </Button>
              </>
            )}
          </div>
        </div>
        
        <div className="flex-1 mt-6">
            <Card className="h-full min-h-[60vh]">
            <CardContent 
                ref={layoutRef}
                className="relative h-full p-4"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                {currentFloor.tables.map((table) => (
                <div
                    key={table.id}
                    draggable={isEditing}
                    onDragStart={(e) => handleDragStart(e, table)}
                    onClick={() => handleTableClick(table)}
                    className={cn(
                    "absolute flex flex-col items-center justify-center border-2 shadow-sm transition-transform",
                     isEditing ? "cursor-move hover:scale-105" : "cursor-pointer",
                    shapeStyles[table.shape as keyof typeof shapeStyles] || shapeStyles.square,
                    statusStyles[table.status as keyof typeof statusStyles],
                    table.status === 'ocupada' && 'bg-primary text-primary-foreground'
                    )}
                    style={{ left: `${table.x}%`, top: `${table.y}%` }}
                >
                    <span className="font-bold">{table.name}</span>
                    <span className="text-xs capitalize">{table.status}</span>
                    {table.status === "ocupada" && table.people && (
                    <div className="mt-1 flex items-center text-xs">
                        <Users className="mr-1 h-3 w-3" />
                        {table.people}
                    </div>
                    )}
                </div>
                ))}
            </CardContent>
            </Card>
        </div>
        <TableDetailsDialog
            table={selectedTable}
            order={selectedOrder || null}
            open={isDetailsOpen}
            onOpenChange={setDetailsOpen}
            onSettle={handleSettleTable}
        />
    </div>
  );
}
