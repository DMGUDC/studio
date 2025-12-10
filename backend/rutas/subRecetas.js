const express = require('express');
const router = express.Router();
const controlador = require('../controladores/subRecetasControlador');
const { verificarToken } = require('../middleware/autenticacion');

router.use(verificarToken);

router.get('/', controlador.obtenerTodas);
router.get('/:id', controlador.obtenerPorId);
router.post('/', controlador.crear);
router.put('/:id', controlador.actualizar);
router.delete('/:id', controlador.eliminar);

module.exports = router;
