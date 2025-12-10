require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Importar rutas
const rutasUsuarios = require('./rutas/usuarios');
const rutasMesas = require('./rutas/mesas');
const rutasPedidos = require('./rutas/pedidos');
const rutasPlatillos = require('./rutas/platillos');
const rutasSubRecetas = require('./rutas/subRecetas');
const rutasInventario = require('./rutas/inventario');
const rutasFinanzas = require('./rutas/finanzas');
const rutasAutenticacion = require('./rutas/autenticacion');
const rutasCocineros = require('./rutas/cocineros');
const rutasMeseros = require('./rutas/meseros');

const app = express();
const PUERTO = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:9002',
  credentials: true
}));
app.use(express.json());

// Rutas de la API
app.use('/api/autenticacion', rutasAutenticacion);
app.use('/api/usuarios', rutasUsuarios);
app.use('/api/mesas', rutasMesas);
app.use('/api/pedidos', rutasPedidos);
app.use('/api/platillos', rutasPlatillos);
app.use('/api/subrecetas', rutasSubRecetas);
app.use('/api/inventario', rutasInventario);
app.use('/api/finanzas', rutasFinanzas);
app.use('/api/cocineros', rutasCocineros);
app.use('/api/meseros', rutasMeseros);

// Ruta de salud del servidor
app.get('/api/salud', (req, res) => {
  res.json({ estado: 'ok', mensaje: 'Servidor XChef funcionando correctamente' });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    mensaje: err.message 
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(PUERTO, () => {
  console.log(`🍳 Servidor XChef ejecutándose en puerto ${PUERTO}`);
});

module.exports = app;
