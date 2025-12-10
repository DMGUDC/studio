const express = require('express');
const router = express.Router();
const { ejecutarConsulta } = require('../config/baseDatos');
const { verificarToken } = require('../middleware/autenticacion');

router.use(verificarToken);

// Obtener todos los cocineros
router.get('/', async (req, res) => {
  try {
    const cocineros = await ejecutarConsulta(
      `SELECT id, nombre as name FROM usuarios WHERE rol = 'Cocinero' AND estado = 'Activo'`
    );
    res.json(cocineros);
  } catch (error) {
    console.error('Error al obtener cocineros:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  }
});

module.exports = router;
