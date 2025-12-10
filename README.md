# XChef - Sistema de Gestión de Restaurantes

Sistema completo para la gestión de restaurantes con frontend en React/Next.js y backend en Node.js/Express con base de datos MySQL.

## Características

- **Gestión de Mesas**: Visualización y control del estado de mesas por pisos
- **Pedidos**: Creación, seguimiento y gestión completa de pedidos
- **Cocina**: Panel de cocina con sub-recetas y asignación de cocineros
- **Menú**: Administración de platillos y sub-recetas
- **Inventario**: Control de stock con alertas de umbral mínimo
- **Finanzas**: Registro de ingresos y gastos con reportes
- **Usuarios**: Gestión de usuarios con roles y permisos
- **Facturación**: Generación de facturas para pedidos

## Tecnologías

### Frontend
- Next.js 15 con App Router
- React 18
- TypeScript
- Tailwind CSS
- Radix UI (componentes)
- Recharts (gráficos)

### Backend
- Node.js
- Express.js
- MySQL
- JWT (autenticación)
- bcrypt (encriptación)

## Dependencias

### Módulos del Backend (backend/package.json)

| Módulo | Versión | Descripción |
|--------|---------|-------------|
| `express` | ^4.18.2 | Framework web para Node.js |
| `mysql2` | ^3.6.5 | Cliente MySQL con soporte de promesas |
| `jsonwebtoken` | ^9.0.2 | Generación y verificación de tokens JWT |
| `bcryptjs` | ^2.4.3 | Encriptación de contraseñas |
| `cors` | ^2.8.5 | Middleware para habilitar CORS |
| `dotenv` | ^16.5.0 | Carga variables de entorno desde .env |

**Instalación directa del backend:**
```bash
cd backend
npm install express@^4.18.2 mysql2@^3.6.5 jsonwebtoken@^9.0.2 bcryptjs@^2.4.3 cors@^2.8.5 dotenv@^16.5.0
```

### Módulos del Frontend (package.json)

| Módulo | Versión | Descripción |
|--------|---------|-------------|
| `next` | 15.3.3 | Framework React con SSR |
| `react` | ^18.3.1 | Biblioteca de UI |
| `react-dom` | ^18.3.1 | Renderizado de React en el DOM |
| `typescript` | ^5 | Tipado estático para JavaScript |
| `tailwindcss` | ^3.4.1 | Framework CSS utilitario |
| `@radix-ui/*` | varios | Componentes de UI accesibles |
| `recharts` | ^2.15.1 | Biblioteca de gráficos |
| `date-fns` | ^3.6.0 | Utilidades para fechas |
| `zod` | ^3.24.2 | Validación de esquemas |
| `react-hook-form` | ^7.54.2 | Manejo de formularios |
| `lucide-react` | ^0.475.0 | Iconos SVG |
| `next-themes` | ^0.3.0 | Soporte para temas (claro/oscuro) |
| `class-variance-authority` | ^0.7.1 | Variantes de clases CSS |
| `clsx` | ^2.1.1 | Utilidad para clases condicionales |
| `tailwind-merge` | ^3.0.1 | Combina clases de Tailwind |

**Instalación directa del frontend:**
```bash
# Dependencias principales
npm install next@15.3.3 react@^18.3.1 react-dom@^18.3.1 recharts@^2.15.1 date-fns@^3.6.0 zod@^3.24.2 react-hook-form@^7.54.2 lucide-react@^0.475.0 next-themes@^0.3.0 class-variance-authority@^0.7.1 clsx@^2.1.1 tailwind-merge@^3.0.1 tailwindcss-animate@^1.0.7

# Componentes Radix UI
npm install @radix-ui/react-accordion@^1.2.3 @radix-ui/react-alert-dialog@^1.1.6 @radix-ui/react-avatar@^1.1.3 @radix-ui/react-checkbox@^1.1.4 @radix-ui/react-collapsible@^1.1.11 @radix-ui/react-dropdown-menu@^2.1.1 @radix-ui/react-dialog@^1.1.6 @radix-ui/react-label@^2.1.2 @radix-ui/react-menubar@^1.1.6 @radix-ui/react-popover@^1.1.6 @radix-ui/react-progress@^1.1.2 @radix-ui/react-radio-group@^1.2.3 @radix-ui/react-scroll-area@^1.2.3 @radix-ui/react-select@^2.1.6 @radix-ui/react-separator@^1.1.2 @radix-ui/react-slider@^1.2.3 @radix-ui/react-slot@^1.2.3 @radix-ui/react-switch@^1.1.3 @radix-ui/react-tabs@^1.1.3 @radix-ui/react-toast@^1.2.6 @radix-ui/react-tooltip@^1.1.8 @hookform/resolvers@^4.1.3

# Dependencias de desarrollo
npm install -D typescript@^5 @types/node@^20 @types/react@^18 @types/react-dom@^18 tailwindcss@^3.4.1 postcss@^8
```

## Instalación

### Requisitos Previos
- Node.js 18+
- MySQL 8.0+
- npm o yarn

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd studio
```

### 2. Configurar la Base de Datos

```bash
# Crear la base de datos y tablas
mysql -u root -p < backend/config/esquema.sql
```

### 3. Configurar el Backend

```bash
cd backend

# Crear archivo .env (o copiar del ejemplo)
cp .env.example .env

# Instalar dependencias
npm install
```

**Ejemplo de archivo `.env` del backend:**

```env
# Configuración del servidor
PORT=3000
NODE_ENV=development

# Configuración de la base de datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contraseña_mysql
DB_NAME=xchef_db

# Configuración de JWT
JWT_SECRET=tu_clave_secreta_segura_aqui
JWT_EXPIRES_IN=24h
```

> **Nota:** Asegúrate de cambiar `DB_PASSWORD` con tu contraseña de MySQL y `JWT_SECRET` con una clave segura en producción.

### 4. Configurar el Frontend

```bash
cd ..

# Instalar dependencias
npm install
```

## Ejecución

### Modo Desarrollo

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

O ejecutar ambos simultáneamente:
```bash
npm run dev:all
```

### Acceso

- **Frontend**: http://localhost:9002
- **Backend API**: http://localhost:3000

### Usuario por Defecto

- **Email**: gerente@xchef.local
- **Contraseña**: 123456

## Estructura del Proyecto

```
studio/
├── backend/                  # Backend Node.js/Express
│   ├── config/              # Configuración DB y esquema SQL
│   ├── controladores/       # Controladores de la API
│   ├── middleware/          # Middleware de autenticación
│   ├── rutas/               # Rutas de la API
│   └── servidor.js          # Punto de entrada del servidor
├── src/
│   ├── app/                 # Páginas Next.js (App Router)
│   │   ├── dashboard/       # Páginas del dashboard
│   │   └── login/           # Página de login
│   ├── components/          # Componentes React
│   ├── context/             # Contextos (Auth, Restaurant)
│   ├── lib/                 # Utilidades y tipos
│   └── services/            # Servicios de API
└── package.json
```

## Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el frontend en modo desarrollo |
| `npm run dev:backend` | Inicia el backend en modo desarrollo |
| `npm run dev:all` | Inicia frontend y backend simultáneamente |
| `npm run build` | Compila el frontend para producción |
| `npm run backend:install` | Instala dependencias del backend |
| `npm run backend:start` | Inicia el backend en modo producción |
