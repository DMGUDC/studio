"use client";

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, FileText, Split, PlusCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const ordersData = [
  {
    id: "ORD001",
    table: "Mesa 5",
    waiter: "Carlos",
    status: "Entregado",
    total: 42.5,
    timestamp: "hace 5 minutos",
    items: [
        { id: 'item1', name: 'Pizza Pepperoni', quantity: 1, price: 15.00 },
        { id: 'item2', name: 'Refresco', quantity: 2, price: 2.50 },
        { id: 'item3', name: 'Tiramisú', quantity: 1, price: 7.50 },
    ]
  },
  {
    id: "ORD002",
    table: "Mesa 2",
    waiter: "Ana",
    status: "Preparando",
    total: 89.9,
    timestamp: "hace 12 minutos",
    items: []
  },
  {
    id: "ORD003",
    table: "Terraza 1",
    waiter: "Carlos",
    status: "Listo",
    total: 12.0,
    timestamp: "hace 20 minutos",
    items: []
  },
  {
    id: "ORD004",
    table: "Mesa 8",
    waiter: "Sofia",
    status: "Pendiente",
    total: 30.0,
    timestamp: "hace 22 minutos",
    items: []
  },
  {
    id: "ORD005",
    table: "Mesa 3",
    waiter: "Ana",
    status: "Entregado",
    total: 55.75,
    timestamp: "hace 1 hora",
    items: []
  },
  {
    id: "ORD006",
    table: "Mesa 5",
    waiter: "Carlos",
    status: "Cancelado",
    total: 25.0,
    timestamp: "hace 2 horas",
    items: []
  },
];

type Order = typeof ordersData[0];
type OrderItem = typeof ordersData[0]['items'][0];

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  Entregado: "outline",
  Preparando: "secondary",
  Listo: "default",
  Pendiente: "destructive",
  Cancelado: "destructive",
};

const statusColor: { [key:string]: string} = {
    Listo: "bg-green-500 hover:bg-green-600 text-white",
}

function OrderDetailsDialog({ order, open, onOpenChange }: { order: Order | null, open: boolean, onOpenChange: (open: boolean) => void }) {
    if (!order) return null;
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Detalles del Pedido: {order.id}</DialogTitle>
                    <DialogDescription>Mesa: {order.table} | Mesero: {order.waiter}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    {order.items.length > 0 ? (
                         <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Cantidad</TableHead>
                                <TableHead>Producto</TableHead>
                                <TableHead className="text-right">Precio</TableHead>
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
                         </Table>
                    ) : (
                        <p className="text-muted-foreground text-center">No hay productos en este pedido.</p>
                    )}
                </div>
                <DialogFooter>
                    <div className="w-full flex justify-end font-bold text-lg">
                        Total: ${order.total.toFixed(2)}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function SplitBillDialog({ order, open, onOpenChange }: { order: Order | null, open: boolean, onOpenChange: (open: boolean) => void }) {
    const [splitWays, setSplitWays] = useState(2);
    const [selectedItems, setSelectedItems] = useState<Record<string, number[]>>({});

    if (!order) return null;
    
    const handleItemSelection = (item: OrderItem, personIndex: number) => {
        setSelectedItems(prev => {
            const currentSelections = prev[item.id] || [];
            if (currentSelections.includes(personIndex)) {
                return {...prev, [item.id]: currentSelections.filter(i => i !== personIndex)}
            } else {
                return {...prev, [item.id]: [...currentSelections, personIndex]}
            }
        });
    }

    const totals = Array.from({length: splitWays}, (_, i) => {
        return order.items.reduce((acc, item) => {
            if (selectedItems[item.id]?.includes(i)) {
                return acc + item.price * item.quantity / selectedItems[item.id].length;
            }
            return acc;
        }, 0);
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Dividir Cuenta: {order.id}</DialogTitle>
                    <DialogDescription>Asigna productos a cada persona para dividir el total.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                    <div className="md:col-span-1">
                        <Label>Dividir entre</Label>
                        <Input type="number" value={splitWays} onChange={e => setSplitWays(Math.max(1, parseInt(e.target.value) || 1))} min="1" className="mt-2" />
                        <div className="mt-4 space-y-2">
                            <h4 className="font-semibold">Totales por persona:</h4>
                            {totals.map((total, i) => (
                                <div key={i} className="flex justify-between p-2 rounded-md bg-muted">
                                    <span>Persona {i + 1}:</span>
                                    <span className="font-bold">${total.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <h4 className="font-semibold mb-2">Productos del Pedido:</h4>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                        {order.items.map(item => (
                            <Card key={item.id}>
                                <CardContent className="p-3">
                                    <div className="flex justify-between">
                                      <p className="font-medium">{item.name} ({item.quantity}x)</p>
                                      <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                    <div className="text-xs text-muted-foreground">Asignar a:</div>
                                    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                                        {Array.from({ length: splitWays }, (_, i) => (
                                            <div key={i} className="flex items-center space-x-2">
                                                <Checkbox id={`${item.id}-p${i}`} onCheckedChange={() => handleItemSelection(item, i)} />
                                                <Label htmlFor={`${item.id}-p${i}`} className="text-sm">Persona {i+1}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button>Confirmar División</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function PedidosPage() {
  const [orders, setOrders] = useState(ordersData);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setDetailsOpen] = useState(false);
  const [isSplitBillOpen, setSplitBillOpen] = useState(false);

  const handleShowDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  }
  
  const handleSplitBill = (order: Order) => {
    setSelectedOrder(order);
    setSplitBillOpen(true);
  }

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <CardTitle>Gestión de Pedidos</CardTitle>
                <CardDescription>
                Visualiza y gestiona todos los pedidos del restaurante.
                </CardDescription>
            </div>
            <div className="flex gap-2">
                <Input placeholder="Buscar pedido..." className="max-w-xs" />
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Pedido
                </Button>
            </div>
        </div>

      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pedido ID</TableHead>
              <TableHead>Mesa</TableHead>
              <TableHead>Mesero</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Creación</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.table}</TableCell>
                <TableCell>{order.waiter}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[order.status]} className={cn(statusColor[order.status])}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>{order.timestamp}</TableCell>
                <TableCell className="text-right">
                  ${order.total.toFixed(2)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleShowDetails(order)}>
                        <FileText className="mr-2 h-4 w-4" />
                        Ver Detalles
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSplitBill(order)}>
                        <Split className="mr-2 h-4 w-4" />
                        Dividir Cuenta
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    <OrderDetailsDialog order={selectedOrder} open={isDetailsOpen} onOpenChange={setDetailsOpen} />
    <SplitBillDialog order={selectedOrder} open={isSplitBillOpen} onOpenChange={setSplitBillOpen} />
    </>
  );
}
