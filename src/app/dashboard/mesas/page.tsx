"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, PlusCircle, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const floors = {
  piso1: {
    name: "Piso Principal",
    tables: [
      { id: 1, name: "Mesa 1", status: "disponible", x: "10%", y: "10%", shape: "square" },
      { id: 2, name: "Mesa 2", status: "ocupada", x: "35%", y: "10%", people: 4, shape: "square" },
      { id: 3, name: "Mesa 3", status: "disponible", x: "60%", y: "10%", shape: "square" },
      { id: 4, name: "Mesa 4", status: "reservada", x: "10%", y: "40%", shape: "round" },
      { id: 5, name: "Mesa 5", status: "ocupada", x: "35%", y: "40%", people: 2, shape: "round" },
      { id: 6, name: "Barra 1", status: "ocupada", x: "85%", y: "10%", people: 1, shape: "square", size: "small" },
      { id: 7, name: "Barra 2", status: "disponible", x: "85%", y: "30%", shape: "square", size: "small" },
      { id: 8, name: "Mesa 8", status: "disponible", x: "10%", y: "70%", shape: "large_square" },
    ],
  },
  terraza: {
    name: "Terraza",
    tables: [
      { id: 9, name: "Terraza 1", status: "ocupada", x: "15%", y: "20%", people: 3, shape: "square" },
      { id: 10, name: "Terraza 2", status: "disponible", x: "45%", y: "20%", shape: "square" },
      { id: 11, name: "Terraza 3", status: "reservada", x: "75%", y: "20%", shape: "round" },
      { id: 12, name: "Terraza 4", status: "disponible", x: "15%", y: "60%", shape: "round" },
    ],
  },
};

const statusStyles = {
  disponible: "bg-green-500/20 border-green-600 text-green-800",
  ocupada: "bg-primary/20 border-primary text-primary-foreground",
  reservada: "bg-accent/20 border-accent text-accent-foreground",
};

const shapeStyles = {
    square: "w-24 h-24",
    round: "w-24 h-24 rounded-full",
    large_square: "w-32 h-32",
    small: "w-16 h-16"
}

export default function MesasPage() {
  return (
    <div className="flex h-full flex-col">
      <Tabs defaultValue="piso1" className="flex flex-1 flex-col">
        <div className="flex items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="piso1">Piso Principal</TabsTrigger>
            <TabsTrigger value="terraza">Terraza</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Editar Plano
            </Button>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Piso
            </Button>
          </div>
        </div>
        
        {Object.entries(floors).map(([key, floor]) => (
            <TabsContent key={key} value={key} className="flex-1 mt-6">
                <Card className="h-full min-h-[60vh]">
                <CardContent className="relative h-full p-4">
                    {floor.tables.map((table) => (
                    <div
                        key={table.id}
                        className={cn(
                        "absolute flex cursor-pointer flex-col items-center justify-center border-2 shadow-sm transition-transform hover:scale-105",
                        shapeStyles[table.shape as keyof typeof shapeStyles],
                        statusStyles[table.status as keyof typeof statusStyles],
                        table.status === 'ocupada' && 'bg-primary text-primary-foreground'
                        )}
                        style={{ left: table.x, top: table.y }}
                    >
                        <span className="font-bold">{table.name}</span>
                        <span className="text-xs capitalize">{table.status}</span>
                        {table.status === "ocupada" && (
                        <div className="mt-1 flex items-center text-xs">
                            <Users className="mr-1 h-3 w-3" />
                            {table.people}
                        </div>
                        )}
                    </div>
                    ))}
                </CardContent>
                </Card>
            </TabsContent>
        ))}

      </Tabs>
    </div>
  );
}
