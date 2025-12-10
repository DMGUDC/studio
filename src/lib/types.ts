// =====================================================
// Tipos para XChef - Sistema de Gestión de Restaurantes
// Nombres en español con compatibilidad para API
// =====================================================

// Cocinero
export type Cocinero = {
  id: string;
  nombre: string;
};

// Alias para compatibilidad
export type Cook = {
  id: string;
  name: string;
};

// Ingrediente
export type Ingrediente = {
  inventarioId: string;
  cantidad: number;
  merma: number; // Porcentaje
};

// Alias para compatibilidad
export type Ingredient = {
  inventoryId: string;
  quantity: number;
  wastage: number;
};

// SubReceta
export type SubReceta = {
  id: string;
  nombre: string;
  descripcion: string;
  estado: "Pendiente" | "Preparando" | "Listo";
  cocineroAsignado?: string;
  tiempoPreparacion: number;
  ingredientes: Ingrediente[];
  // Alias para compatibilidad
  name?: string;
  description?: string;
  status?: "Pendiente" | "Preparando" | "Listo";
  assignedCook?: string;
  prepTime?: number;
  ingredients?: Ingredient[];
};

// Alias para compatibilidad
export type SubRecipe = SubReceta;

// Item de Pedido
export type ItemPedido = {
  id: string;
  nombre: string;
  cantidad: number;
  precio: number;
  notas?: string;
  subRecetaIds: string[];
  subRecetas: SubReceta[];
  // Alias para compatibilidad
  name?: string;
  quantity?: number;
  price?: number;
  notes?: string;
  subRecipeIds?: string[];
  subRecipes?: SubReceta[];
};

// Alias para compatibilidad
export type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
  subRecipeIds: string[];
  subRecipes: SubReceta[];
};

// Método de Pago
export type MetodoPago = "Efectivo" | "Tarjeta" | "Otro";
export type PaymentMethod = MetodoPago;

// Pedido
export type Pedido = {
  id: string;
  mesa: string;
  mesero: string;
  estado: "Pendiente" | "Preparando" | "Listo" | "Entregado" | "Cancelado";
  total: number;
  creadoEn: number;
  items: ItemPedido[];
  metodoPago?: MetodoPago;
  personas?: number;
  // Alias para compatibilidad
  table?: string;
  waiter?: string;
  status?: "Pendiente" | "Preparando" | "Listo" | "Entregado" | "Cancelado";
  createdAt?: number;
  paymentMethod?: MetodoPago;
  people?: number;
};

// Alias para compatibilidad
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

// Platillo
export type Platillo = {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  descripcion?: string;
  subRecetaIds: string[];
  esPublico?: boolean;
  // Alias para compatibilidad
  name?: string;
  category?: string;
  price?: number;
  description?: string;
  subRecipeIds?: string[];
  isPublic?: boolean;
};

// Alias para compatibilidad
export type Dish = {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  subRecipeIds: string[];
  isPublic?: boolean;
};

// Item de Inventario
export type ItemInventario = {
  id: string;
  nombre: string;
  categoria: string;
  stock: number;
  unidad: string;
  umbral: number;
  precio: number;
  // Alias para compatibilidad
  name?: string;
  category?: string;
  unit?: string;
  threshold?: number;
  price?: number;
};

// Alias para compatibilidad
export type InventoryItem = {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  threshold: number;
  price: number;
};

// Mesa
export type Mesa = {
  id: number | string;
  nombre: string;
  estado: 'disponible' | 'ocupada';
  posicionX: number;
  posicionY: number;
  forma: 'cuadrada' | 'redonda';
  personas?: number;
  pedidoId?: string;
  pisoId?: string;
  // Alias para compatibilidad
  name?: string;
  status?: 'disponible' | 'ocupada';
  x?: number;
  y?: number;
  shape?: 'square' | 'round';
  people?: number;
  orderId?: string;
};

// Alias para compatibilidad
export type Table = {
  id: number | string;
  name: string;
  status: 'disponible' | 'ocupada';
  x: number;
  y: number;
  shape: 'square' | 'round';
  people?: number;
  orderId?: string;
};

// Mesero
export type Mesero = {
  id: string;
  nombre: string;
};

// Alias para compatibilidad
export type Waiter = {
  id: string;
  name: string;
};

// Datos para nuevo pedido
export type DatosNuevoPedido = {
  mesa: string;
  mesero: string;
  items: ItemPedido[];
  total: number;
  personas: number;
};

export type NewOrderData = {
  table: string;
  waiter: string;
  items: OrderItem[];
  total: number;
  people: number;
};

export type DatosPedidoEditado = DatosNuevoPedido & { id: string };
export type EditedOrderData = NewOrderData & { id: string };

// Registro Financiero
export type RegistroFinanciero = {
  id: string;
  fecha: Date;
  monto: number;
  tipo: 'ingreso' | 'gasto';
  descripcion: string;
  // Alias para compatibilidad
  date?: Date;
  amount?: number;
  type?: 'revenue' | 'expense';
  description?: string;
};

export type FinancialRecord = {
  id: string;
  date: Date;
  amount: number;
  type: 'revenue' | 'expense';
  description: string;
};

// Usuario
export type Usuario = {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  estado: "Activo" | "Inactivo";
  permisos: string[];
  urlAvatar?: string;
  // Alias para compatibilidad
  name?: string;
  email?: string;
  role?: string;
  status?: "Activo" | "Inactivo";
  permissions?: string[];
  avatarUrl?: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Activo" | "Inactivo";
  permissions: string[];
  avatarUrl?: string;
};
