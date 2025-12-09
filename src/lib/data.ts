




import type { Order, Dish, InventoryItem, SubRecipe, Cook, Table, Waiter, FinancialRecord, User } from './types';

export const initialUsers: User[] = [
    { id: 'usr01', name: "Gerente Demo", email: "gerente@xchef.local", role: "Gerente", status: "Activo", permissions: ["/dashboard", "/dashboard/mesas", "/dashboard/pedidos", "/dashboard/cocina", "/dashboard/menu", "/dashboard/inventario", "/dashboard/finanzas", "/dashboard/usuarios"] },
    { id: 'usr02', name: "Carlos", email: "mesero@xchef.local", role: "Mesero", status: "Activo", permissions: ["/dashboard", "/dashboard/mesas", "/dashboard/pedidos"] },
    { id: 'usr03', name: "Ana", email: "ana@xchef.local", role: "Mesero", status: "Activo", permissions: ["/dashboard", "/dashboard/mesas", "/dashboard/pedidos"] },
    { id: 'usr04', name: "Sofia", email: "sofia@xchef.local", role: "Mesero", status: "Inactivo", permissions: ["/dashboard", "/dashboard/mesas", "/dashboard/pedidos"] },
    { id: 'usr05', name: "Juan", email: "cocinero@xchef.local", role: "Cocinero", status: "Activo", permissions: ["/dashboard/cocina", "/dashboard/menu", "/dashboard/inventario"] },
    { id: 'usr06', name: "Maria", email: "maria@xchef.local", role: "Cocinero", status: "Activo", permissions: ["/dashboard/cocina", "/dashboard/menu", "/dashboard/inventario"] },
    { id: 'usr07', name: "Pedro", email: "pedro@xchef.local", role: "Cocinero", status: "Activo", permissions: ["/dashboard/cocina", "/dashboard/menu", "/dashboard/inventario"] },
  ];
  

export const initialCooks: Cook[] = [
    { id: "usr05", name: "Juan" },
    { id: "usr06", name: "Maria" },
    { id: "usr07", name: "Pedro" },
  ];
  
export const initialInventoryItems: InventoryItem[] = [
    { id: "inv1", name: "Tomates", category: "Vegetales", stock: 20, unit: "kg", threshold: 5, price: 1.50 },
    { id: "inv2", name: "Pechuga de Pollo", category: "Carnes", stock: 15, unit: "kg", threshold: 10, price: 8.00 },
    { id: "inv3", name: "Queso Mozzarella", category: "Lácteos", stock: 8, unit: "kg", threshold: 4, price: 7.50 },
    { id: "inv4", name: "Harina de Trigo", category: "Secos", stock: 50, unit: "kg", threshold: 20, price: 1.00 },
    { id: "inv5", name: "Aceite de Oliva", category: "Aceites", stock: 10, unit: "litros", threshold: 5, price: 12.00 },
    { id: "inv6", name: "Vino Tinto", category: "Bebidas", stock: 3, unit: "botellas", threshold: 5, price: 9.50 },
    { id: "inv7", name: "Servilletas", category: "No Alimentos", stock: 5, unit: "paquetes", threshold: 2, price: 2.00 },
    { id: "inv8", name: "Sal", category: "Condimentos", stock: 25, unit: "kg", threshold: 2, price: 0.50 },
    { id: "inv9", name: "Levadura", category: "Secos", stock: 1, unit: "kg", price: 20.00 }, // Price for 1kg
    { id: "inv10", name: "Salsa de tomate", category: "Salsas", stock: 10, unit: "litros", price: 2.50},
    { id: "inv11", name: "Lechuga Romana", category: "Vegetales", stock: 30, unit: "unidades", price: 0.80},
    { id: "inv12", name: "Yemas de huevo", category: "Lácteos", stock: 100, unit: "unidades", price: 0.20},
    { id: "inv13", name: "Anchoas", category: "Conservas", stock: 20, unit: "latas", price: 3.00},
    { id: "inv14", name: "Ajo", category: "Vegetales", stock: 5, unit: "cabezas", price: 0.30},
    { id: "inv15", name: "Mostaza", category: "Condimentos", stock: 2, unit: "kg", price: 10.00}, // Price for 1kg
    { id: "inv16", name: "Pasta", category: "Secos", stock: 40, unit: "kg", price: 2.00},
    { id: "inv17", name: "Panceta", category: "Carnes", stock: 10, unit: "kg", price: 15.00},
    { id: "inv18", name: "Queso Pecorino", category: "Lácteos", stock: 5, unit: "kg", price: 25.00},
    { id: "inv19", name: "Carne de res", category: "Carnes", stock: 20, unit: "kg", price: 10.00},
    { id: "inv20", name: "Pan de hamburguesa", category: "Panadería", stock: 50, unit: "unidades", price: 0.50},
    { id: "inv21", name: "Papas", category: "Vegetales", stock: 30, unit: "kg", price: 1.20},
  ];
  
export const initialSubRecipes: Omit<SubRecipe, 'status' | 'assignedCook'>[] = [
      { id: "sr1", name: "Preparar masa", description: "Mezclar harina, agua, levadura y sal. Amasar durante 10 minutos.", prepTime: 10, ingredients: [{inventoryId: "inv4", quantity: 0.5, wastage: 0}, {inventoryId: "inv9", quantity: 10, wastage: 0}, {inventoryId: "inv8", quantity: 0.02, wastage: 0}] },
      { id: "sr2", name: "Añadir salsa y queso", description: "Extender la salsa de tomate sobre la masa y espolvorear mozzarella rallada.", prepTime: 5, ingredients: [{inventoryId: "inv10", quantity: 0.1, wastage: 5}, {inventoryId: "inv3", quantity: 0.2, wastage: 0}] },
      { id: "sr3", name: "Hornear", description: "Hornear a 220°C durante 15 minutos o hasta que esté dorada.", prepTime: 15, ingredients: [] },
      { id: "sr4", name: "Lavar y cortar lechuga", description: "Lavar la lechuga romana y cortarla en trozos grandes.", prepTime: 5, ingredients: [{inventoryId: "inv11", quantity: 1, wastage: 15}] },
      { id: "sr5", name: "Preparar aderezo", description: "Mezclar yemas de huevo, anchoas, ajo, mostaza y aceite.", prepTime: 7, ingredients: [{inventoryId: "inv12", quantity: 2, wastage: 0}, {inventoryId: "inv13", quantity: 0.5, wastage: 10}, {inventoryId: "inv14", quantity: 0.25, wastage: 20}, {inventoryId: "inv15", quantity: 10, wastage: 0}, {inventoryId: "inv5", quantity: 0.1, wastage: 0}] },
      { id: "sr6", name: "Hervir pasta", description: "Cocinar la pasta al dente según las instrucciones del paquete.", prepTime: 12, ingredients: [{inventoryId: "inv16", quantity: 0.2, wastage: 0}] },
      { id: "sr7", name: "Saltear panceta", description: "Cortar y saltear la panceta hasta que esté crujiente.", prepTime: 5, ingredients: [{inventoryId: "inv17", quantity: 0.1, wastage: 30}] },
      { id: "sr8", name: "Mezclar salsa", description: "Batir huevos y queso Pecorino. Mezclar con la panceta y la pasta caliente.", prepTime: 4, ingredients: [{inventoryId: "inv12", quantity: 2, wastage: 0}, {inventoryId: "inv18", quantity: 0.05, wastage: 0}] },
      { id: "sr9", name: "Emplatar", description: "Servir inmediatamente con pimienta negra recién molida.", prepTime: 2, ingredients: [] },
      { id: "sr10", name: "Cocinar carne", description: "Formar la hamburguesa y cocinarla al punto deseado.", prepTime: 8, ingredients: [{inventoryId: "inv19", quantity: 0.25, wastage: 25}] },
      { id: "sr11", name: "Montar hamburguesa", description: "Colocar la carne en el pan con lechuga, tomate y salsas.", prepTime: 3, ingredients: [{inventoryId: "inv20", quantity: 1, wastage: 0}, {inventoryId: "inv11", quantity: 0.1, wastage: 15}, {inventoryId: "inv1", quantity: 0.1, wastage: 10}] },
      { id: "sr12", name: "Freír papas", description: "Freír las papas en aceite caliente hasta que estén doradas y crujientes.", prepTime: 10, ingredients: [{inventoryId: "inv21", quantity: 0.3, wastage: 20}] },
  ]
  
export const initialDishes: Dish[] = [
    { id: "d1", name: "Pizza Margherita", category: "Pizzas", price: 12.50, subRecipeIds: ["sr1", "sr2", "sr3"] },
    { id: "d2", name: "Ensalada César", category: "Ensaladas", price: 8.00, subRecipeIds: ["sr4", "sr5"] },
    { id: "d3", name: "Pasta Carbonara", category: "Pastas", price: 14.00, subRecipeIds: ["sr6", "sr7", "sr8"] },
    { id: "d4", name: "Hamburguesa XChef", category: "Hamburguesas", price: 11.50, subRecipeIds: ["sr10", "sr11"] },
    { id: "d5", name: "Papas Fritas", category: "Acompañamientos", price: 4.00, subRecipeIds: ["sr12"] },
  ]
  
const subRecipesForOrders = initialSubRecipes.map(sr => ({...sr, status: 'Pendiente' as const, assignedCook: undefined}));

export const initialOrders: Order[] = [
    {
      id: "ORD001",
      table: "Mesa 5",
      waiter: "Carlos",
      status: "Entregado",
      paymentMethod: "Tarjeta",
      total: 42.5,
      createdAt: Date.now() - 5 * 60 * 1000,
      people: 2,
      items: [
          { id: 'd1', name: 'Pizza Margherita', quantity: 1, price: 12.50, subRecipeIds: ["sr1", "sr2", "sr3"], subRecipes: [] },
          { id: 'd6', name: 'Refresco', quantity: 2, price: 2.50, subRecipeIds: [], subRecipes: [] },
          { id: 'd7', name: 'Tiramisú', quantity: 1, price: 7.50, subRecipeIds: [], subRecipes: [] },
      ]
    },
    {
      id: "ORD002",
      table: "Mesa 2",
      waiter: "Ana",
      status: "Preparando",
      total: 89.9,
      createdAt: Date.now() - 12 * 60 * 1000,
      people: 4,
      items: [
        {
          name: "Pizza Margherita",
          id: 'd1',
          quantity: 1,
          price: 12.5,
          subRecipeIds: ["sr1", "sr2", "sr3"],
          subRecipes: [
            { ...subRecipesForOrders.find(sr => sr.id === 'sr1')!, id: "sr1", status: "Listo", prepTime: 10 },
            { ...subRecipesForOrders.find(sr => sr.id === 'sr2')!, id: "sr2", name: "Añadir salsa y queso", description: "Extender la salsa de tomate sobre la masa y espolvorear mozzarella rallada.", status: "Preparando", assignedCook: "cook1", prepTime: 5 },
            { ...subRecipesForOrders.find(sr => sr.id === 'sr3')!, id: "sr3", name: "Hornear", description: "Hornear a 220°C durante 15 minutos o hasta que esté dorada.", status: "Pendiente", prepTime: 15 },
          ],
        },
        {
          name: "Ensalada César",
          id: 'd2',
          price: 8,
          quantity: 1,
          notes: "Sin crutones",
          subRecipeIds: ["sr4", "sr5"],
          subRecipes: [
            { ...subRecipesForOrders.find(sr => sr.id === 'sr4')!, id: "sr4", name: "Lavar y cortar lechuga", description: "Lavar la lechuga romana y cortarla en trozos grandes.", status: "Preparando", assignedCook: "cook2", prepTime: 5 },
            { ...subRecipesForOrders.find(sr => sr.id === 'sr5')!, id: "sr5", name: "Preparar aderezo", description: "Mezclar yemas de huevo, anchoas, ajo, mostaza y aceite.", status: "Pendiente", prepTime: 7 },
          ],
        },
      ],
    },
    {
        id: "ORD003",
        table: "Terraza 1",
        waiter: "Carlos",
        status: "Listo",
        total: 28.0,
        createdAt: Date.now() - 20 * 60 * 1000,
        people: 3,
        items: [
            {
                name: "Pasta Carbonara",
                id: 'd3',
                price: 14,
                quantity: 2,
                subRecipeIds: ["sr6", "sr7", "sr8", "sr9"],
                subRecipes: [
                  { ...subRecipesForOrders.find(sr => sr.id === 'sr6')!, id: "sr6", status: "Listo", prepTime: 12 },
                  { ...subRecipesForOrders.find(sr => sr.id === 'sr7')!, id: "sr7", status: "Listo", prepTime: 5 },
                  { ...subRecipesForOrders.find(sr => sr.id === 'sr8')!, id: "sr8", status: "Preparando", assignedCook: "cook1", prepTime: 4 },
                  { ...subRecipesForOrders.find(sr => sr.id === 'sr9')!, id: "sr9", status: "Pendiente", prepTime: 2 },
                ],
            },
        ],
      },
    {
      id: "ORD004",
      table: "Mesa 8",
      waiter: "Sofia",
      status: "Pendiente",
      total: 30.0,
      createdAt: Date.now() - 22 * 60 * 1000,
      people: 2,
      items: [
        {
            name: "Hamburguesa XChef",
            id: 'd4',
            price: 11.5,
            quantity: 1,
            notes: "Poco hecha",
            subRecipeIds: ["sr10", "sr11"],
            subRecipes: [
              { ...subRecipesForOrders.find(sr => sr.id === 'sr10')!, id: "sr10", status: "Preparando", assignedCook: "cook3", prepTime: 8 },
              { ...subRecipesForOrders.find(sr => sr.id === 'sr11')!, id: "sr11", status: "Pendiente", prepTime: 3 },
            ],
          },
          {
            name: "Papas Fritas",
            id: 'd5',
            price: 4.0,
            quantity: 1,
            subRecipeIds: ["sr12"],
            subRecipes: [
              { ...subRecipesForOrders.find(sr => sr.id === 'sr12')!, id: "sr12", status: "Pendiente", prepTime: 10 },
            ],
          },
      ]
    },
    {
      id: "ORD005",
      table: "Mesa 3",
      waiter: "Ana",
      status: "Entregado",
      paymentMethod: "Efectivo",
      total: 55.75,
      createdAt: Date.now() - 60 * 60 * 1000,
      people: 2,
      items: []
    },
    {
      id: "ORD006",
      table: "Barra 1",
      waiter: "Carlos",
      status: "Cancelado",
      total: 25.0,
      createdAt: Date.now() - 120 * 60 * 1000,
      people: 1,
      items: []
    },
  ];

export const initialTables: Table[] = [
    { id: 1, name: "Mesa 1", status: 'disponible', shape: 'square', x:0, y:0 },
    { id: 2, name: "Mesa 2", status: 'ocupada', shape: 'square', x:0, y:0, orderId: "ORD002", people: 4 }, 
    { id: 3, name: "Mesa 3", status: 'disponible', shape: 'square', x:0, y:0 },
    { id: 4, name: "Mesa 4", status: 'disponible', shape: 'round', x:0, y:0 }, 
    { id: 5, name: "Mesa 5", status: 'ocupada', shape: 'round', x:0, y:0, orderId: "ORD001", people: 2 }, 
    { id: 6, name: "Barra 1", status: 'ocupada', shape: 'square', x:0, y:0, orderId: "ORD006", people: 1 },
    { id: 7, name: "Barra 2", status: 'disponible', shape: 'square', x:0, y:0 }, 
    { id: 8, name: "Mesa 8", status: 'ocupada', shape: 'square', x:0, y:0, orderId: "ORD004", people: 2 }, 
    { id: 9, name: "Terraza 1", status: 'ocupada', shape: 'square', x:0, y:0, orderId: "ORD003", people: 3 },
    { id: 10, name: "Terraza 2", status: 'disponible', shape: 'square', x:0, y:0 }, 
    { id: 11, name: "Terraza 3", status: 'disponible', shape: 'round', x:0, y:0 }, 
    { id: 12, name: "Terraza 4", status: 'disponible', shape: 'round', x:0, y:0 },
];

export const initialWaiters: Waiter[] = [
    { id: 'usr02', name: "Carlos" },
    { id: 'usr03', name: "Ana" },
    { id: 'usr04', name: "Sofia" },
];

export const initialFinancials: FinancialRecord[] = [
    { id: 'fin001', date: new Date(Date.now() - 5 * 60 * 1000), amount: 42.5, type: 'revenue', description: 'Pedido ORD001'},
    { id: 'fin002', date: new Date(Date.now() - 60 * 60 * 1000), amount: 55.75, type: 'revenue', description: 'Pedido ORD005'},
];

    
