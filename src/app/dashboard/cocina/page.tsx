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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Timer, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";

type Cook = {
  id: string;
  name: string;
};

type SubRecipe = {
  id: string;
  name: string;
  status: "Pendiente" | "Preparando" | "Listo";
  assignedCook?: string; // Cook ID
};

type OrderItem = {
  name: string;
  quantity: number;
  notes?: string;
  subRecipes: SubRecipe[];
};

type Order = {
  id: string;
  table: string;
  items: OrderItem[];
  createdAt: number;
};

const cooks: Cook[] = [
  { id: "cook1", name: "Juan" },
  { id: "cook2", name: "Maria" },
  { id: "cook3", name: "Pedro" },
];

const initialOrders: Order[] = [
  {
    id: "ORD002",
    table: "Mesa 2",
    items: [
      { 
        name: "Pizza Margherita", 
        quantity: 1, 
        subRecipes: [
          { id: "sr1", name: "Preparar masa", status: "Listo" },
          { id: "sr2", name: "Añadir salsa y queso", status: "Preparando", assignedCook: "cook1" },
          { id: "sr3", name: "Hornear", status: "Pendiente" },
        ]
      },
      { 
        name: "Ensalada César", 
        quantity: 1, 
        notes: "Sin crutones",
        subRecipes: [
          { id: "sr4", name: "Lavar y cortar lechuga", status: "Preparando", assignedCook: "cook2" },
          { id: "sr5", name: "Preparar aderezo", status: "Pendiente" },
        ]
      },
    ],
    createdAt: Date.now() - 2 * 60 * 1000,
  },
  {
    id: "ORD003",
    table: "Terraza 1",
    items: [{ 
      name: "Pasta Carbonara", 
      quantity: 2,
      subRecipes: [
        { id: "sr6", name: "Hervir pasta", status: "Listo" },
        { id: "sr7", name: "Saltear panceta", status: "Listo" },
        { id: "sr8", name: "Mezclar salsa", status: "Preparando", assignedCook: "cook1" },
        { id: "sr9", name: "Emplatar", status: "Pendiente" },
      ]
    }],
    createdAt: Date.now() - 5 * 60 * 1000,
  },
  {
    id: "ORD004",
    table: "Mesa 8",
    items: [
        { 
          name: "Hamburguesa XChef", 
          quantity: 1, 
          notes: "Poco hecha",
          subRecipes: [
            { id: "sr10", name: "Cocinar carne", status: "Preparando", assignedCook: "cook3" },
            { id: "sr11", name: "Montar hamburguesa", status: "Pendiente" },
          ]
        },
        { 
          name: "Papas Fritas", 
          quantity: 1,
          subRecipes: [
            { id: "sr12", name: "Freír papas", status: "Pendiente" }
          ]
        },
    ],
    createdAt: Date.now() - 8 * 60 * 1000,
  },
];

const getSubRecipeStatusVariant = (status: SubRecipe['status']) => {
  switch (status) {
    case 'Pendiente': return 'destructive';
    case 'Preparando': return 'secondary';
    case 'Listo': return 'default';
    default: return 'outline';
  }
}

function OrderTicket({ order, onSubRecipeStatusChange, onAssignCook }: { 
  order: Order; 
  onSubRecipeStatusChange: (orderId: string, itemId: string, subRecipeId: string, status: SubRecipe['status']) => void;
  onAssignCook: (orderId: string, itemId: string, subRecipeId: string, cookId: string) => void;
}) {
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
    
    const handleStatusChange = (itemId: string, subRecipeId: string, currentStatus: SubRecipe['status']) => {
        const nextStatus: SubRecipe['status'] | null = currentStatus === 'Pendiente' ? 'Preparando' : currentStatus === 'Preparando' ? 'Listo' : null;
        if(nextStatus) {
            onSubRecipeStatusChange(order.id, itemId, subRecipeId, nextStatus);
        }
    }

    return (
        <Card className={cn("flex flex-col", urgencyColor())}>
            <CardHeader className="flex-row items-center justify-between space-y-0 p-3 bg-muted/50">
                <CardTitle className="text-lg font-headline">{order.table}</CardTitle>
                <div className="flex items-center gap-2 text-sm font-semibold">
                    <Timer className="h-4 w-4" />
                    {elapsedTime}
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
                {order.items.map((item, index) => (
                    <div key={`${item.name}-${index}`} className="p-3">
                        <div className="flex justify-between items-start mb-2">
                           <div>
                             <span className="font-bold">{item.name}</span>
                             {item.notes && <p className="text-xs text-muted-foreground">Nota: {item.notes}</p>}
                           </div>
                           <Badge variant="secondary" className="text-base">x{item.quantity}</Badge>
                        </div>
                        <div className="space-y-2">
                          {item.subRecipes.map(sr => (
                            <div key={sr.id} className="flex items-center gap-2 p-2 rounded-md bg-background">
                              <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium">{sr.name}</p>
                                <div className="flex items-center gap-2">
                                  <Badge variant={getSubRecipeStatusVariant(sr.status)}>{sr.status}</Badge>
                                   <Select 
                                     value={sr.assignedCook}
                                     onValueChange={(cookId) => onAssignCook(order.id, item.name, sr.id, cookId)}
                                     disabled={sr.status === 'Listo'}
                                   >
                                    <SelectTrigger className="h-7 text-xs w-auto gap-1 pl-2 pr-1">
                                      <User className="h-3 w-3 text-muted-foreground" />
                                      <SelectValue placeholder="Asignar..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {cooks.map(cook => (
                                        <SelectItem key={cook.id} value={cook.id}>{cook.name}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                               {sr.status !== 'Listo' && (
                                <Button 
                                    size="sm" 
                                    variant={sr.status === 'Pendiente' ? 'outline' : 'default'}
                                    onClick={() => handleStatusChange(item.name, sr.id, sr.status)}
                                    className={cn(sr.status === 'Preparando' && 'bg-green-600 hover:bg-green-700 text-white')}
                                >
                                    {sr.status === 'Pendiente' ? 'Empezar' : 'Listo'}
                                </Button>
                               )}
                            </div>
                          ))}
                        </div>
                        {index < order.items.length - 1 && <Separator className="mt-3"/>}
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}


export default function CocinaPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  const updateSubRecipe = (orderId: string, itemId: string, subRecipeId: string, updates: Partial<SubRecipe>): void => {
    setOrders(prevOrders => 
        prevOrders.map(order => {
            if (order.id !== orderId) return order;

            const updatedItems = order.items.map(item => {
                if (item.name !== itemId) return item;

                const updatedSubRecipes = item.subRecipes.map(sr => 
                    sr.id === subRecipeId ? { ...sr, ...updates } : sr
                );
                return { ...item, subRecipes: updatedSubRecipes };
            });

            return { ...order, items: updatedItems };
        })
    );
  };
  
  const handleAssignCook = (orderId: string, itemId: string, subRecipeId: string, cookId: string) => {
    updateSubRecipe(orderId, itemId, subRecipeId, { assignedCook: cookId });
  };
  
  const handleSubRecipeStatusChange = (orderId: string, itemId: string, subRecipeId: string, status: SubRecipe['status']) => {
     updateSubRecipe(orderId, itemId, subRecipeId, { status });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prevOrders => {
        return prevOrders.map(order => {
          const allSubRecipesDone = order.items.every(item => item.subRecipes.every(sr => sr.status === 'Listo'));
          if (allSubRecipesDone) {
            return null; // This order will be filtered out
          }
          return order;
        }).filter((order): order is Order => order !== null);
      });
    }, 2000); // Check every 2 seconds if an order is complete

    return () => clearInterval(interval);
  }, []);

  const stationCooks: Record<string, Cook[]> = {
    "Platos Calientes": cooks.filter(c => ['cook1', 'cook3'].includes(c.id)),
    "Platos Fríos": cooks.filter(c => ['cook2'].includes(c.id)),
  }

  const getStationForSubRecipe = (subRecipeName: string): string => {
      const coldPrep = ["ensalada", "aderezo", "lechuga"];
      if (coldPrep.some(term => subRecipeName.toLowerCase().includes(term))) {
          return "Platos Fríos";
      }
      return "Platos Calientes";
  }
  
  const subRecipesByStation: Record<string, {order: Order, item: OrderItem, subRecipe: SubRecipe}[]> = {
      "Platos Calientes": [],
      "Platos Fríos": [],
  };

  orders.forEach(order => {
      order.items.forEach(item => {
          item.subRecipes.forEach(subRecipe => {
              if (subRecipe.status !== 'Listo') {
                const station = getStationForSubRecipe(subRecipe.name);
                subRecipesByStation[station].push({order, item, subRecipe});
              }
          })
      })
  })


  return (
    <div className="flex h-full gap-6">
      {Object.entries(subRecipesByStation).map(([stationName, stationSubRecipes]) => (
        <div key={stationName} className="w-1/2 h-full">
            <h2 className="text-2xl font-headline mb-4 text-center">{stationName} ({stationSubRecipes.length})</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 auto-rows-max">
                {orders.map(order => (
                     <OrderTicket 
                        key={order.id} 
                        order={order} 
                        onSubRecipeStatusChange={handleSubRecipeStatusChange}
                        onAssignCook={handleAssignCook}
                    />
                ))}
            </div>
        </div>
      ))}
    </div>
  );
}
