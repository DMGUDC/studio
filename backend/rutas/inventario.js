const express = require('express');
const router = express.Router();
const controlador = require('../controladores/inventarioControlador');
const { verificarToken } = require('../middleware/autenticacion');

router.use(verificarToken);

router.get('/', controlador.obtenerTodos);
router.get('/bajo-stock', controlador.obtenerBajoStock);
router.get('/:id', controlador.obtenerPorId);
router.post('/', controlador.crear);
router.put('/:id', controlador.actualizar);
router.post('/:id/reabastecer', controlador.reabastecer);
router.post('/:id/descontar', controlador.descontarStock);
router.delete('/:id', controlador.eliminar);

module.exports = router;
