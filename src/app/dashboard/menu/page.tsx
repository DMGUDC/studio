"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PlusCircle, MoreHorizontal, ChefHat, Utensils, Trash, Edit } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const dishes = [
  { id: "d1", name: "Pizza Margherita", category: "Pizzas", price: 12.50, subRecipeCount: 3 },
  { id: "d2", name: "Ensalada César", category: "Ensaladas", price: 8.00, subRecipeCount: 2 },
  { id: "d3", name: "Pasta Carbonara", category: "Pastas", price: 14.00, subRecipeCount: 4 },
  { id: "d4", name: "Hamburguesa XChef", category: "Hamburguesas", price: 11.50, subRecipeCount: 2 },
  { id: "d5", name: "Papas Fritas", category: "Acompañamientos", price: 4.00, subRecipeCount: 1 },
]

const subRecipes = [
    { id: "sr1", name: "Preparar masa", assignedTo: "Pizza Margherita" },
    { id: "sr2", name: "Añadir salsa y queso", assignedTo: "Pizza Margherita" },
    { id: "sr3", name: "Hornear", assignedTo: "Pizza Margherita" },
    { id: "sr4", name: "Lavar y cortar lechuga", assignedTo: "Ensalada César" },
    { id: "sr5", name: "Preparar aderezo", assignedTo: "Ensalada César" },
    { id: "sr6", name: "Hervir pasta", assignedTo: "Pasta Carbonara" },
    { id: "sr7", name: "Saltear panceta", assignedTo: "Pasta Carbonara" },
]

export default function MenuPage() {
  return (
    <Tabs defaultValue="dishes">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="dishes">
            <Utensils className="mr-2 h-4 w-4" />
            Platillos
          </TabsTrigger>
          <TabsTrigger value="subrecipes">
            <ChefHat className="mr-2 h-4 w-4" />
            Sub-Recetas
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="dishes" className="mt-4">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Gestión de Platillos</CardTitle>
                <CardDescription>Añade, edita y organiza los platillos de tu menú.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Input placeholder="Buscar platillo..." className="max-w-xs" />
                <Button><PlusCircle className="mr-2 h-4 w-4" /> Nuevo Platillo</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Sub-Recetas</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead><span className="sr-only">Acciones</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dishes.map((dish) => (
                  <TableRow key={dish.id}>
                    <TableCell className="font-medium">{dish.name}</TableCell>
                    <TableCell><Badge variant="outline">{dish.category}</Badge></TableCell>
                    <TableCell>{dish.subRecipeCount}</TableCell>
                    <TableCell className="text-right">${dish.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                           <DropdownMenuItem><Edit className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                           <DropdownMenuItem className="text-destructive focus:text-destructive"><Trash className="mr-2 h-4 w-4" /> Eliminar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="subrecipes" className="mt-4">
      <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Gestión de Sub-Recetas</CardTitle>
                <CardDescription>Define los pasos de preparación para cada platillo.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Input placeholder="Buscar sub-receta..." className="max-w-xs" />
                <Button><PlusCircle className="mr-2 h-4 w-4" /> Nueva Sub-Receta</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre de Sub-Receta</TableHead>
                  <TableHead>Asignada a Platillo</TableHead>
                  <TableHead><span className="sr-only">Acciones</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subRecipes.map((sr) => (
                  <TableRow key={sr.id}>
                    <TableCell className="font-medium">{sr.name}</TableCell>
                    <TableCell>{sr.assignedTo}</TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                           <DropdownMenuItem><Edit className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                           <DropdownMenuItem className="text-destructive focus:text-destructive"><Trash className="mr-2 h-4 w-4" /> Eliminar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
