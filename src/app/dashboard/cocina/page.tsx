"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Timer } from "lucide-react";

type OrderItem = {
  name: string;
  quantity: number;
  notes?: string;
};

type Order = {
  id: string;
  table: string;
  status: "Pendiente" | "Preparando" | "Listo";
  items: OrderItem[];
  createdAt: number;
};

const initialOrders: Order[] = [
  {
    id: "ORD002",
    table: "Mesa 2",
    status: "Pendiente",
    items: [
      { name: "Pizza Margherita", quantity: 1 },
      { name: "Ensalada César", quantity: 1, notes: "Sin crutones" },
    ],
    createdAt: Date.now() - 2 * 60 * 1000,
  },
  {
    id: "ORD003",
    table: "Terraza 1",
    status: "Preparando",
    items: [{ name: "Pasta Carbonara", quantity: 2 }],
    createdAt: Date.now() - 5 * 60 * 1000,
  },
  {
    id: "ORD004",
    table: "Mesa 8",
    status: "Pendiente",
    items: [
        { name: "Hamburguesa XChef", quantity: 1, notes: "Poco hecha" },
        { name: "Papas Fritas", quantity: 1 },
        { name: "Refresco", quantity: 1 },
    ],
    createdAt: Date.now() - 8 * 60 * 1000,
  },
];


function OrderTicket({ order, onStatusChange }: { order: Order; onStatusChange: (id: string, status: Order["status"]) => void; }) {
    const [elapsedTime, setElapsedTime] = useState("");

    useEffect(() => {
        const timer = setInterval(() => {
            const seconds = Math.floor((Date.now() - order.createdAt) / 1000);
            const minutes = Math.floor(seconds / 60);
            const displaySeconds = seconds % 60;
            setElapsedTime(`${minutes.toString().padStart(2, '0')}:${displaySeconds.toString().padStart(2, '0')}`);
        }, 1000);
        return () => clearInterval(timer);
    }, [order.createdAt]);

    const urgencyColor = () => {
        const minutes = Math.floor((Date.now() - order.createdAt) / (1000 * 60));
        if (minutes > 10) return "border-red-500 bg-red-500/10";
        if (minutes > 5) return "border-yellow-500 bg-yellow-500/10";
        return "border-border";
    }

    return (
        <Card className={cn("flex flex-col", urgencyColor())}>
            <CardHeader className="flex-row items-center justify-between space-y-0 p-4 bg-muted/50">
                <CardTitle className="text-lg font-headline">{order.table}</CardTitle>
                <div className="flex items-center gap-2 text-sm font-semibold">
                    <Timer className="h-4 w-4" />
                    {elapsedTime}
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-4 space-y-2">
                {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-start">
                        <div>
                            <span className="font-bold">{item.name}</span>
                            {item.notes && <p className="text-xs text-muted-foreground">Nota: {item.notes}</p>}
                        </div>
                        <Badge variant="secondary" className="text-lg">x{item.quantity}</Badge>
                    </div>
                ))}
            </CardContent>
            <CardFooter className="p-2">
                {order.status === "Pendiente" && (
                    <Button className="w-full" onClick={() => onStatusChange(order.id, "Preparando")}>
                        Empezar a Preparar
                    </Button>
                )}
                {order.status === "Preparando" && (
                     <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => onStatusChange(order.id, "Listo")}>
                        Marcar como Listo
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}

export default function CocinaPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  const handleStatusChange = (id: string, status: Order["status"]) => {
    setOrders(prevOrders => {
        if(status === 'Listo') {
            return prevOrders.filter(order => order.id !== id);
        }
        return prevOrders.map(order => 
            order.id === id ? { ...order, status } : order
        );
    });
  };

  const pendingOrders = orders.filter(o => o.status === "Pendiente");
  const preparingOrders = orders.filter(o => o.status === "Preparando");

  return (
    <div className="flex h-full gap-6">
        <div className="w-1/2 h-full">
            <h2 className="text-2xl font-headline mb-4 text-center">Pendientes ({pendingOrders.length})</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 auto-rows-max">
                {pendingOrders.map(order => (
                    <OrderTicket key={order.id} order={order} onStatusChange={handleStatusChange} />
                ))}
            </div>
        </div>
        <div className="w-1/2 h-full border-l pl-6">
            <h2 className="text-2xl font-headline mb-4 text-center">En Preparación ({preparingOrders.length})</h2>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 auto-rows-max">
                {preparingOrders.map(order => (
                    <OrderTicket key={order.id} order={order} onStatusChange={handleStatusChange} />
                ))}
            </div>
        </div>
    </div>
  );
}
