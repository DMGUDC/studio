const express = require('express');
const router = express.Router();
const controlador = require('../controladores/autenticacionControlador');
const { verificarToken } = require('../middleware/autenticacion');

// Rutas públicas
router.post('/login', controlador.iniciarSesion);
router.post('/logout', controlador.cerrarSesion);

// Rutas protegidas
router.get('/verificar', verificarToken, controlador.verificarSesion);

module.exports = router;
