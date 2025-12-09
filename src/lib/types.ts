

export type Cook = {
    id: string;
    name: string;
  };
  
  export type SubRecipe = {
    id: string;
    name: string;
    description: string;
    status: "Pendiente" | "Preparando" | "Listo";
    assignedCook?: string; // Cook ID
    prepTime: number; // Estimated preparation time in minutes
    ingredients: Ingredient[];
  };
  
  export type OrderItem = {
    id: string;
    name: string;
    quantity: number;
    price: number;
    notes?: string;
    subRecipeIds: string[];
    subRecipes: SubRecipe[];
  };

  export type PaymentMethod = "Efectivo" | "Tarjeta" | "Otro";
  
  export type Order = {
    id: string;
    table: string;
    waiter: string;
    status: "Pendiente" | "Preparando" | "Listo" | "Entregado" | "Cancelado";
    total: number;
    timestamp: string;
    createdAt: number;
    items: OrderItem[];
    paymentMethod?: PaymentMethod;
  };
  
  export type Dish = {
      id: string;
      name: string;
      category: string;
      price: number;
      subRecipeIds: string[];
  }
  
  export type Ingredient = {
      inventoryId: string;
      quantity: number;
      wastage: number; // Percentage
  }
  
  export type InventoryItem = {
    id: string;
    name: string;
    category: string;
    stock: number;
    unit: string;
    threshold: number;
    price: number;
  }

  export type Table = {
    id: number;
    name: string;
  }

  export type Waiter = {
    id: string;
    name: string;
  }

  export type NewOrderData = {
    table: string;
    waiter: string;
    items: OrderItem[];
    total: number;
  };

  export type FinancialRecord = {
    id: string;
    date: Date;
    amount: number;
    type: 'revenue' | 'expense';
    description: string;
  }

