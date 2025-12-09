
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { Order, OrderItem, SubRecipe, Dish, InventoryItem, Cook, Table, Waiter, NewOrderData, EditedOrderData, FinancialRecord, PaymentMethod } from '@/lib/types';
import { initialOrders, initialDishes, initialInventoryItems, initialSubRecipes, initialCooks, initialTables, initialWaiters, initialFinancials } from '@/lib/data';

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
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export function RestaurantProvider({ children }: { children: ReactNode }) {
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [dishes, setDishes] = useState<Dish[]>(initialDishes);
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(initialInventoryItems);
    const [subRecipes, setSubRecipes] = useState<SubRecipe[]>(initialSubRecipes);
    const [financials, setFinancials] = useState<FinancialRecord[]>(initialFinancials);
    const [tables, setTables] = useState<Table[]>(initialTables);

    const getItemsWithSubrecipes = (items: OrderItem[]) => {
        return items.map(item => {
            const dish = dishes.find(d => d.id === item.id);
            if (!dish) return { ...item, subRecipes: [] };

            const associatedSubRecipes = dish.subRecipeIds
                .map(srId => {
                    const subRecipe = subRecipes.find(sr => sr.id === srId);
                    return subRecipe ? { ...subRecipe, status: 'Pendiente' as const, assignedCook: undefined } : null;
                })
                .filter((sr): sr is SubRecipe => sr !== null);
            
            return { ...item, subRecipes: associatedSubRecipes };
        });
    }

    const setTableStatus = useCallback((tableName: string, status: 'ocupada' | 'disponible', orderId?: string, people?: number) => {
        setTables(prevTables =>
          prevTables.map(t =>
            t.name === tableName
              ? { ...t, status, orderId, people: status === 'ocupada' ? people : undefined }
              : t
          )
        );
      }, []);

    const addOrder = (newOrderData: NewOrderData) => {
        const orderItemsWithSubRecipes = getItemsWithSubrecipes(newOrderData.items);

        const newOrder: Order = {
            id: `ORD${(orders.length + 1).toString().padStart(3, '0')}`,
            table: newOrderData.table,
            waiter: newOrderData.waiter,
            status: "Pendiente",
            total: newOrderData.total,
            createdAt: Date.now(),
            items: orderItemsWithSubRecipes,
            people: newOrderData.people,
        };
        setOrders(prev => [newOrder, ...prev]);
        setTableStatus(newOrder.table, 'ocupada', newOrder.id, newOrder.people);
    }

    const updateOrder = (editedOrderData: EditedOrderData) => {
        setOrders(prevOrders => prevOrders.map(order => {
            if (order.id === editedOrderData.id) {
                // We keep existing subrecipe status if the item is the same
                const updatedItems = editedOrderData.items.map(newItem => {
                    const oldItem = order.items.find(old => old.id === newItem.id);
                    if (oldItem) {
                        return { ...newItem, subRecipes: oldItem.subRecipes };
                    }
                    // For brand new items, generate fresh subrecipes
                    return getItemsWithSubrecipes([newItem])[0];
                });

                const updatedOrder = {
                    ...order,
                    ...editedOrderData,
                    items: updatedItems,
                    status: 'Pendiente' as const, // Reset status on edit
                    people: editedOrderData.people,
                };
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
                sr.ingredients.forEach(ing => {
                    const invItem = inventoryItems.find(i => i.id === ing.inventoryId);
                    if (invItem) {
                        const rawQuantity = ing.quantity / (1 - ing.wastage / 100);
                        ingredientCost += rawQuantity * invItem.price;
                    }
                });
            });
            partialCost += (ingredientCost * 3) * item.quantity;
        });

        return { adjustedTotal: partialCost, isPartial: partialCost > 0 && partialCost < order.total };
    }, [inventoryItems, dishes]);


    const updateOrderStatus = (orderId: string, status: Order['status'], finalAmount?: number) => {
        let orderToUpdate: Order | undefined;
        setOrders(prevOrders =>
          prevOrders.map(order => {
              if(order.id === orderId) {
                  orderToUpdate = order;
                  return { ...order, status };
              }
              return order;
          })
        );

        if (orderToUpdate && finalAmount !== undefined && finalAmount > 0) {
            const newFinancialRecord: FinancialRecord = {
                id: `fin-rev-${Date.now()}`,
                date: new Date(),
                amount: finalAmount,
                type: 'revenue',
                description: `Pedido ${orderId} (${status})`
            };
            setFinancials(prev => [...prev, newFinancialRecord]);
        }
    };

    const settleOrder = (orderId: string, paymentMethod: PaymentMethod, finalAmount: number) => {
        let settledOrder: Order | undefined;
        setOrders(prevOrders => prevOrders.map(order => {
            if (order.id === orderId) {
                settledOrder = { ...order, status: 'Entregado', paymentMethod, total: finalAmount };
                setTableStatus(settledOrder.table, 'disponible');
                return settledOrder;
            }
            return order;
        }));

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

    const restockItem = (itemId: string, quantity: number) => {
        let restockedItem: InventoryItem | undefined;
        setInventoryItems(prevItems => prevItems.map(item => {
            if (item.id === itemId) {
                restockedItem = { ...item, stock: item.stock + quantity };
                return restockedItem;
            }
            return item;
        }));

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
        cooks: initialCooks,
        tables,
        waiters: initialWaiters,
        financials,
        setFinancials,
        setTableStatus,
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
