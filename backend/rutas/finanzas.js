const express = require('express');
const router = express.Router();
const controlador = require('../controladores/finanzasControlador');
const { verificarToken } = require('../middleware/autenticacion');

router.use(verificarToken);

router.get('/', controlador.obtenerTodos);
router.get('/rango', controlador.obtenerPorRango);
router.get('/resumen', controlador.obtenerResumen);
router.get('/grafico', controlador.obtenerDatosGrafico);
router.post('/', controlador.crear);
router.delete('/:id', controlador.eliminar);

module.exports = router;
