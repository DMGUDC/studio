const bcrypt = require('bcryptjs');
const { ejecutarConsulta, pool } = require('../config/baseDatos');

// Obtener todos los usuarios
async function obtenerTodos(req, res) {
  try {
    const usuarios = await ejecutarConsulta(
      `SELECT id, nombre, correo, rol, estado, url_avatar as urlAvatar, creado_en as creadoEn 
       FROM usuarios ORDER BY nombre`
    );

    // Obtener permisos para cada usuario
    for (let usuario of usuarios) {
      const permisos = await ejecutarConsulta(
        'SELECT permiso FROM permisos_usuario WHERE usuario_id = ?',
        [usuario.id]
      );
      usuario.permisos = permisos.map(p => p.permiso);
    }

    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  }
}

// Obtener usuario por ID
async function obtenerPorId(req, res) {
  try {
    const { id } = req.params;
    
    const usuarios = await ejecutarConsulta(
      `SELECT id, nombre, correo, rol, estado, url_avatar as urlAvatar 
       FROM usuarios WHERE id = ?`,
      [id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ error: 'No encontrado', mensaje: 'Usuario no encontrado' });
    }

    const permisos = await ejecutarConsulta(
      'SELECT permiso FROM permisos_usuario WHERE usuario_id = ?',
      [id]
    );

    const usuario = usuarios[0];
    usuario.permisos = permisos.map(p => p.permiso);

    res.json(usuario);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  }
}

// Crear nuevo usuario
async function crear(req, res) {
  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();
    
    const { nombre, correo, contrasena, rol, estado, permisos, urlAvatar } = req.body;

    // Validar datos requeridos
    if (!nombre || !correo) {
      return res.status(400).json({ 
        error: 'Datos incompletos', 
        mensaje: 'Nombre y correo son requeridos' 
      });
    }

    // Verificar si el correo ya existe
    const [existente] = await conexion.execute(
      'SELECT id FROM usuarios WHERE correo = ?',
      [correo]
    );

    if (existente.length > 0) {
      return res.status(400).json({ 
        error: 'Correo duplicado', 
        mensaje: 'Ya existe un usuario con este correo' 
      });
    }

    // Generar ID y hashear contraseña
    const id = `usr${Date.now()}`;
    const contrasenaHash = await bcrypt.hash(contrasena || 'xchef123', 10);

    // Insertar usuario
    await conexion.execute(
      `INSERT INTO usuarios (id, nombre, correo, contrasena, rol, estado, url_avatar) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, nombre, correo, contrasenaHash, rol || 'Mesero', estado || 'Activo', urlAvatar || null]
    );

    // Insertar permisos
    if (permisos && permisos.length > 0) {
      for (const permiso of permisos) {
        await conexion.execute(
          'INSERT INTO permisos_usuario (usuario_id, permiso) VALUES (?, ?)',
          [id, permiso]
        );
      }
    }

    await conexion.commit();

    res.status(201).json({
      mensaje: 'Usuario creado exitosamente',
      usuario: { id, nombre, correo, rol: rol || 'Mesero', estado: estado || 'Activo', permisos: permisos || [] }
    });

  } catch (error) {
    await conexion.rollback();
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  } finally {
    conexion.release();
  }
}

// Actualizar usuario
async function actualizar(req, res) {
  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();
    
    const { id } = req.params;
    const { nombre, correo, rol, estado, permisos, urlAvatar } = req.body;

    // Verificar si existe
    const [existente] = await conexion.execute('SELECT id FROM usuarios WHERE id = ?', [id]);
    if (existente.length === 0) {
      return res.status(404).json({ error: 'No encontrado', mensaje: 'Usuario no encontrado' });
    }

    // Actualizar usuario
    await conexion.execute(
      `UPDATE usuarios SET nombre = ?, correo = ?, rol = ?, estado = ?, url_avatar = ? WHERE id = ?`,
      [nombre, correo, rol, estado, urlAvatar, id]
    );

    // Actualizar permisos (eliminar antiguos e insertar nuevos)
    if (permisos) {
      await conexion.execute('DELETE FROM permisos_usuario WHERE usuario_id = ?', [id]);
      for (const permiso of permisos) {
        await conexion.execute(
          'INSERT INTO permisos_usuario (usuario_id, permiso) VALUES (?, ?)',
          [id, permiso]
        );
      }
    }

    await conexion.commit();

    res.json({ mensaje: 'Usuario actualizado exitosamente' });

  } catch (error) {
    await conexion.rollback();
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  } finally {
    conexion.release();
  }
}

// Eliminar usuario
async function eliminar(req, res) {
  try {
    const { id } = req.params;

    const resultado = await ejecutarConsulta('DELETE FROM usuarios WHERE id = ?', [id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'No encontrado', mensaje: 'Usuario no encontrado' });
    }

    res.json({ mensaje: 'Usuario eliminado exitosamente' });

  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  }
}

// Actualizar avatar del usuario
async function actualizarAvatar(req, res) {
  try {
    const { id } = req.params;
    const { urlAvatar } = req.body;

    await ejecutarConsulta(
      'UPDATE usuarios SET url_avatar = ? WHERE id = ?',
      [urlAvatar, id]
    );

    res.json({ mensaje: 'Avatar actualizado exitosamente' });

  } catch (error) {
    console.error('Error al actualizar avatar:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  }
}

// Cambiar contraseña
async function cambiarContrasena(req, res) {
  try {
    const { id } = req.params;
    const { contrasenaActual, contrasenaNueva } = req.body;

    // Verificar que el usuario existe y obtener su contraseña actual
    const usuarios = await ejecutarConsulta(
      'SELECT contrasena FROM usuarios WHERE id = ?',
      [id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const usuario = usuarios[0];

    // Verificar la contraseña actual
    const bcrypt = require('bcryptjs');
    const contrasenaValida = await bcrypt.compare(contrasenaActual, usuario.contrasena);
    
    if (!contrasenaValida) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }

    // Encriptar y guardar la nueva contraseña
    const contrasenaNuevaHash = await bcrypt.hash(contrasenaNueva, 10);
    await ejecutarConsulta(
      'UPDATE usuarios SET contrasena = ? WHERE id = ?',
      [contrasenaNuevaHash, id]
    );

    res.json({ mensaje: 'Contraseña actualizada exitosamente' });

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  }
}

module.exports = {
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
  actualizarAvatar,
  cambiarContrasena
};
