const jwt = require('jsonwebtoken');

const JWT_SECRETO = process.env.JWT_SECRETO || 'secreto_desarrollo_xchef';

// Middleware para verificar el token JWT
function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Acceso denegado', 
      mensaje: 'No se proporcionó token de autenticación' 
    });
  }

  try {
    const verificado = jwt.verify(token, JWT_SECRETO);
    req.usuario = verificado;
    next();
  } catch (error) {
    return res.status(403).json({ 
      error: 'Token inválido', 
      mensaje: 'El token de autenticación no es válido o ha expirado' 
    });
  }
}

// Middleware para verificar rol específico
function verificarRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ 
        error: 'No autenticado', 
        mensaje: 'Debe iniciar sesión primero' 
      });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ 
        error: 'Acceso denegado', 
        mensaje: 'No tiene permisos para realizar esta acción' 
      });
    }

    next();
  };
}

// Middleware para verificar permiso específico
function verificarPermiso(permisoRequerido) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ 
        error: 'No autenticado', 
        mensaje: 'Debe iniciar sesión primero' 
      });
    }

    if (!req.usuario.permisos || !req.usuario.permisos.includes(permisoRequerido)) {
      return res.status(403).json({ 
        error: 'Acceso denegado', 
        mensaje: `No tiene permiso para acceder a ${permisoRequerido}` 
      });
    }

    next();
  };
}

module.exports = {
  verificarToken,
  verificarRol,
  verificarPermiso,
  JWT_SECRETO
};
