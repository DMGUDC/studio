"use client";

import { useState, useRef, DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, PlusCircle, Users, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";

const initialFloors = {
  piso1: {
    name: "Piso Principal",
    tables: [
      { id: 1, name: "Mesa 1", status: "disponible", x: 10, y: 10, shape: "square" },
      { id: 2, name: "Mesa 2", status: "ocupada", x: 35, y: 10, people: 4, shape: "square" },
      { id: 3, name: "Mesa 3", status: "disponible", x: 60, y: 10, shape: "square" },
      { id: 4, name: "Mesa 4", status: "reservada", x: 10, y: 40, shape: "round" },
      { id: 5, name: "Mesa 5", status: "ocupada", x: 35, y: 40, people: 2, shape: "round" },
      { id: 6, name: "Barra 1", status: "ocupada", x: 85, y: 10, people: 1, shape: "square" },
      { id: 7, name: "Barra 2", status: "disponible", x: 85, y: 30, shape: "square" },
      { id: 8, name: "Mesa 8", status: "disponible", x: 10, y: 70, shape: "square" },
    ],
  },
  terraza: {
    name: "Terraza",
    tables: [
      { id: 9, name: "Terraza 1", status: "ocupada", x: 15, y: 20, people: 3, shape: "square" },
      { id: 10, name: "Terraza 2", status: "disponible", x: 45, y: 20, shape: "square" },
      { id: 11, name: "Terraza 3", status: "reservada", x: 75, y: 20, shape: "round" },
      { id: 12, name: "Terraza 4", status: "disponible", x: 15, y: 60, shape: "round" },
    ],
  },
};

type Table = typeof initialFloors.piso1.tables[0];
type Floors = typeof initialFloors;

const statusStyles = {
  disponible: "bg-green-500/20 border-green-600 text-green-800",
  ocupada: "bg-primary/20 border-primary text-primary-foreground",
  reservada: "bg-accent/20 border-accent text-accent-foreground",
};

const shapeStyles = {
    square: "w-24 h-24",
    round: "w-24 h-24 rounded-full",
}

export default function MesasPage() {
  const [floors, setFloors] = useState<Floors>(initialFloors);
  const [isEditing, setIsEditing] = useState(false);
  const dragInfo = useRef<{ floorKey: keyof Floors; tableId: number; offsetX: number; offsetY: number } | null>(null);
  const layoutRef = useRef<HTMLDivElement>(null);
  const [originalFloors, setOriginalFloors] = useState<Floors>(initialFloors);

  const handleEditToggle = () => {
    if(!isEditing) {
        setOriginalFloors(floors);
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

  const handleDragStart = (e: DragEvent<HTMLDivElement>, table: Table, floorKey: keyof Floors) => {
    if (!isEditing || !layoutRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const layoutRect = layoutRef.current.getBoundingClientRect();
    
    dragInfo.current = {
      floorKey,
      tableId: table.id,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    };
    e.dataTransfer.effectAllowed = 'move';
    // Use a transparent image to hide the default drag ghost
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    if (!isEditing) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, floorKey: keyof Floors) => {
    if (!isEditing || !dragInfo.current || !layoutRef.current) return;
    e.preventDefault();

    const { tableId, offsetX, offsetY } = dragInfo.current;
    const layoutRect = layoutRef.current.getBoundingClientRect();

    const newX = ((e.clientX - layoutRect.left - offsetX) / layoutRect.width) * 100;
    const newY = ((e.clientY - layoutRect.top - offsetY) / layoutRect.height) * 100;
    
    setFloors(prevFloors => {
        const newFloors = { ...prevFloors };
        const tables = newFloors[floorKey].tables.map(table => {
            if (table.id === tableId) {
                return { ...table, x: Math.max(0, Math.min(newX, 100 - (96 / layoutRect.width * 100))), y: Math.max(0, Math.min(newY, 100 - (96 / layoutRect.height * 100))) };
            }
            return table;
        });
        newFloors[floorKey] = { ...newFloors[floorKey], tables };
        return newFloors;
    });

    dragInfo.current = null;
  };

  return (
    <div className="flex h-full flex-col">
      <Tabs defaultValue="piso1" className="flex flex-1 flex-col">
        <div className="flex items-center justify-between gap-4">
          <TabsList>
            {Object.entries(floors).map(([key, floor]) => (
                <TabsTrigger key={key} value={key}>{floor.name}</TabsTrigger>
            ))}
          </TabsList>
          <div className="flex gap-2">
            {isEditing ? (
              <>
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
        
        {Object.entries(floors).map(([key, floor]) => (
            <TabsContent key={key} value={key} className="flex-1 mt-6">
                <Card className="h-full min-h-[60vh]">
                <CardContent 
                    ref={layoutRef}
                    className="relative h-full p-4"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, key as keyof Floors)}
                >
                    {floor.tables.map((table) => (
                    <div
                        key={table.id}
                        draggable={isEditing}
                        onDragStart={(e) => handleDragStart(e, table, key as keyof Floors)}
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