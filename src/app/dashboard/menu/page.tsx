"use client"

import { useState, useMemo } from "react";
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
import { PlusCircle, MoreHorizontal, ChefHat, Utensils, Trash, Edit, Clock, Package, AlertTriangle, ShieldCheck } from "lucide-react"
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
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useRestaurant } from "@/context/RestaurantContext";
import type { Dish, Ingredient, SubRecipe } from '@/lib/types';


function SubRecipeForm({ onSave, subRecipe }: { onSave: (data: Omit<SubRecipe, 'id' | 'status' | 'assignedCook'>) => void; subRecipe?: SubRecipe | null }) {
    const { inventoryItems } = useRestaurant();
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
        if (field === 'quantity' || field === 'wastage') {
            newIngredients[index][field] = Number(value);
        } else {
            newIngredients[index][field] = value as string;
        }
        setIngredients(newIngredients);
    }
    
    const addIngredient = () => {
        setIngredients([...ingredients, { inventoryId: '', quantity: 0, wastage: 0 }]);
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
                <div className="space-y-2 rounded-md border p-4 max-h-60 overflow-y-auto">
                <div className="grid grid-cols-12 items-center gap-2 text-xs font-medium text-muted-foreground">
                    <div className="col-span-5">Ingrediente</div>
                    <div className="col-span-2">Cantidad</div>
                    <div className="col-span-2">Merma (%)</div>
                    <div className="col-span-2">Costo</div>
                    <div className="col-span-1"></div>
                </div>
                {ingredients.map((ing, index) => {
                    const invItem = inventoryItems.find(i => i.id === ing.inventoryId);
                    const cost = invItem ? invItem.price * ing.quantity * (1 + ing.wastage / 100) : 0;
                    return (
                    <div key={index} className="grid grid-cols-12 items-center gap-2">
                         <select
                            className="col-span-5 flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={ing.inventoryId}
                            onChange={(e) => handleIngredientChange(index, 'inventoryId', e.target.value)}
                        >
                            <option value="" disabled>Seleccionar</option>
                            {inventoryItems.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                        </select>

                        <Input 
                            type="number" 
                            className="col-span-2"
                            placeholder="Cant."
                            value={ing.quantity}
                            onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                        />
                         <Input 
                            type="number"
                            className="col-span-2"
                            placeholder="%"
                            value={ing.wastage}
                            onChange={(e) => handleIngredientChange(index, 'wastage', e.target.value)}
                        />
                        <div className="col-span-2 text-sm text-center">${cost.toFixed(2)}</div>
                        <Button variant="ghost" size="icon" className="col-span-1" onClick={() => removeIngredient(index)}>
                            <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                )})}
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
    const { inventoryItems } = useRestaurant();
    const [name, setName] = useState(dish?.name || "");
    const [category, setCategory] = useState(dish?.category || "");
    const [description, setDescription] = useState(dish?.description || "");
    const [price, setPrice] = useState(dish?.price || 0);
    const [selectedSubRecipeIds, setSelectedSubRecipeIds] = useState<string[]>(dish?.subRecipeIds || []);
    const [isPublic, setIsPublic] = useState(dish?.isPublic || false);

    const suggestedCost = useMemo(() => {
        let totalCost = 0;
        selectedSubRecipeIds.forEach(srId => {
            const subRecipe = allSubRecipes.find(sr => sr.id === srId);
            if (subRecipe) {
                subRecipe.ingredients.forEach(ing => {
                    const invItem = inventoryItems.find(i => i.id === ing.inventoryId);
                    if (invItem) {
                        const rawQuantity = ing.quantity / (1 - ing.wastage / 100);
                        totalCost += rawQuantity * invItem.price;
                    }
                })
            }
        });
        return totalCost;
    }, [selectedSubRecipeIds, allSubRecipes, inventoryItems]);

    const handleSave = () => {
        onSave({ name, category, price, description, subRecipeIds: selectedSubRecipeIds, isPublic });
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
                <Label htmlFor="dish-description">Descripción del Platillo</Label>
                <Textarea id="dish-description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Ej: Pizza clásica con salsa de tomate, mozzarella fresca y albahaca."/>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="dish-price">Precio de Venta</Label>
                    <Input id="dish-price" type="number" value={price} onChange={e => setPrice(Number(e.target.value))}/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="dish-cost">Costo Sugerido</Label>
                    <Input id="dish-cost" type="text" value={`$${suggestedCost.toFixed(2)}`} readOnly disabled/>
                </div>
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
            <div className="flex items-center space-x-2">
                <Switch id="is-public" checked={isPublic} onCheckedChange={setIsPublic} />
                <Label htmlFor="is-public">Publicar en el menú para clientes</Label>
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
    const { dishes, setDishes, subRecipes, setSubRecipes, isDishAvailable } = useRestaurant();
    
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

    const handleTogglePublic = (dishId: string) => {
        setDishes(dishes.map(d => d.id === dishId ? { ...d, isPublic: !d.isPublic } : d));
    }

    const handleAddNewSubRecipe = () => {
        setEditingSubRecipe(null);
        setSubRecipeModalOpen(true);
    }

    const handleEditSubRecipe = (subRecipe: SubRecipe) => {
        setEditingSubRecipe(subRecipe);
        setSubRecipeModalOpen(true);
    }

    const handleSaveSubRecipe = (data: Omit<SubRecipe, 'id' | 'status' | 'assignedCook'>) => {
        if(editingSubRecipe) {
            setSubRecipes(subRecipes.map(sr => sr.id === editingSubRecipe.id ? {...sr, ...data} : sr));
        } else {
            const newSubRecipe: SubRecipe = { id: `sr${Date.now()}`, ...data, status: 'Pendiente', assignedCook: undefined };
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
    <TooltipProvider>
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
                  <TableHead>Platillo</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Disponibilidad</TableHead>
                  <TableHead>Publicar</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead><span className="sr-only">Acciones</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dishes.map((dish) => {
                    const available = isDishAvailable(dish.id);
                    return (
                        <TableRow key={dish.id}>
                            <TableCell className="font-medium">{dish.name}</TableCell>
                            <TableCell><Badge variant="outline">{dish.category}</Badge></TableCell>
                            <TableCell>
                                <Tooltip>
                                    <TooltipTrigger>
                                        {available ? (
                                            <ShieldCheck className="h-5 w-5 text-green-500" />
                                        ) : (
                                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                        )}
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{available ? "Ingredientes disponibles" : "Faltan ingredientes"}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TableCell>
                            <TableCell>
                                <Switch
                                    checked={dish.isPublic}
                                    onCheckedChange={() => handleTogglePublic(dish.id)}
                                    aria-label="Publicar en menú"
                                    disabled={!available}
                                />
                            </TableCell>
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
                    )}
                )}
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
    </TooltipProvider>

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
        <DialogContent className="sm:max-w-2xl">
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
