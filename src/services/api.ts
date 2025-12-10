// Configuración de la API
const API_URL = typeof window !== 'undefined' 
  ? (window as unknown as { ENV_API_URL?: string }).ENV_API_URL || 'http://localhost:3000/api'
  : 'http://localhost:3000/api';

// Almacenamiento del token
let tokenAutenticacion: string | null = null;

// Función para establecer el token
export function establecerToken(token: string | null) {
  tokenAutenticacion = token;
  if (token) {
    localStorage.setItem('xchef_token', token);
  } else {
    localStorage.removeItem('xchef_token');
  }
}

// Función para obtener el token
export function obtenerToken(): string | null {
  if (!tokenAutenticacion && typeof window !== 'undefined') {
    tokenAutenticacion = localStorage.getItem('xchef_token');
  }
  return tokenAutenticacion;
}

// Headers por defecto
function obtenerHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const token = obtenerToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Función genérica para peticiones
async function peticion<T>(
  endpoint: string,
  opciones: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...opciones,
    headers: {
      ...obtenerHeaders(),
      ...opciones.headers,
    },
  };

  try {
    const respuesta = await fetch(url, config);
    
    if (!respuesta.ok) {
      const error = await respuesta.json().catch(() => ({ mensaje: 'Error de conexión' }));
      throw new Error(error.mensaje || `Error ${respuesta.status}`);
    }

    return respuesta.json();
  } catch (error) {
    console.error(`Error en petición a ${endpoint}:`, error);
    throw error;
  }
}

// ============================================
// API de Autenticación
// ============================================
export const apiAutenticacion = {
  async iniciarSesion(correo: string, contrasena?: string) {
    const datos = await peticion<{ token: string; usuario: Usuario }>('/autenticacion/login', {
      method: 'POST',
      body: JSON.stringify({ correo, contrasena }),
    });
    establecerToken(datos.token);
    return datos;
  },

  async verificarSesion() {
    return peticion<{ usuario: Usuario }>('/autenticacion/verificar');
  },

  cerrarSesion() {
    establecerToken(null);
    return Promise.resolve();
  },
};

// ============================================
// API de Usuarios
// ============================================
export const apiUsuarios = {
  obtenerTodos: () => peticion<Usuario[]>('/usuarios'),
  obtenerPorId: (id: string) => peticion<Usuario>(`/usuarios/${id}`),
  crear: (usuario: Omit<Usuario, 'id'>) => 
    peticion<{ mensaje: string; usuario: Usuario }>('/usuarios', {
      method: 'POST',
      body: JSON.stringify(usuario),
    }),
  actualizar: (id: string, usuario: Partial<Usuario>) =>
    peticion<{ mensaje: string }>(`/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(usuario),
    }),
  eliminar: (id: string) =>
    peticion<{ mensaje: string }>(`/usuarios/${id}`, { method: 'DELETE' }),
  actualizarAvatar: (id: string, urlAvatar: string) =>
    peticion<{ mensaje: string }>(`/usuarios/${id}/avatar`, {
      method: 'PATCH',
      body: JSON.stringify({ urlAvatar }),
    }),
  cambiarContrasena: (id: string, contrasenaActual: string, contrasenaNueva: string) =>
    peticion<{ mensaje: string }>(`/usuarios/${id}/contrasena`, {
      method: 'PATCH',
      body: JSON.stringify({ contrasenaActual, contrasenaNueva }),
    }),
};

// ============================================
// API de Mesas
// ============================================
export const apiMesas = {
  obtenerTodas: () => peticion<Mesa[]>('/mesas'),
  obtenerPisos: () => peticion<Record<string, { nombre: string; mesas: Mesa[] }>>('/mesas/pisos'),
  obtenerPorPiso: (pisoId: string) => peticion<Mesa[]>(`/mesas/piso/${pisoId}`),
  crear: (mesa: Omit<Mesa, 'id'>) =>
    peticion<{ mensaje: string; mesa: Mesa }>('/mesas', {
      method: 'POST',
      body: JSON.stringify(mesa),
    }),
  actualizarEstado: (id: string, datos: { estado: string; pedidoId?: string; personas?: number }) =>
    peticion<{ mensaje: string }>(`/mesas/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify(datos),
    }),
  actualizarEstadoPorNombre: (nombre: string, datos: { estado: string; pedidoId?: string; personas?: number }) =>
    peticion<{ mensaje: string }>(`/mesas/nombre/${encodeURIComponent(nombre)}/estado`, {
      method: 'PATCH',
      body: JSON.stringify(datos),
    }),
  actualizarPosicion: (id: string, posicionX: number, posicionY: number) =>
    peticion<{ mensaje: string }>(`/mesas/${id}/posicion`, {
      method: 'PATCH',
      body: JSON.stringify({ posicionX, posicionY }),
    }),
  eliminar: (id: string) =>
    peticion<{ mensaje: string }>(`/mesas/${id}`, { method: 'DELETE' }),
};

// ============================================
// API de Pedidos
// ============================================
export const apiPedidos = {
  obtenerTodos: () => peticion<Pedido[]>('/pedidos'),
  obtenerPorId: (id: string) => peticion<Pedido>(`/pedidos/${id}`),
  crear: (pedido: DatosNuevoPedido) =>
    peticion<{ mensaje: string; pedido: Pedido }>('/pedidos', {
      method: 'POST',
      body: JSON.stringify(pedido),
    }),
  actualizar: (id: string, pedido: DatosPedidoEditado) =>
    peticion<{ mensaje: string }>(`/pedidos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(pedido),
    }),
  actualizarEstado: (id: string, estado: string, metodoPago?: string, montoFinal?: number) =>
    peticion<{ mensaje: string }>(`/pedidos/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado, metodoPago, montoFinal }),
    }),
  liquidar: (id: string, metodoPago: string, montoFinal: number) =>
    peticion<{ mensaje: string }>(`/pedidos/${id}/liquidar`, {
      method: 'POST',
      body: JSON.stringify({ metodoPago, montoFinal }),
    }),
  actualizarSubreceta: (pedidoId: string, itemId: string, subrecetaId: string, datos: { estado: string; cocineroAsignado?: string }) =>
    peticion<{ mensaje: string }>(`/pedidos/${pedidoId}/item/${itemId}/subreceta/${subrecetaId}`, {
      method: 'PATCH',
      body: JSON.stringify(datos),
    }),
};

// ============================================
// API de Platillos
// ============================================
export const apiPlatillos = {
  obtenerTodos: () => peticion<Platillo[]>('/platillos'),
  obtenerPublicos: () => peticion<Platillo[]>('/platillos/publicos'),
  obtenerPorId: (id: string) => peticion<Platillo>(`/platillos/${id}`),
  verificarDisponibilidad: (id: string) => peticion<{ disponible: boolean }>(`/platillos/${id}/disponibilidad`),
  crear: (platillo: Omit<Platillo, 'id'>) =>
    peticion<{ mensaje: string; platillo: Platillo }>('/platillos', {
      method: 'POST',
      body: JSON.stringify(platillo),
    }),
  actualizar: (id: string, platillo: Partial<Platillo>) =>
    peticion<{ mensaje: string }>(`/platillos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(platillo),
    }),
  cambiarVisibilidad: (id: string, isPublic: boolean) =>
    peticion<{ mensaje: string }>(`/platillos/${id}/visibilidad`, {
      method: 'PATCH',
      body: JSON.stringify({ isPublic }),
    }),
  eliminar: (id: string) =>
    peticion<{ mensaje: string }>(`/platillos/${id}`, { method: 'DELETE' }),
};

// ============================================
// API de SubRecetas
// ============================================
export const apiSubRecetas = {
  obtenerTodas: () => peticion<SubReceta[]>('/subrecetas'),
  obtenerPorId: (id: string) => peticion<SubReceta>(`/subrecetas/${id}`),
  crear: (subreceta: Omit<SubReceta, 'id' | 'status' | 'assignedCook'>) =>
    peticion<{ mensaje: string; subreceta: SubReceta }>('/subrecetas', {
      method: 'POST',
      body: JSON.stringify(subreceta),
    }),
  actualizar: (id: string, subreceta: Partial<SubReceta>) =>
    peticion<{ mensaje: string }>(`/subrecetas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(subreceta),
    }),
  eliminar: (id: string) =>
    peticion<{ mensaje: string }>(`/subrecetas/${id}`, { method: 'DELETE' }),
};

// ============================================
// API de Inventario
// ============================================
export const apiInventario = {
  obtenerTodos: () => peticion<ItemInventario[]>('/inventario'),
  obtenerPorId: (id: string) => peticion<ItemInventario>(`/inventario/${id}`),
  obtenerBajoStock: () => peticion<ItemInventario[]>('/inventario/bajo-stock'),
  crear: (item: Omit<ItemInventario, 'id'>) =>
    peticion<{ mensaje: string; producto: ItemInventario }>('/inventario', {
      method: 'POST',
      body: JSON.stringify(item),
    }),
  actualizar: (id: string, item: Partial<ItemInventario>) =>
    peticion<{ mensaje: string }>(`/inventario/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    }),
  reabastecer: (id: string, cantidad: number) =>
    peticion<{ mensaje: string; costo: number }>(`/inventario/${id}/reabastecer`, {
      method: 'POST',
      body: JSON.stringify({ cantidad }),
    }),
  eliminar: (id: string) =>
    peticion<{ mensaje: string }>(`/inventario/${id}`, { method: 'DELETE' }),
};

// ============================================
// API de Finanzas
// ============================================
export const apiFinanzas = {
  obtenerTodos: () => peticion<RegistroFinanciero[]>('/finanzas'),
  obtenerPorRango: (inicio?: string, fin?: string) => {
    const params = new URLSearchParams();
    if (inicio) params.append('inicio', inicio);
    if (fin) params.append('fin', fin);
    return peticion<RegistroFinanciero[]>(`/finanzas/rango?${params.toString()}`);
  },
  obtenerResumen: (periodo?: string) =>
    peticion<{ ingresos: number; gastos: number; gananciaBruta: number; margenGanancia: number }>(
      `/finanzas/resumen${periodo ? `?periodo=${periodo}` : ''}`
    ),
  obtenerDatosGrafico: (tipo?: string) =>
    peticion<{ date: string; revenue: number; cogs: number }[]>(
      `/finanzas/grafico${tipo ? `?tipo=${tipo}` : ''}`
    ),
  crear: (registro: { monto: number; tipo: 'ingreso' | 'gasto'; descripcion: string }) =>
    peticion<{ mensaje: string; registro: RegistroFinanciero }>('/finanzas', {
      method: 'POST',
      body: JSON.stringify(registro),
    }),
  eliminar: (id: string) =>
    peticion<{ mensaje: string }>(`/finanzas/${id}`, { method: 'DELETE' }),
};

// ============================================
// API de Cocineros
// ============================================
export const apiCocineros = {
  obtenerTodos: () => peticion<Cocinero[]>('/cocineros'),
};

// ============================================
// API de Meseros
// ============================================
export const apiMeseros = {
  obtenerTodos: () => peticion<Mesero[]>('/meseros'),
};

// ============================================
// Tipos (compatibles con el frontend existente)
// ============================================
export type Usuario = {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  estado: 'Activo' | 'Inactivo';
  permisos: string[];
  urlAvatar?: string;
};

export type Mesa = {
  id: string | number;
  nombre: string;
  pisoId?: string;
  estado: 'disponible' | 'ocupada';
  forma: 'cuadrada' | 'redonda';
  posicionX?: number;
  posicionY?: number;
  x?: number;
  y?: number;
  personas?: number;
  pedidoId?: string;
  shape?: 'square' | 'round';
  status?: 'disponible' | 'ocupada';
};

export type Ingrediente = {
  inventoryId: string;
  quantity: number;
  wastage: number;
};

export type SubReceta = {
  id: string;
  nombre: string;
  name?: string;
  descripcion: string;
  description?: string;
  estado?: 'Pendiente' | 'Preparando' | 'Listo';
  status?: 'Pendiente' | 'Preparando' | 'Listo';
  cocineroAsignado?: string;
  assignedCook?: string;
  tiempoPreparacion: number;
  prepTime?: number;
  ingredientes: Ingrediente[];
  ingredients?: Ingrediente[];
};

export type ItemPedido = {
  id: string;
  nombre: string;
  name?: string;
  cantidad: number;
  quantity?: number;
  precio: number;
  price?: number;
  notas?: string;
  notes?: string;
  subRecipeIds: string[];
  subRecipes: SubReceta[];
};

export type MetodoPago = 'Efectivo' | 'Tarjeta' | 'Otro';

export type Pedido = {
  id: string;
  mesa: string;
  mesero: string;
  estado: 'Pendiente' | 'Preparando' | 'Listo' | 'Entregado' | 'Cancelado';
  total: number;
  creadoEn: number;
  createdAt?: number;
  items: ItemPedido[];
  metodoPago?: MetodoPago;
  paymentMethod?: MetodoPago;
  personas?: number;
  people?: number;
};

export type Platillo = {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  descripcion?: string;
  subRecipeIds: string[];
  esPublico?: boolean;
  isPublic?: boolean;
};

export type ItemInventario = {
  id: string;
  nombre: string;
  categoria: string;
  stock: number;
  unidad: string;
  umbral?: number;
  threshold?: number;
  precio?: number;
  price?: number;
};

export type RegistroFinanciero = {
  id: string;
  date: Date | string;
  amount: number;
  type: 'revenue' | 'expense' | 'ingreso' | 'gasto';
  description: string;
};

export type Cocinero = {
  id: string;
  name: string;
};

export type Mesero = {
  id: string;
  name: string;
};

export type DatosNuevoPedido = {
  mesa: string;
  mesero: string;
  items: ItemPedido[];
  total: number;
  personas: number;
};

export type DatosPedidoEditado = DatosNuevoPedido & { id: string };
