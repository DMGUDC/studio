const express = require('express');
const router = express.Router();
const controlador = require('../controladores/platillosControlador');
const { verificarToken } = require('../middleware/autenticacion');

// Ruta pública para el menú de clientes
router.get('/publicos', controlador.obtenerPublicos);

// Rutas protegidas
router.use(verificarToken);

router.get('/', controlador.obtenerTodos);
router.get('/:id', controlador.obtenerPorId);
router.get('/:id/disponibilidad', controlador.verificarDisponibilidad);
router.post('/', controlador.crear);
router.put('/:id', controlador.actualizar);
router.patch('/:id/visibilidad', controlador.cambiarVisibilidad);
router.delete('/:id', controlador.eliminar);

module.exports = router;
