
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { Order, OrderItem, SubRecipe, Dish, InventoryItem, Cook, Table, Waiter, NewOrderData, EditedOrderData, FinancialRecord, PaymentMethod } from '@/lib/types';
import {
  apiPedidos,
  apiPlatillos,
  apiSubRecetas,
  apiInventario,
  apiFinanzas,
  apiMesas,
  apiCocineros,
  apiMeseros,
  obtenerToken,
} from '@/services/api';

interface RestaurantContextType {
    orders: Order[];
    setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
    addOrder: (newOrderData: NewOrderData) => void;
    updateOrder: (editedOrderData: EditedOrderData) => void;
    settleOrder: (orderId: string, paymentMethod: PaymentMethod, finalAmount: number) => void;
    updateOrderStatus: (orderId: string, status: Order['status'], finalAmount?: number) => void;
    calculatePartialCost: (order: Order) => { adjustedTotal: number, isPartial: boolean };
    dishes: Dish[];
    setDishes: React.Dispatch<React.SetStateAction<Dish[]>>;
    inventoryItems: InventoryItem[];
    setInventoryItems: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
    restockItem: (itemId: string, quantity: number) => void;
    subRecipes: SubRecipe[];
    setSubRecipes: React.Dispatch<React.SetStateAction<SubRecipe[]>>;
    cooks: Cook[];
    tables: Table[];
    waiters: Waiter[];
    financials: FinancialRecord[];
    setFinancials: React.Dispatch<React.SetStateAction<FinancialRecord[]>>;
    setTableStatus: (tableName: string, status: 'ocupada' | 'disponible', orderId?: string, people?: number) => void;
    isDishAvailable: (dishId: string) => boolean;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export function RestaurantProvider({ children }: { children: ReactNode }) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [dishes, setDishes] = useState<Dish[]>([]);
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [subRecipes, setSubRecipes] = useState<SubRecipe[]>([]);
    const [financials, setFinancials] = useState<FinancialRecord[]>([]);
    const [tables, setTables] = useState<Table[]>([]);
    const [cooks, setCooks] = useState<Cook[]>([]);
    const [waiters, setWaiters] = useState<Waiter[]>([]);
    const [loading, setLoading] = useState(true);

    // Cargar datos desde la API al montar el componente
    useEffect(() => {
        const cargarDatos = async () => {
            const token = obtenerToken();
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                // Cargar todos los datos en paralelo
                const [pedidosRes, platillosRes, subrecetasRes, inventarioRes, finanzasRes, mesasRes, cocinerosRes, meserosRes] = await Promise.all([
                    apiPedidos.obtenerTodos().catch(() => []),
                    apiPlatillos.obtenerTodos().catch(() => []),
                    apiSubRecetas.obtenerTodas().catch(() => []),
                    apiInventario.obtenerTodos().catch(() => []),
                    apiFinanzas.obtenerTodos().catch(() => []),
                    apiMesas.obtenerTodas().catch(() => []),
                    apiCocineros.obtenerTodos().catch(() => []),
                    apiMeseros.obtenerTodos().catch(() => []),
                ]);

                // Convertir datos de la API al formato del frontend
                const ordersData: Order[] = pedidosRes.map((p: unknown) => {
                    const pedido = p as { id: string; mesa: string; mesero: string; estado: Order['status']; total: number; creadoEn?: number; createdAt?: number; items: OrderItem[]; metodoPago?: PaymentMethod; personas?: number };
                    return {
                        id: pedido.id,
                        table: pedido.mesa,
                        waiter: pedido.mesero,
                        status: pedido.estado,
                        total: pedido.total,
                        createdAt: pedido.creadoEn || pedido.createdAt || Date.now(),
                        items: pedido.items,
                        paymentMethod: pedido.metodoPago,
                        people: pedido.personas,
                    };
                });
                setOrders(ordersData);

                setDishes(platillosRes.map((p: { id: string; nombre: string; name?: string; categoria: string; category?: string; precio: number | string; price?: number; descripcion?: string; description?: string; subRecipeIds?: string[]; esPublico?: boolean; isPublic?: boolean }) => ({
                    id: p.id,
                    name: p.name || p.nombre,
                    category: p.category || p.categoria,
                    price: parseFloat(String(p.price ?? p.precio)) || 0,
                    description: p.description || p.descripcion,
                    subRecipeIds: p.subRecipeIds || [],
                    isPublic: p.isPublic ?? p.esPublico ?? false,
                })));

                setSubRecipes(subrecetasRes.map((sr: { id: string; nombre?: string; name?: string; descripcion?: string; description?: string; tiempoPreparacion?: number; prepTime?: number; ingredientes?: { inventarioId?: string; inventoryId?: string; cantidad?: number; quantity?: number; merma?: number; wastage?: number }[]; ingredients?: { inventoryId: string; quantity: number; wastage: number }[] }) => {
                    const ingredientesData = sr.ingredientes || sr.ingredients || [];
                    const ingredientesFormatted = ingredientesData.map((ing: { inventarioId?: string; inventoryId?: string; cantidad?: number; quantity?: number; merma?: number; wastage?: number }) => ({
                        inventarioId: ing.inventarioId || ing.inventoryId || '',
                        cantidad: ing.cantidad ?? ing.quantity ?? 0,
                        merma: ing.merma ?? ing.wastage ?? 0,
                        inventoryId: ing.inventoryId || ing.inventarioId || '',
                        quantity: ing.quantity ?? ing.cantidad ?? 0,
                        wastage: ing.wastage ?? ing.merma ?? 0,
                    }));
                    return {
                        id: sr.id,
                        nombre: sr.nombre || sr.name || '',
                        descripcion: sr.descripcion || sr.description || '',
                        estado: 'Pendiente' as const,
                        tiempoPreparacion: sr.tiempoPreparacion || sr.prepTime || 0,
                        ingredientes: ingredientesFormatted,
                        // Alias en inglés
                        name: sr.nombre || sr.name || '',
                        description: sr.descripcion || sr.description || '',
                        status: 'Pendiente' as const,
                        prepTime: sr.tiempoPreparacion || sr.prepTime || 0,
                        ingredients: ingredientesFormatted,
                    };
                }));

                setInventoryItems(inventarioRes.map((i: { id: string; nombre?: string; name?: string; categoria?: string; category?: string; stock: number | string; unidad?: string; unit?: string; umbral?: number | string; threshold?: number | string; precio?: number | string; price?: number | string }) => ({
                    id: i.id,
                    name: i.name || i.nombre || '',
                    category: i.category || i.categoria || '',
                    stock: parseFloat(String(i.stock)) || 0,
                    unit: i.unit || i.unidad || '',
                    threshold: parseFloat(String(i.threshold ?? i.umbral ?? 0)) || 0,
                    price: parseFloat(String(i.price ?? i.precio ?? 0)) || 0,
                })));

                setFinancials(finanzasRes.map((f: { id: string; date: Date | string; amount: number | string; type: string; description: string }) => ({
                    id: f.id,
                    date: new Date(f.date),
                    amount: parseFloat(String(f.amount)) || 0,
                    type: f.type === 'ingreso' ? 'revenue' : f.type === 'gasto' ? 'expense' : f.type as 'revenue' | 'expense',
                    description: f.description,
                })));

                setTables(mesasRes.map((m: { id: string | number; nombre: string; estado: 'disponible' | 'ocupada'; forma: string; posicionX?: number; posicionY?: number; x?: number; y?: number; personas?: number; pedidoId?: string }) => ({
                    id: m.id,
                    name: m.nombre,
                    status: m.estado,
                    shape: m.forma === 'redonda' ? 'round' : 'square' as 'square' | 'round',
                    x: m.posicionX ?? m.x ?? 0,
                    y: m.posicionY ?? m.y ?? 0,
                    people: m.personas,
                    orderId: m.pedidoId,
                })));

                setCooks(cocinerosRes);
                setWaiters(meserosRes);

            } catch (error) {
                console.error('Error al cargar datos:', error);
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
    }, []);

    const getItemsWithSubrecipes = (items: OrderItem[]) => {
        return items.map((item: OrderItem) => {
            const dish = dishes.find((d: Dish) => d.id === item.id);
            if (!dish) return { ...item, subRecipes: [] };

            const associatedSubRecipes = dish.subRecipeIds
                .map((srId: string) => {
                    const subRecipe = subRecipes.find((sr: SubRecipe) => sr.id === srId);
                    return subRecipe ? { ...subRecipe, status: 'Pendiente' as const, assignedCook: undefined } : null;
                })
                .filter((sr: SubRecipe | null): sr is SubRecipe => sr !== null);
            
            return { ...item, subRecipes: associatedSubRecipes };
        });
    }

    const setTableStatus = useCallback(async (tableName: string, status: 'ocupada' | 'disponible', orderId?: string, people?: number) => {
        // Actualizar estado local
        setTables((prevTables: Table[]) =>
          prevTables.map((t: Table) =>
            t.name === tableName
              ? { ...t, status, orderId, people: status === 'ocupada' ? people : undefined }
              : t
          )
        );
        // Persistir en la base de datos
        try {
            await apiMesas.actualizarEstadoPorNombre(tableName, { estado: status, pedidoId: orderId, personas: people });
        } catch (error) {
            console.error('Error al actualizar estado de mesa:', error);
        }
      }, []);

    const addOrder = async (newOrderData: NewOrderData) => {
        const orderItemsWithSubRecipes = getItemsWithSubrecipes(newOrderData.items);

        try {
            // Crear pedido en la base de datos
            const response = await apiPedidos.crear({
                mesa: newOrderData.table,
                mesero: newOrderData.waiter,
                total: newOrderData.total,
                items: newOrderData.items.map(item => ({
                    id: item.id,
                    nombre: item.name,
                    cantidad: item.quantity,
                    precio: item.price,
                    notas: item.notes || '',
                })) as unknown as import('@/services/api').ItemPedido[],
                personas: newOrderData.people,
            });

            const newOrder: Order = {
                id: response.pedido?.id || `ORD${Date.now()}`,
                table: newOrderData.table,
                waiter: newOrderData.waiter,
                status: "Pendiente",
                total: newOrderData.total,
                createdAt: Date.now(),
                items: orderItemsWithSubRecipes as OrderItem[],
                people: newOrderData.people,
            };
            setOrders((prev: Order[]) => [newOrder, ...prev]);
            setTableStatus(newOrder.table, 'ocupada', newOrder.id, newOrder.people);
        } catch (error) {
            console.error('Error al crear pedido:', error);
            // Fallback: crear localmente si falla la API
            const newOrder: Order = {
                id: `ORD${Date.now()}`,
                table: newOrderData.table,
                waiter: newOrderData.waiter,
                status: "Pendiente",
                total: newOrderData.total,
                createdAt: Date.now(),
                items: orderItemsWithSubRecipes as OrderItem[],
                people: newOrderData.people,
            };
            setOrders((prev: Order[]) => [newOrder, ...prev]);
            setTableStatus(newOrder.table, 'ocupada', newOrder.id, newOrder.people);
        }
    }

    const updateOrder = async (editedOrderData: EditedOrderData) => {
        let oldTable: string | undefined;
        
        try {
            // Actualizar en la base de datos
            await apiPedidos.actualizar(editedOrderData.id, {
                id: editedOrderData.id,
                mesa: editedOrderData.table,
                mesero: editedOrderData.waiter,
                total: editedOrderData.total,
                items: editedOrderData.items.map(item => ({
                    id: item.id,
                    nombre: item.name,
                    cantidad: item.quantity,
                    precio: item.price,
                    notas: item.notes || '',
                })) as unknown as import('@/services/api').ItemPedido[],
                personas: editedOrderData.people,
            });
        } catch (error) {
            console.error('Error al actualizar pedido:', error);
        }

        setOrders((prevOrders: Order[]) => prevOrders.map((order: Order) => {
            if (order.id === editedOrderData.id) {
                oldTable = order.table;
                const updatedItems = editedOrderData.items.map((newItem: OrderItem) => {
                    const oldItem = order.items.find((old: OrderItem) => old.id === newItem.id);
                    if (oldItem) {
                        return { ...newItem, subRecipes: oldItem.subRecipes };
                    }
                    return getItemsWithSubrecipes([newItem])[0];
                });

                const updatedOrder = {
                    ...order,
                    ...editedOrderData,
                    items: updatedItems as OrderItem[],
                    status: 'Pendiente' as const,
                    people: editedOrderData.people,
                };
                if (oldTable && oldTable !== updatedOrder.table) {
                    setTableStatus(oldTable, 'disponible');
                }
                setTableStatus(updatedOrder.table, 'ocupada', updatedOrder.id, updatedOrder.people);
                return updatedOrder;
            }
            return order;
        }));
    }

    const calculatePartialCost = useCallback((order: Order): { adjustedTotal: number, isPartial: boolean } => {
        const allSubrecipesDone = order.items.every(item => item.subRecipes.every(sr => sr.status === 'Listo'));
        if (allSubrecipesDone) {
            return { adjustedTotal: order.total, isPartial: false };
        }

        let partialCost = 0;
        order.items.forEach(item => {
            const completedSubRecipes = item.subRecipes.filter(sr => sr.status === 'Listo');
            if (item.subRecipes.length > 0 && completedSubRecipes.length === 0) return;

            if (item.subRecipes.length === 0 || completedSubRecipes.length === item.subRecipes.length) {
                partialCost += item.price * item.quantity;
                return;
            }

            let ingredientCost = 0;
            completedSubRecipes.forEach(sr => {
                const ings = (sr as { ingredients?: unknown[]; ingredientes?: unknown[] }).ingredients || (sr as { ingredients?: unknown[]; ingredientes?: unknown[] }).ingredientes || [];
                ings.forEach((ing: unknown) => {
                    const ingredient = ing as { inventoryId?: string; inventarioId?: string; quantity?: number; cantidad?: number; wastage?: number; merma?: number };
                    const invItem = inventoryItems.find(i => i.id === (ingredient.inventoryId || ingredient.inventarioId));
                    if (invItem) {
                        const qty = ingredient.quantity ?? ingredient.cantidad ?? 0;
                        const wst = ingredient.wastage ?? ingredient.merma ?? 0;
                        const rawQuantity = qty / (1 - wst / 100);
                        ingredientCost += rawQuantity * invItem.price;
                    }
                });
            });
            partialCost += (ingredientCost * 3) * item.quantity;
        });

        return { adjustedTotal: partialCost, isPartial: partialCost > 0 && partialCost < order.total };
    }, [inventoryItems]);


    const updateOrderStatus = async (orderId: string, status: Order['status'], finalAmount?: number) => {
        let orderToUpdate: Order | undefined;
        
        try {
            // Persistir cambio de estado en la base de datos
            // El backend ya registra el ingreso si hay montoFinal
            await apiPedidos.actualizarEstado(orderId, status, undefined, finalAmount);
        } catch (error) {
            console.error('Error al actualizar estado de pedido:', error);
        }

        setOrders(prevOrders =>
          prevOrders.map(order => {
              if(order.id === orderId) {
                  orderToUpdate = { ...order, status };
                  return orderToUpdate;
              }
              return order;
          })
        );

        if (orderToUpdate) {
            if (status === 'Entregado' || status === 'Cancelado') {
                setTableStatus(orderToUpdate.table, 'disponible');
            }
            
            // Agregar registro local para actualizar la UI
            // (el backend ya lo guardó en la BD)
            if (finalAmount !== undefined && finalAmount > 0) {
                const newFinancialRecord: FinancialRecord = {
                    id: `fin-rev-${Date.now()}`,
                    date: new Date(),
                    amount: finalAmount,
                    type: 'revenue',
                    description: `Pedido ${orderId} (${status})`
                };
                setFinancials(prev => [...prev, newFinancialRecord]);
            }
        }
    };

    const settleOrder = async (orderId: string, paymentMethod: PaymentMethod, finalAmount: number) => {
        let settledOrder: Order | undefined;
        
        try {
            // Liquidar pedido en la base de datos
            // El backend ya registra el ingreso automáticamente
            await apiPedidos.liquidar(orderId, paymentMethod, finalAmount);
        } catch (error) {
            console.error('Error al liquidar pedido:', error);
        }

        setOrders(prevOrders => prevOrders.map(order => {
            if (order.id === orderId) {
                settledOrder = { ...order, status: 'Entregado', paymentMethod, total: finalAmount };
                setTableStatus(settledOrder.table, 'disponible');
                return settledOrder;
            }
            return order;
        }));

        // Agregar registro local para actualizar la UI
        // (el backend ya lo guardó en la BD)
        if (settledOrder) {
            const newFinancialRecord: FinancialRecord = {
                id: `fin-rev-${Date.now()}`,
                date: new Date(),
                amount: finalAmount,
                type: 'revenue',
                description: `Pedido ${settledOrder.id}`
            };
            setFinancials(prev => [...prev, newFinancialRecord]);
        }
    }

    const restockItem = async (itemId: string, quantity: number) => {
        let restockedItem: InventoryItem | undefined;
        
        try {
            // Reabastecer en la base de datos (el backend ya registra el gasto)
            await apiInventario.reabastecer(itemId, quantity);
        } catch (error) {
            console.error('Error al reabastecer inventario:', error);
        }

        setInventoryItems(prevItems => prevItems.map(item => {
            if (item.id === itemId) {
                restockedItem = { ...item, stock: item.stock + quantity };
                return restockedItem;
            }
            return item;
        }));

        // Agregar registro financiero local para actualizar la UI
        // (el backend ya lo guardó en la BD, esto es solo para el estado local)
        if (restockedItem) {
            const cost = quantity * restockedItem.price;
            const newFinancialRecord: FinancialRecord = {
                id: `fin-exp-${Date.now()}`,
                date: new Date(),
                amount: cost,
                type: 'expense',
                description: `Reabastecimiento: ${quantity} x ${restockedItem.name}`
            };
            setFinancials(prev => [...prev, newFinancialRecord]);
        }
    }

    const isDishAvailable = useCallback((dishId: string): boolean => {
        const dish = dishes.find(d => d.id === dishId);
        if (!dish) return false;
    
        for (const srId of dish.subRecipeIds) {
          const subRecipe = subRecipes.find(sr => sr.id === srId);
          if (!subRecipe) continue;
    
          for (const ingredient of (subRecipe.ingredients || [])) {
            const invItem = inventoryItems.find(i => i.id === ingredient.inventoryId);
            if (!invItem || invItem.stock < ingredient.quantity) {
              return false;
            }
          }
        }
        return true;
      }, [dishes, subRecipes, inventoryItems]);

    const value = {
        orders,
        setOrders,
        addOrder,
        updateOrder,
        settleOrder,
        updateOrderStatus,
        calculatePartialCost,
        dishes,
        setDishes,
        inventoryItems,
        setInventoryItems,
        restockItem,
        subRecipes,
        setSubRecipes,
        cooks,
        tables,
        waiters,
        financials,
        setFinancials,
        setTableStatus,
        isDishAvailable,
    };

    return (
        <RestaurantContext.Provider value={value}>
            {children}
        </RestaurantContext.Provider>
    );
}

export function useRestaurant() {
    const context = useContext(RestaurantContext);
    if (context === undefined) {
        throw new Error('useRestaurant must be used within a RestaurantProvider');
    }
    return context;
}
