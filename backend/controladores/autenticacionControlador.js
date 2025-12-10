const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ejecutarConsulta } = require('../config/baseDatos');
const { JWT_SECRETO } = require('../middleware/autenticacion');

const JWT_EXPIRACION = process.env.JWT_EXPIRACION || '24h';

// Iniciar sesión
async function iniciarSesion(req, res) {
  try {
    const { correo, contrasena } = req.body;

    if (!correo) {
      return res.status(400).json({ 
        error: 'Datos incompletos', 
        mensaje: 'El correo es requerido' 
      });
    }

    // Buscar usuario por correo
    const usuarios = await ejecutarConsulta(
      'SELECT * FROM usuarios WHERE correo = ?',
      [correo]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas', 
        mensaje: 'Correo o contraseña incorrectos' 
      });
    }

    const usuario = usuarios[0];

    // Verificar si el usuario está activo
    if (usuario.estado !== 'Activo') {
      return res.status(401).json({ 
        error: 'Usuario inactivo', 
        mensaje: 'Su cuenta está desactivada. Contacte al administrador.' 
      });
    }

    // Verificar contraseña (si se proporciona)
    if (contrasena) {
      const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
      if (!contrasenaValida) {
        return res.status(401).json({ 
          error: 'Credenciales inválidas', 
          mensaje: 'Correo o contraseña incorrectos' 
        });
      }
    }

    // Obtener permisos del usuario
    const permisos = await ejecutarConsulta(
      'SELECT permiso FROM permisos_usuario WHERE usuario_id = ?',
      [usuario.id]
    );

    const listaPermisos = permisos.map(p => p.permiso);

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: usuario.id, 
        correo: usuario.correo, 
        rol: usuario.rol,
        permisos: listaPermisos
      },
      JWT_SECRETO,
      { expiresIn: JWT_EXPIRACION }
    );

    // Respuesta con datos del usuario
    res.json({
      mensaje: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        estado: usuario.estado,
        urlAvatar: usuario.url_avatar,
        permisos: listaPermisos
      }
    });

  } catch (error) {
    console.error('Error en inicio de sesión:', error);
    res.status(500).json({ 
      error: 'Error del servidor', 
      mensaje: 'Error al procesar el inicio de sesión' 
    });
  }
}

// Verificar token actual
async function verificarSesion(req, res) {
  try {
    // El middleware ya verificó el token, solo devolvemos los datos del usuario
    const usuario = await ejecutarConsulta(
      'SELECT id, nombre, correo, rol, estado, url_avatar FROM usuarios WHERE id = ?',
      [req.usuario.id]
    );

    if (usuario.length === 0) {
      return res.status(404).json({ 
        error: 'Usuario no encontrado', 
        mensaje: 'El usuario ya no existe' 
      });
    }

    const permisos = await ejecutarConsulta(
      'SELECT permiso FROM permisos_usuario WHERE usuario_id = ?',
      [req.usuario.id]
    );

    res.json({
      usuario: {
        id: usuario[0].id,
        nombre: usuario[0].nombre,
        correo: usuario[0].correo,
        rol: usuario[0].rol,
        estado: usuario[0].estado,
        urlAvatar: usuario[0].url_avatar,
        permisos: permisos.map(p => p.permiso)
      }
    });

  } catch (error) {
    console.error('Error al verificar sesión:', error);
    res.status(500).json({ 
      error: 'Error del servidor', 
      mensaje: 'Error al verificar la sesión' 
    });
  }
}

// Cerrar sesión (opcional, principalmente del lado del cliente)
function cerrarSesion(req, res) {
  res.json({ mensaje: 'Sesión cerrada exitosamente' });
}

module.exports = {
  iniciarSesion,
  verificarSesion,
  cerrarSesion
};
