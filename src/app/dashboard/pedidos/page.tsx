
"use client";

import React, { useState, useMemo, useEffect } from 'react';
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
import { MoreHorizontal, FileText, PlusCircle, Trash, CheckCircle, Edit, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useRestaurant } from '@/context/RestaurantContext';
import type { Order, OrderItem, NewOrderData, EditedOrderData } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';


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

function NewOrderDialog({ open, onOpenChange, onSave, onUpdate, orderToEdit }: { open: boolean, onOpenChange: (open: boolean) => void, onSave: (order: NewOrderData) => void, onUpdate: (order: EditedOrderData) => void, orderToEdit?: Order | null }) {
    const { tables, waiters, dishes } = useRestaurant();
    const [table, setTable] = useState('');
    const [waiter, setWaiter] = useState('');
    const [items, setItems] = useState<OrderItem[]>([]);
    const [selectedDish, setSelectedDish] = useState('');
    const [people, setPeople] = useState(1);

    useEffect(() => {
        if(orderToEdit) {
            setTable(orderToEdit.table);
            setWaiter(orderToEdit.waiter);
            setItems(orderToEdit.items);
            setPeople(orderToEdit.people || 1);
        } else {
            // Reset form when dialog is opened for a new order
            setTable('');
            setWaiter('');
            setItems([]);
            setSelectedDish('');
            setPeople(1);
        }
    }, [orderToEdit, open]);


    const addItem = () => {
        if (!selectedDish) return;
        const dishToAdd = dishes.find(d => d.id === selectedDish);
        if (!dishToAdd) return;
        
        const existingItem = items.find(item => item.id === dishToAdd.id);
        if (existingItem) {
            setItems(items.map(item => item.id === dishToAdd.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setItems([...items, { id: dishToAdd.id, name: dishToAdd.name, price: dishToAdd.price, quantity: 1, subRecipeIds: dishToAdd.subRecipeIds, subRecipes: [] }]);
        }
    };

    const removeItem = (itemId: string) => {
        setItems(items.filter(item => item.id !== itemId));
    };

    const total = useMemo(() => {
        return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }, [items]);

    const handleSave = () => {
        if (table && waiter && items.length > 0) {
            const orderData = { table, waiter, items, total, people };
            if (orderToEdit) {
                onUpdate({ ...orderData, id: orderToEdit.id });
            } else {
                onSave(orderData);
            }
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{orderToEdit ? 'Editar Pedido' : 'Nuevo Pedido'}</DialogTitle>
                    <DialogDescription>Completa los detalles del pedido.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Mesa</Label>
                            <Select value={table} onValueChange={setTable}>
                                <SelectTrigger><SelectValue placeholder="Seleccionar mesa..." /></SelectTrigger>
                                <SelectContent>
                                    {tables.map(t => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                             <Label>Mesero</Label>
                            <Select value={waiter} onValueChange={setWaiter}>
                                <SelectTrigger><SelectValue placeholder="Seleccionar mesero..." /></SelectTrigger>
                                <SelectContent>
                                    {waiters.map(w => <SelectItem key={w.id} value={w.name}>{w.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Personas en la mesa</Label>
                            <Input type="number" value={people} onChange={e => setPeople(Number(e.target.value) || 1)} min="1"/>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Añadir Platillo</Label>
                        <div className="flex gap-2">
                            <Select value={selectedDish} onValueChange={setSelectedDish}>
                                <SelectTrigger><SelectValue placeholder="Seleccionar platillo..." /></SelectTrigger>
                                <SelectContent>
                                    {dishes.map(d => <SelectItem key={d.id} value={d.id}>{d.name} - ${d.price.toFixed(2)}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Button onClick={addItem}><PlusCircle className="mr-2 h-4 w-4"/>Añadir</Button>
                        </div>
                    </div>

                    <Card>
                        <CardHeader><CardTitle>Items del Pedido</CardTitle></CardHeader>
                        <CardContent>
                            {items.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Cant.</TableHead>
                                            <TableHead>Producto</TableHead>
                                            <TableHead className="text-right">Subtotal</TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {items.map(item => (
                                            <TableRow key={item.id}>
                                                <TableCell>{item.quantity}x</TableCell>
                                                <TableCell>{item.name}</TableCell>
                                                <TableCell className="text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                                                <TableCell className='text-right'>
                                                    <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                                                        <Trash className='h-4 w-4 text-destructive' />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : <p className="text-sm text-muted-foreground text-center">Añade platillos al pedido.</p>}
                        </CardContent>
                         {items.length > 0 && (
                            <DialogFooter className="bg-muted/50 p-4 font-bold text-lg">
                                Total: ${total.toFixed(2)}
                            </DialogFooter>
                         )}
                    </Card>

                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                    <Button onClick={handleSave}>{orderToEdit ? 'Actualizar Pedido' : 'Guardar Pedido'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function PedidosPage() {
  const { orders, addOrder, updateOrder, updateOrderStatus, calculatePartialCost } = useRestaurant();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setDetailsOpen] = useState(false);
  const [isNewOrderOpen, setNewOrderOpen] = useState(false);

  const handleShowDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  }

  const handleOpenNewOrder = () => {
    setEditingOrder(null);
    setNewOrderOpen(true);
  }

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setNewOrderOpen(true);
  }

  const handleSaveOrder = (newOrderData: NewOrderData) => {
    addOrder(newOrderData);
    setNewOrderOpen(false);
  }

  const handleUpdateOrder = (editedOrderData: EditedOrderData) => {
    updateOrder(editedOrderData);
    setNewOrderOpen(false);
  }

  const handleMarkAsDelivered = (orderId: string) => {
    updateOrderStatus(orderId, 'Entregado');
  }

  const handleCancelOrder = (order: Order) => {
    const { adjustedTotal } = calculatePartialCost(order);
    
    if (adjustedTotal > 0) {
        // If there's a partial cost, we "settle" the order with that amount
        // but mark it as canceled. We use 'Otro' as payment method for tracking.
        updateOrderStatus(order.id, 'Cancelado', adjustedTotal);
    } else {
        // If no work was done, just cancel it without financial implications
        updateOrderStatus(order.id, 'Cancelado');
    }
  }

  return (
    <>
    <style jsx>{`
      @keyframes glow {
        0%, 100% { background-color: transparent; }
        50% { background-color: hsla(140, 80%, 85%, 0.5); }
      }
      .glow-listo {
        animation: glow 2s infinite;
      }
    `}</style>
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
                <Button onClick={handleOpenNewOrder}>
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
            {orders.map((order) => {
              const canModify = order.status === 'Pendiente' || order.status === 'Preparando';
              return (
              <TableRow 
                key={order.id}
                className={cn({ 'glow-listo': order.status === 'Listo' })}
              >
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.table}</TableCell>
                <TableCell>{order.waiter}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[order.status]} className={statusColor[order.status]}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                    {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true, locale: es })}
                </TableCell>
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
                       {canModify && (
                          <DropdownMenuItem onClick={() => handleEditOrder(order)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                          </DropdownMenuItem>
                       )}
                       {order.status === 'Listo' && (
                        <DropdownMenuItem onClick={() => handleMarkAsDelivered(order.id)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Marcar como Entregado
                        </DropdownMenuItem>
                       )}
                       {canModify && (
                          <DropdownMenuItem onClick={() => handleCancelOrder(order)} className="text-destructive focus:text-destructive">
                              <XCircle className="mr-2 h-4 w-4" />
                              Cancelar
                          </DropdownMenuItem>
                       )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )})}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    <OrderDetailsDialog order={selectedOrder} open={isDetailsOpen} onOpenChange={setDetailsOpen} />
    <NewOrderDialog open={isNewOrderOpen} onOpenChange={setNewOrderOpen} onSave={handleSaveOrder} onUpdate={handleUpdateOrder} orderToEdit={editingOrder} />
    </>
  );
}
