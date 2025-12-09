
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Order, OrderItem, SubRecipe, Dish, InventoryItem, Cook, Table, Waiter, NewOrderData } from '@/lib/types';
import { initialOrders, initialDishes, initialInventoryItems, initialSubRecipes, initialCooks, initialTables, initialWaiters } from '@/lib/data';

interface RestaurantContextType {
    orders: Order[];
    setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
    addOrder: (newOrderData: NewOrderData) => void;
    dishes: Dish[];
    setDishes: React.Dispatch<React.SetStateAction<Dish[]>>;
    inventoryItems: InventoryItem[];
    setInventoryItems: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
    subRecipes: SubRecipe[];
    setSubRecipes: React.Dispatch<React.SetStateAction<SubRecipe[]>>;
    cooks: Cook[];
    tables: Table[];
    waiters: Waiter[];
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export function RestaurantProvider({ children }: { children: ReactNode }) {
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [dishes, setDishes] = useState<Dish[]>(initialDishes);
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(initialInventoryItems);
    const [subRecipes, setSubRecipes] = useState<SubRecipe[]>(initialSubRecipes);

    const addOrder = (newOrderData: NewOrderData) => {
        const orderItemsWithSubRecipes = newOrderData.items.map(item => {
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

        const newOrder: Order = {
            id: `ORD${(orders.length + 1).toString().padStart(3, '0')}`,
            table: newOrderData.table,
            waiter: newOrderData.waiter,
            status: "Pendiente",
            total: newOrderData.total,
            timestamp: "justo ahora",
            createdAt: Date.now(),
            items: orderItemsWithSubRecipes,
        };
        setOrders(prev => [newOrder, ...prev]);
    }

    const value = {
        orders,
        setOrders,
        addOrder,
        dishes,
        setDishes,
        inventoryItems,
        setInventoryItems,
        subRecipes,
        setSubRecipes,
        cooks: initialCooks,
        tables: initialTables,
        waiters: initialWaiters
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
