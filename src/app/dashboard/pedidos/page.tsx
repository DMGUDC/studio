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
import { MoreHorizontal, FileText, PlusCircle } from "lucide-react";
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

export default function PedidosPage() {
  const [orders, setOrders] = useState(ordersData);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setDetailsOpen] = useState(false);

  const handleShowDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
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
    </>
  );
}
