
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Order, OrderItem, SubRecipe, Dish, InventoryItem, Cook, Table, Waiter, NewOrderData, FinancialRecord, PaymentMethod } from '@/lib/types';
import { initialOrders, initialDishes, initialInventoryItems, initialSubRecipes, initialCooks, initialTables, initialWaiters, initialFinancials } from '@/lib/data';

interface RestaurantContextType {
    orders: Order[];
    setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
    addOrder: (newOrderData: NewOrderData) => void;
    settleOrder: (orderId: string, paymentMethod: PaymentMethod) => void;
    dishes: Dish[];
    setDishes: React.Dispatch<React.SetStateAction<Dish[]>>;
    inventoryItems: InventoryItem[];
    setInventoryItems: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
    subRecipes: SubRecipe[];
    setSubRecipes: React.Dispatch<React.SetStateAction<SubRecipe[]>>;
    cooks: Cook[];
    tables: Table[];
    waiters: Waiter[];
    financials: FinancialRecord[];
    setFinancials: React.Dispatch<React.SetStateAction<FinancialRecord[]>>;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export function RestaurantProvider({ children }: { children: ReactNode }) {
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [dishes, setDishes] = useState<Dish[]>(initialDishes);
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(initialInventoryItems);
    const [subRecipes, setSubRecipes] = useState<SubRecipe[]>(initialSubRecipes);
    const [financials, setFinancials] = useState<FinancialRecord[]>(initialFinancials);

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

    const settleOrder = (orderId: string, paymentMethod: PaymentMethod) => {
        let settledOrder: Order | undefined;
        setOrders(prevOrders => prevOrders.map(order => {
            if (order.id === orderId) {
                settledOrder = { ...order, status: 'Entregado', paymentMethod };
                return settledOrder;
            }
            return order;
        }));

        if (settledOrder) {
            const newFinancialRecord: FinancialRecord = {
                id: `fin${Date.now()}`,
                date: new Date(),
                amount: settledOrder.total,
                type: 'revenue',
                description: `Pedido ${settledOrder.id}`
            };
            setFinancials(prev => [...prev, newFinancialRecord]);
        }
    }

    const value = {
        orders,
        setOrders,
        addOrder,
        settleOrder,
        dishes,
        setDishes,
        inventoryItems,
        setInventoryItems,
        subRecipes,
        setSubRecipes,
        cooks: initialCooks,
        tables: initialTables,
        waiters: initialWaiters,
        financials,
        setFinancials,
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
