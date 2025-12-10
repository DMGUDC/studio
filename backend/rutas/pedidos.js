const express = require('express');
const router = express.Router();
const controlador = require('../controladores/pedidosControlador');
const { verificarToken } = require('../middleware/autenticacion');

router.use(verificarToken);

router.get('/', controlador.obtenerTodos);
router.get('/:id', controlador.obtenerPorId);
router.post('/', controlador.crear);
router.put('/:id', controlador.actualizar);
router.patch('/:id/estado', controlador.actualizarEstado);
router.post('/:id/liquidar', controlador.liquidar);
router.patch('/:pedidoId/item/:itemId/subreceta/:subrecetaId', controlador.actualizarSubreceta);

module.exports = router;
