// Este archivo ya no contiene datos placeholder.
// Todos los datos ahora se obtienen desde la API del backend.
// Los exports vacíos se mantienen para compatibilidad con imports existentes.

import type { Order, Dish, InventoryItem, SubRecipe, Cook, Table, Waiter, FinancialRecord, User } from './types';

// Arrays vacíos - los datos reales vienen del backend
export const initialUsers: User[] = [];
export const initialCooks: Cook[] = [];
export const initialInventoryItems: InventoryItem[] = [];
export const initialSubRecipes: Omit<SubRecipe, 'status' | 'assignedCook'>[] = [];
export const initialDishes: Dish[] = [];
export const initialOrders: Order[] = [];
export const initialTables: Table[] = [];
export const initialWaiters: Waiter[] = [];
export const initialFinancials: FinancialRecord[] = [];

