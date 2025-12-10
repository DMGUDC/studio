const express = require('express');
const router = express.Router();
const { ejecutarConsulta } = require('../config/baseDatos');
const { verificarToken } = require('../middleware/autenticacion');

router.use(verificarToken);

// Obtener todos los meseros
router.get('/', async (req, res) => {
  try {
    const meseros = await ejecutarConsulta(
      `SELECT id, nombre as name FROM usuarios WHERE rol = 'Mesero' AND estado = 'Activo'`
    );
    res.json(meseros);
  } catch (error) {
    console.error('Error al obtener meseros:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  }
});

module.exports = router;
