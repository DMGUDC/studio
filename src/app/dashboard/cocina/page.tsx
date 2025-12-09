"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import { Timer, User, BookOpen } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useRestaurant } from "@/context/RestaurantContext";
import type { Order, SubRecipe } from "@/lib/types";


const getSubRecipeStatusVariant = (status: SubRecipe["status"]) => {
  switch (status) {
    case "Pendiente":
      return "destructive";
    case "Preparando":
      return "secondary";
    case "Listo":
      return "default";
    default:
      return "outline";
  }
};

function OrderTicket({
  order,
  onSubRecipeStatusChange,
  onAssignCook,
  onShowSubRecipe,
}: {
  order: Order;
  onSubRecipeStatusChange: (
    orderId: string,
    itemId: string,
    subRecipeId: string,
    status: SubRecipe["status"]
  ) => void;
  onAssignCook: (
    orderId: string,
    itemId: string,
    subRecipeId: string,
    cookId: string
  ) => void;
  onShowSubRecipe: (subRecipe: SubRecipe) => void;
}) {
  const [remainingTime, setRemainingTime] = useState("");
  const [urgencyColor, setUrgencyColor] = useState("border-border");
  const { cooks } = useRestaurant();

  const totalPrepTime = order.items.reduce(
    (total, item) =>
      total +
      item.subRecipes.reduce((itemTotal, sr) => itemTotal + sr.prepTime, 0),
    0
  );
  const deadline = order.createdAt + totalPrepTime * 60 * 1000;

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const timeLeft = deadline - now;
      
      if (timeLeft <= 0) {
        setRemainingTime("00:00");
        setUrgencyColor("border-red-500 bg-red-500/10");
        return;
      }

      const minutes = Math.floor(timeLeft / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
      setRemainingTime(
        `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );

      const percentageLeft = (timeLeft / (totalPrepTime * 60 * 1000)) * 100;
      if (percentageLeft < 25) {
        setUrgencyColor("border-red-500 bg-red-500/10");
      } else if (percentageLeft < 50) {
        setUrgencyColor("border-yellow-500 bg-yellow-500/10");
      } else {
        setUrgencyColor("border-green-500 bg-green-500/10");
      }

    }, 1000);
    return () => clearInterval(timer);
  }, [order.createdAt, totalPrepTime, deadline]);


  const handleStatusChange = (
    itemId: string,
    subRecipeId: string,
    currentStatus: SubRecipe["status"]
  ) => {
    const nextStatus: SubRecipe["status"] | null =
      currentStatus === "Pendiente"
        ? "Preparando"
        : currentStatus === "Preparando"
        ? "Listo"
        : null;
    if (nextStatus) {
      onSubRecipeStatusChange(order.id, itemId, subRecipeId, nextStatus);
    }
  };

  return (
    <Card className={cn("flex flex-col", urgencyColor)}>
      <CardHeader className="flex-row items-center justify-between space-y-0 p-3 bg-muted/50">
        <CardTitle className="text-lg font-headline">{order.table}</CardTitle>
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Timer className="h-4 w-4" />
          {remainingTime}
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        {order.items.map((item, index) => (
          <div key={`${item.name}-${index}`} className="p-3">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="font-bold">{item.name}</span>
                {item.notes && (
                  <p className="text-xs text-muted-foreground">
                    Nota: {item.notes}
                  </p>
                )}
              </div>
              <Badge variant="secondary" className="text-base">
                x{item.quantity}
              </Badge>
            </div>
            <div className="space-y-2">
              {item.subRecipes.map((sr) => (
                <div
                  key={sr.id}
                  className="flex items-center gap-2 p-2 rounded-md bg-background"
                >
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{sr.name} ({sr.prepTime} min)</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={getSubRecipeStatusVariant(sr.status)}>
                        {sr.status}
                      </Badge>
                      <Select
                        value={sr.assignedCook}
                        onValueChange={(cookId) =>
                          onAssignCook(order.id, item.id, sr.id, cookId)
                        }
                        disabled={sr.status !== "Pendiente"}
                      >
                        <SelectTrigger className="h-7 text-xs w-auto gap-1 pl-2 pr-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <SelectValue placeholder="Asignar..." />
                        </SelectTrigger>
                        <SelectContent>
                          {cooks.map((cook) => (
                            <SelectItem key={cook.id} value={cook.id}>
                              {cook.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onShowSubRecipe(sr)}>
                        <BookOpen className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {sr.status !== "Listo" && (
                    <Button
                      size="sm"
                      variant={sr.status === "Pendiente" ? "outline" : "default"}
                      onClick={() =>
                        handleStatusChange(item.id, sr.id, sr.status)
                      }
                      disabled={sr.status === 'Pendiente' && !sr.assignedCook}
                      className={cn(
                        sr.status === "Preparando" &&
                          "bg-green-600 hover:bg-green-700 text-white"
                      )}
                    >
                      {sr.status === "Pendiente" ? "Empezar" : "Listo"}
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {index < order.items.length - 1 && <Separator className="mt-3" />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function CocinaPage() {
  const { orders, setOrders } = useRestaurant();
  const [selectedSubRecipe, setSelectedSubRecipe] = useState<SubRecipe | null>(null);
  const [isDetailsOpen, setDetailsOpen] = useState(false);

  const updateSubRecipe = (
    orderId: string,
    itemId: string,
    subRecipeId: string,
    updates: Partial<SubRecipe>
  ): void => {
    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id !== orderId) return order;

        const updatedItems = order.items.map((item) => {
          if (item.id !== itemId) return item;

          const updatedSubRecipes = item.subRecipes.map((sr) =>
            sr.id === subRecipeId ? { ...sr, ...updates } : sr
          );
          return { ...item, subRecipes: updatedSubRecipes };
        });

        return { ...order, items: updatedItems };
      })
    );
  };

  const handleAssignCook = (
    orderId: string,
    itemId: string,
    subRecipeId: string,
    cookId: string
  ) => {
    updateSubRecipe(orderId, itemId, subRecipeId, { assignedCook: cookId });
  };

  const handleSubRecipeStatusChange = (
    orderId: string,
    itemId: string,
    subRecipeId: string,
    status: SubRecipe["status"]
  ) => {
    updateSubRecipe(orderId, itemId, subRecipeId, { status });
  };
  
  const handleShowSubRecipe = (subRecipe: SubRecipe) => {
    setSelectedSubRecipe(subRecipe);
    setDetailsOpen(true);
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setOrders((prevOrders) => {
        return prevOrders
          .map((order) => {
            const allSubRecipesDone = order.items.every((item) =>
              item.subRecipes.every((sr) => sr.status === "Listo")
            );
            if (allSubRecipesDone) {
              return null; // This order will be filtered out
            }
            return order;
          })
          .filter((order): order is Order => order !== null);
      });
    }, 2000); // Check every 2 seconds if an order is complete

    return () => clearInterval(interval);
  }, [setOrders]);

  const activeOrders = orders.filter(order => order.status !== 'Entregado' && order.status !== 'Cancelado');

  return (
    <div className="h-full">
      <h2 className="text-2xl font-headline mb-4 text-center">
        Platillos ({activeOrders.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-max">
        {activeOrders
          .sort((a, b) => a.createdAt - b.createdAt)
          .map((order) => (
            <OrderTicket
              key={order.id}
              order={order}
              onSubRecipeStatusChange={handleSubRecipeStatusChange}
              onAssignCook={handleAssignCook}
              onShowSubRecipe={handleShowSubRecipe}
            />
          ))}
      </div>
      <Dialog open={isDetailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{selectedSubRecipe?.name}</DialogTitle>
                <DialogDescription>
                    Pasos para la preparación:
                </DialogDescription>
            </DialogHeader>
            <p className="py-4 text-sm">{selectedSubRecipe?.description}</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
