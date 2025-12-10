const express = require('express');
const router = express.Router();
const controlador = require('../controladores/usuariosControlador');
const { verificarToken } = require('../middleware/autenticacion');

// Todas las rutas requieren autenticación
router.use(verificarToken);

router.get('/', controlador.obtenerTodos);
router.get('/:id', controlador.obtenerPorId);
router.post('/', controlador.crear);
router.put('/:id', controlador.actualizar);
router.patch('/:id/avatar', controlador.actualizarAvatar);
router.patch('/:id/contrasena', controlador.cambiarContrasena);
router.delete('/:id', controlador.eliminar);

module.exports = router;
