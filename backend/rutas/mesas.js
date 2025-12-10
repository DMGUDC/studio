const express = require('express');
const router = express.Router();
const controlador = require('../controladores/mesasControlador');
const { verificarToken } = require('../middleware/autenticacion');

router.use(verificarToken);

router.get('/', controlador.obtenerTodas);
router.get('/pisos', controlador.obtenerPisos);
router.get('/piso/:pisoId', controlador.obtenerPorPiso);
router.post('/', controlador.crear);
router.patch('/:id/estado', controlador.actualizarEstado);
router.patch('/nombre/:nombre/estado', controlador.actualizarEstadoPorNombre);
router.patch('/:id/posicion', controlador.actualizarPosicion);
router.delete('/:id', controlador.eliminar);

module.exports = router;
