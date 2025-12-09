"use client"

import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { PlusCircle, MoreHorizontal, ChefHat, Utensils, Trash, Edit, Clock, Package } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

const initialDishes = [
  { id: "d1", name: "Pizza Margherita", category: "Pizzas", price: 12.50, subRecipeIds: ["sr1", "sr2", "sr3"] },
  { id: "d2", name: "Ensalada César", category: "Ensaladas", price: 8.00, subRecipeIds: ["sr4", "sr5"] },
  { id: "d3", name: "Pasta Carbonara", category: "Pastas", price: 14.00, subRecipeIds: ["sr6", "sr7", "sr8"] },
  { id: "d4", name: "Hamburguesa XChef", category: "Hamburguesas", price: 11.50, subRecipeIds: ["sr10", "sr11"] },
  { id: "d5", name: "Papas Fritas", category: "Acompañamientos", price: 4.00, subRecipeIds: ["sr12"] },
]

const initialInventoryItems = [
    { id: "inv1", name: "Tomates", unit: "kg" },
    { id: "inv2", name: "Pechuga de Pollo", unit: "kg" },
    { id: "inv3", name: "Queso Mozzarella", unit: "kg" },
    { id: "inv4", name: "Harina de Trigo", unit: "kg" },
    { id: "inv5", name: "Aceite de Oliva", unit: "litros" },
    { id: "inv6", name: "Vino Tinto", unit: "botellas" },
    { id: "inv7", name: "Servilletas", unit: "paquetes" },
    { id: "inv8", name: "Sal", unit: "kg" },
    { id: "inv9", name: "Levadura", unit: "g" },
    { id: "inv10", name: "Salsa de tomate", unit: "litros"},
    { id: "inv11", name: "Lechuga Romana", unit: "unidades"},
    { id: "inv12", name: "Yemas de huevo", unit: "unidades"},
    { id: "inv13", name: "Anchoas", unit: "latas"},
    { id: "inv14", name: "Ajo", unit: "cabezas"},
    { id: "inv15", name: "Mostaza", unit: "g"},
    { id: "inv16", name: "Pasta", unit: "kg"},
    { id: "inv17", name: "Panceta", unit: "kg"},
    { id: "inv18", name: "Queso Pecorino", unit: "kg"},
    { id: "inv19", name: "Carne de res", unit: "kg"},
    { id: "inv20", name: "Pan de hamburguesa", unit: "unidades"},
    { id: "inv21", name: "Papas", unit: "kg"},
];

const initialSubRecipes = [
    { id: "sr1", name: "Preparar masa", description: "Mezclar harina, agua, levadura y sal. Amasar durante 10 minutos.", prepTime: 10, ingredients: [{inventoryId: "inv4", quantity: 0.5}, {inventoryId: "inv9", quantity: 10}, {inventoryId: "inv8", quantity: 0.02}] },
    { id: "sr2", name: "Añadir salsa y queso", description: "Extender la salsa de tomate sobre la masa y espolvorear mozzarella rallada.", prepTime: 5, ingredients: [{inventoryId: "inv10", quantity: 0.1}, {inventoryId: "inv3", quantity: 0.2}] },
    { id: "sr3", name: "Hornear", description: "Hornear a 220°C durante 15 minutos o hasta que esté dorada.", prepTime: 15, ingredients: [] },
    { id: "sr4", name: "Lavar y cortar lechuga", description: "Lavar la lechuga romana y cortarla en trozos grandes.", prepTime: 5, ingredients: [{inventoryId: "inv11", quantity: 1}] },
    { id: "sr5", name: "Preparar aderezo", description: "Mezclar yemas de huevo, anchoas, ajo, mostaza y aceite.", prepTime: 7, ingredients: [{inventoryId: "inv12", quantity: 2}, {inventoryId: "inv13", quantity: 0.5}, {inventoryId: "inv14", quantity: 0.25}, {inventoryId: "inv15", quantity: 10}, {inventoryId: "inv5", quantity: 0.1}] },
    { id: "sr6", name: "Hervir pasta", description: "Cocinar la pasta al dente según las instrucciones del paquete.", prepTime: 12, ingredients: [{inventoryId: "inv16", quantity: 0.2}] },
    { id: "sr7", name: "Saltear panceta", description: "Cortar y saltear la panceta hasta que esté crujiente.", prepTime: 5, ingredients: [{inventoryId: "inv17", quantity: 0.1}] },
    { id: "sr8", name: "Mezclar salsa", description: "Batir huevos y queso Pecorino. Mezclar con la panceta y la pasta caliente.", prepTime: 4, ingredients: [{inventoryId: "inv12", quantity: 2}, {inventoryId: "inv18", quantity: 0.05}] },
    { id: "sr9", name: "Emplatar", description: "Servir inmediatamente con pimienta negra recién molida.", prepTime: 2, ingredients: [] },
    { id: "sr10", name: "Cocinar carne", description: "Formar la hamburguesa y cocinarla al punto deseado.", prepTime: 8, ingredients: [{inventoryId: "inv19", quantity: 0.25}] },
    { id: "sr11", name: "Montar hamburguesa", description: "Colocar la carne en el pan con lechuga, tomate y salsas.", prepTime: 3, ingredients: [{inventoryId: "inv20", quantity: 1}, {inventoryId: "inv11", quantity: 0.1}, {inventoryId: "inv1", quantity: 0.1}] },
    { id: "sr12", name: "Freír papas", description: "Freír las papas en aceite caliente hasta que estén doradas y crujientes.", prepTime: 10, ingredients: [{inventoryId: "inv21", quantity: 0.3}] },
]

type Dish = {
    id: string;
    name: string;
    category: string;
    price: number;
    subRecipeIds: string[];
}

type Ingredient = {
    inventoryId: string;
    quantity: number;
}

type SubRecipe = {
    id: string;
    name: string;
    description: string;
    prepTime: number; // in minutes
    ingredients: Ingredient[];
}

function SubRecipeForm({ onSave, subRecipe }: { onSave: (data: Omit<SubRecipe, 'id'>) => void; subRecipe?: SubRecipe | null }) {
    const [name, setName] = useState(subRecipe?.name || "");
    const [description, setDescription] = useState(subRecipe?.description || "");
    const [prepTime, setPrepTime] = useState(subRecipe?.prepTime || 0);
    const [ingredients, setIngredients] = useState<Ingredient[]>(subRecipe?.ingredients || []);

    const handleSave = () => {
        if(name && description && prepTime > 0) {
            onSave({ name, description, prepTime, ingredients });
        }
    }

    const handleIngredientChange = (index: number, field: keyof Ingredient, value: string | number) => {
        const newIngredients = [...ingredients];
        if (field === 'quantity') {
            newIngredients[index][field] = Number(value);
        } else {
            newIngredients[index][field] = value as string;
        }
        setIngredients(newIngredients);
    }
    
    const addIngredient = () => {
        setIngredients([...ingredients, { inventoryId: '', quantity: 0 }]);
    }

    const removeIngredient = (index: number) => {
        setIngredients(ingredients.filter((_, i) => i !== index));
    }


    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="sub-recipe-name">Nombre de la Sub-receta</Label>
                    <Input id="sub-recipe-name" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Cortar vegetales"/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="sub-recipe-time">Tiempo Estimado (min)</Label>
                    <Input id="sub-recipe-time" type="number" value={prepTime} onChange={e => setPrepTime(Number(e.target.value))} placeholder="Ej: 5"/>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="sub-recipe-description">Descripción de la Preparación</Label>
                <Textarea id="sub-recipe-description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Ej: Cortar en juliana fina."/>
            </div>

            <div className="space-y-2">
                <Label>Ingredientes</Label>
                <div className="space-y-2 rounded-md border p-4">
                {ingredients.map((ing, index) => (
                    <div key={index} className="grid grid-cols-3 items-center gap-2">
                         <select
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={ing.inventoryId}
                            onChange={(e) => handleIngredientChange(index, 'inventoryId', e.target.value)}
                        >
                            <option value="" disabled>Seleccionar ingrediente</option>
                            {initialInventoryItems.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                        </select>

                        <Input 
                            type="number" 
                            placeholder="Cantidad"
                            value={ing.quantity}
                            onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                        />
                        <Button variant="ghost" size="icon" onClick={() => removeIngredient(index)}>
                            <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                ))}
                 <Button variant="outline" size="sm" onClick={addIngredient} className="mt-2">
                    <PlusCircle className="mr-2 h-4 w-4" /> Añadir Ingrediente
                </Button>
                </div>
            </div>

            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button onClick={handleSave}>Guardar Sub-receta</Button>
            </DialogFooter>
        </div>
    )
}

function DishForm({ onSave, dish, allSubRecipes }: { onSave: (dish: Omit<Dish, 'id'>) => void; dish?: Dish | null, allSubRecipes: SubRecipe[] }) {
    const [name, setName] = useState(dish?.name || "");
    const [category, setCategory] = useState(dish?.category || "");
    const [price, setPrice] = useState(dish?.price || 0);
    const [selectedSubRecipeIds, setSelectedSubRecipeIds] = useState<string[]>(dish?.subRecipeIds || []);

    const handleSave = () => {
        onSave({ name, category, price, subRecipeIds: selectedSubRecipeIds });
    }

    const handleSubRecipeToggle = (subRecipeId: string) => {
        setSelectedSubRecipeIds(prev =>
            prev.includes(subRecipeId) ? prev.filter(id => id !== subRecipeId) : [...prev, subRecipeId]
        )
    }

    return (
        <div className="grid gap-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="dish-name">Nombre del Platillo</Label>
                    <Input id="dish-name" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Pizza Margherita"/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="dish-category">Categoría</Label>
                    <Input id="dish-category" value={category} onChange={e => setCategory(e.target.value)} placeholder="Ej: Pizzas"/>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="dish-price">Precio</Label>
                <Input id="dish-price" type="number" value={price} onChange={e => setPrice(Number(e.target.value))}/>
            </div>
            <div className="space-y-2">
                <Label>Sub-recetas</Label>
                <Card>
                    <CardContent className="p-4 max-h-60 overflow-y-auto">
                        <div className="space-y-2">
                            {allSubRecipes.map(sr => (
                                <div key={sr.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`sr-${sr.id}`}
                                        checked={selectedSubRecipeIds.includes(sr.id)}
                                        onCheckedChange={() => handleSubRecipeToggle(sr.id)}
                                    />
                                    <label htmlFor={`sr-${sr.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        {sr.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button onClick={handleSave}>Guardar Platillo</Button>
            </DialogFooter>
        </div>
    )
}

export default function MenuPage() {
    const [dishes, setDishes] = useState<Dish[]>(initialDishes);
    const [subRecipes, setSubRecipes] = useState<SubRecipe[]>(initialSubRecipes);
    
    const [isDishModalOpen, setDishModalOpen] = useState(false);
    const [isSubRecipeModalOpen, setSubRecipeModalOpen] = useState(false);
    
    const [editingDish, setEditingDish] = useState<Dish | null>(null);
    const [editingSubRecipe, setEditingSubRecipe] = useState<SubRecipe | null>(null);

    const handleAddNewDish = () => {
        setEditingDish(null);
        setDishModalOpen(true);
    }
    
    const handleEditDish = (dish: Dish) => {
        setEditingDish(dish);
        setDishModalOpen(true);
    }

    const handleSaveDish = (dishData: Omit<Dish, 'id'>) => {
        if (editingDish) {
            setDishes(dishes.map(d => d.id === editingDish.id ? { ...d, ...dishData } : d));
        } else {
            const newDish: Dish = { id: `d${Date.now()}`, ...dishData };
            setDishes([...dishes, newDish]);
        }
        setDishModalOpen(false);
        setEditingDish(null);
    }

    const handleDeleteDish = (dishId: string) => {
        setDishes(dishes.filter(d => d.id !== dishId));
    }

    const handleAddNewSubRecipe = () => {
        setEditingSubRecipe(null);
        setSubRecipeModalOpen(true);
    }

    const handleEditSubRecipe = (subRecipe: SubRecipe) => {
        setEditingSubRecipe(subRecipe);
        setSubRecipeModalOpen(true);
    }

    const handleSaveSubRecipe = (data: Omit<SubRecipe, 'id'>) => {
        if(editingSubRecipe) {
            setSubRecipes(subRecipes.map(sr => sr.id === editingSubRecipe.id ? {...sr, ...data} : sr));
        } else {
            const newSubRecipe: SubRecipe = { id: `sr${Date.now()}`, ...data };
            setSubRecipes([...subRecipes, newSubRecipe]);
        }
        setSubRecipeModalOpen(false);
        setEditingSubRecipe(null);
    }
    
    const handleDeleteSubRecipe = (subRecipeId: string) => {
        setSubRecipes(subRecipes.filter(sr => sr.id !== subRecipeId));
        // Also remove from any dishes
        setDishes(dishes.map(d => ({
            ...d,
            subRecipeIds: d.subRecipeIds.filter(id => id !== subRecipeId)
        })))
    }
    
    const getSubRecipeName = (id: string) => subRecipes.find(sr => sr.id === id)?.name || 'N/A';
    const getDishesForSubRecipe = (subRecipeId: string) => dishes.filter(d => d.subRecipeIds.includes(subRecipeId));


  return (
    <>
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
                <Button onClick={handleAddNewDish}><PlusCircle className="mr-2 h-4 w-4" /> Nuevo Platillo</Button>
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
                    <TableCell>{dish.subRecipeIds.length}</TableCell>
                    <TableCell className="text-right">${dish.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                           <DropdownMenuItem onClick={() => handleEditDish(dish)}><Edit className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                           <DropdownMenuItem onClick={() => handleDeleteDish(dish.id)} className="text-destructive focus:text-destructive"><Trash className="mr-2 h-4 w-4" /> Eliminar</DropdownMenuItem>
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
                <CardDescription>Define los pasos de preparación y los ingredientes para cada platillo.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Input placeholder="Buscar sub-receta..." className="max-w-xs" />
                <Button onClick={handleAddNewSubRecipe}><PlusCircle className="mr-2 h-4 w-4" /> Nueva Sub-Receta</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre de Sub-Receta</TableHead>
                  <TableHead>Ingredientes</TableHead>
                  <TableHead>Tiempo (min)</TableHead>
                  <TableHead>Asignada a Platillo(s)</TableHead>
                  <TableHead><span className="sr-only">Acciones</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subRecipes.map((sr) => {
                    const assignedDishes = getDishesForSubRecipe(sr.id);
                    return (
                        <TableRow key={sr.id}>
                            <TableCell className="font-medium">{sr.name}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                    <Package className="h-4 w-4" />
                                    {sr.ingredients.length}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {sr.prepTime}
                                </div>
                            </TableCell>
                            <TableCell>{assignedDishes.map(d => d.name).join(', ') || 'No asignada'}</TableCell>
                            <TableCell className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleEditSubRecipe(sr)}><Edit className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteSubRecipe(sr.id)} className="text-destructive focus:text-destructive"><Trash className="mr-2 h-4 w-4" /> Eliminar</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>

    <Dialog open={isDishModalOpen} onOpenChange={setDishModalOpen}>
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>{editingDish ? 'Editar Platillo' : 'Nuevo Platillo'}</DialogTitle>
                <DialogDescription>
                    {editingDish ? 'Modifica los detalles de tu platillo.' : 'Añade un nuevo platillo a tu menú y asigna sus sub-recetas.'}
                </DialogDescription>
            </DialogHeader>
            <DishForm onSave={handleSaveDish} dish={editingDish} allSubRecipes={subRecipes} />
        </DialogContent>
    </Dialog>
    
    <Dialog open={isSubRecipeModalOpen} onOpenChange={setSubRecipeModalOpen}>
        <DialogContent className="sm:max-w-xl">
            <DialogHeader>
                <DialogTitle>{editingSubRecipe ? 'Editar Sub-receta' : 'Nueva Sub-receta'}</DialogTitle>
                 <DialogDescription>
                    Añade los detalles, el tiempo de preparación y los ingredientes para esta sub-receta.
                </DialogDescription>
            </DialogHeader>
            <SubRecipeForm onSave={handleSaveSubRecipe} subRecipe={editingSubRecipe} />
        </DialogContent>
    </Dialog>
    </>
  )
}