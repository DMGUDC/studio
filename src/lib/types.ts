









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
    name:string;
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
    createdAt: number;
    items: OrderItem[];
    paymentMethod?: PaymentMethod;
    people?: number;
  };
  
  export type Dish = {
      id: string;
      name: string;
      category: string;
      price: number;
      description?: string;
      subRecipeIds: string[];
      isPublic?: boolean;
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
    id: number | string;
    name: string;
    status: 'disponible' | 'ocupada';
    x: number;
    y: number;
    shape: 'square' | 'round';
    people?: number;
    orderId?: string;
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
    people: number;
  };
  
  export type EditedOrderData = NewOrderData & { id: string };


  export type FinancialRecord = {
    id: string;
    date: Date;
    amount: number;
    type: 'revenue' | 'expense';
    description: string;
  }
  
  export type User = {
    id: string;
    name: string;
    email: string;
    role: string;
    status: "Activo" | "Inactivo";
    permissions: string[];
    avatarUrl?: string;
  }
