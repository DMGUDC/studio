const { ejecutarConsulta, pool } = require('../config/baseDatos');

// Obtener todos los platillos
async function obtenerTodos(req, res) {
  try {
    const platillos = await ejecutarConsulta(
      `SELECT 
        id, nombre, categoria, precio, descripcion, 
        es_publico as esPublico
       FROM platillos 
       ORDER BY categoria, nombre`
    );

    // Obtener subrecetas para cada platillo
    for (let platillo of platillos) {
      const subrecetas = await ejecutarConsulta(
        `SELECT ps.subreceta_id as id
         FROM platillo_subrecetas ps
         WHERE ps.platillo_id = ?
         ORDER BY ps.orden`,
        [platillo.id]
      );
      platillo.subRecipeIds = subrecetas.map(sr => sr.id);
      platillo.isPublic = platillo.esPublico === 1;
      // Alias en inglés para compatibilidad
      platillo.name = platillo.nombre;
      platillo.category = platillo.categoria;
      platillo.price = parseFloat(platillo.precio);
      platillo.description = platillo.descripcion;
    }

    res.json(platillos);
  } catch (error) {
    console.error('Error al obtener platillos:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  }
}

// Obtener platillos públicos (para menú de clientes)
async function obtenerPublicos(req, res) {
  try {
    const platillos = await ejecutarConsulta(
      `SELECT id, nombre, categoria, precio, descripcion
       FROM platillos 
       WHERE es_publico = TRUE
       ORDER BY categoria, nombre`
    );

    // Agregar alias en inglés
    for (let platillo of platillos) {
      platillo.name = platillo.nombre;
      platillo.category = platillo.categoria;
      platillo.price = parseFloat(platillo.precio);
      platillo.description = platillo.descripcion;
    }

    res.json(platillos);
  } catch (error) {
    console.error('Error al obtener platillos públicos:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  }
}

// Obtener platillo por ID
async function obtenerPorId(req, res) {
  try {
    const { id } = req.params;
    
    const platillos = await ejecutarConsulta(
      `SELECT id, nombre, categoria, precio, descripcion, es_publico as esPublico
       FROM platillos WHERE id = ?`,
      [id]
    );

    if (platillos.length === 0) {
      return res.status(404).json({ error: 'No encontrado', mensaje: 'Platillo no encontrado' });
    }

    const platillo = platillos[0];
    
    const subrecetas = await ejecutarConsulta(
      `SELECT subreceta_id as id FROM platillo_subrecetas WHERE platillo_id = ? ORDER BY orden`,
      [id]
    );
    platillo.subRecipeIds = subrecetas.map(sr => sr.id);
    platillo.isPublic = platillo.esPublico === 1;

    res.json(platillo);

  } catch (error) {
    console.error('Error al obtener platillo:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  }
}

// Crear nuevo platillo
async function crear(req, res) {
  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();
    
    const { nombre, categoria, precio, descripcion, subRecipeIds, isPublic } = req.body;

    // Validación: nombre requerido
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'Validación', mensaje: 'El nombre es requerido' });
    }

    // Validación: verificar nombre duplicado
    const [existente] = await conexion.execute(
      'SELECT id FROM platillos WHERE LOWER(nombre) = LOWER(?)',
      [nombre.trim()]
    );
    if (existente.length > 0) {
      await conexion.rollback();
      return res.status(400).json({ error: 'Validación', mensaje: 'Ya existe un platillo con ese nombre' });
    }

    // Validación: precio no negativo
    const precioNum = parseFloat(precio) || 0;
    if (precioNum < 0) {
      await conexion.rollback();
      return res.status(400).json({ error: 'Validación', mensaje: 'El precio no puede ser negativo' });
    }

    const id = `d${Date.now()}`;

    await conexion.execute(
      `INSERT INTO platillos (id, nombre, categoria, precio, descripcion, es_publico) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, nombre.trim(), categoria, precioNum, descripcion || null, isPublic || false]
    );

    // Insertar relaciones con subrecetas
    if (subRecipeIds && subRecipeIds.length > 0) {
      for (let i = 0; i < subRecipeIds.length; i++) {
        await conexion.execute(
          `INSERT INTO platillo_subrecetas (platillo_id, subreceta_id, orden) VALUES (?, ?, ?)`,
          [id, subRecipeIds[i], i + 1]
        );
      }
    }

    await conexion.commit();

    res.status(201).json({
      mensaje: 'Platillo creado exitosamente',
      platillo: { id, nombre, categoria, precio, descripcion, subRecipeIds, isPublic }
    });

  } catch (error) {
    await conexion.rollback();
    console.error('Error al crear platillo:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  } finally {
    conexion.release();
  }
}

// Actualizar platillo
async function actualizar(req, res) {
  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();
    
    const { id } = req.params;
    const { nombre, categoria, precio, descripcion, subRecipeIds, isPublic } = req.body;

    // Validación: nombre requerido
    if (!nombre || nombre.trim() === '') {
      await conexion.rollback();
      return res.status(400).json({ error: 'Validación', mensaje: 'El nombre es requerido' });
    }

    // Validación: verificar nombre duplicado (excluyendo el actual)
    const [existente] = await conexion.execute(
      'SELECT id FROM platillos WHERE LOWER(nombre) = LOWER(?) AND id != ?',
      [nombre.trim(), id]
    );
    if (existente.length > 0) {
      await conexion.rollback();
      return res.status(400).json({ error: 'Validación', mensaje: 'Ya existe otro platillo con ese nombre' });
    }

    // Validación: precio no negativo
    const precioNum = parseFloat(precio) || 0;
    if (precioNum < 0) {
      await conexion.rollback();
      return res.status(400).json({ error: 'Validación', mensaje: 'El precio no puede ser negativo' });
    }

    await conexion.execute(
      `UPDATE platillos SET nombre = ?, categoria = ?, precio = ?, descripcion = ?, es_publico = ? WHERE id = ?`,
      [nombre.trim(), categoria, precioNum, descripcion, isPublic, id]
    );

    // Actualizar subrecetas
    await conexion.execute('DELETE FROM platillo_subrecetas WHERE platillo_id = ?', [id]);
    
    if (subRecipeIds && subRecipeIds.length > 0) {
      for (let i = 0; i < subRecipeIds.length; i++) {
        await conexion.execute(
          `INSERT INTO platillo_subrecetas (platillo_id, subreceta_id, orden) VALUES (?, ?, ?)`,
          [id, subRecipeIds[i], i + 1]
        );
      }
    }

    await conexion.commit();
    res.json({ mensaje: 'Platillo actualizado exitosamente' });

  } catch (error) {
    await conexion.rollback();
    console.error('Error al actualizar platillo:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  } finally {
    conexion.release();
  }
}

// Cambiar visibilidad del platillo
async function cambiarVisibilidad(req, res) {
  try {
    const { id } = req.params;
    const { isPublic } = req.body;

    await ejecutarConsulta(
      'UPDATE platillos SET es_publico = ? WHERE id = ?',
      [isPublic, id]
    );

    res.json({ mensaje: 'Visibilidad actualizada' });

  } catch (error) {
    console.error('Error al cambiar visibilidad:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  }
}

// Eliminar platillo
async function eliminar(req, res) {
  try {
    const { id } = req.params;

    const resultado = await ejecutarConsulta('DELETE FROM platillos WHERE id = ?', [id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'No encontrado', mensaje: 'Platillo no encontrado' });
    }

    res.json({ mensaje: 'Platillo eliminado exitosamente' });

  } catch (error) {
    console.error('Error al eliminar platillo:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  }
}

// Verificar disponibilidad de un platillo
async function verificarDisponibilidad(req, res) {
  try {
    const { id } = req.params;

    // Obtener subrecetas del platillo
    const subrecetas = await ejecutarConsulta(
      `SELECT s.id, ings.inventario_id, ings.cantidad as cantidadRequerida,
              i.stock as stockActual
       FROM platillo_subrecetas ps
       JOIN subrecetas s ON ps.subreceta_id = s.id
       JOIN ingredientes_subreceta ings ON s.id = ings.subreceta_id
       JOIN inventario i ON ings.inventario_id = i.id
       WHERE ps.platillo_id = ?`,
      [id]
    );

    let disponible = true;
    for (const sr of subrecetas) {
      if (sr.stockActual < sr.cantidadRequerida) {
        disponible = false;
        break;
      }
    }

    res.json({ disponible });

  } catch (error) {
    console.error('Error al verificar disponibilidad:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  }
}

module.exports = {
  obtenerTodos,
  obtenerPublicos,
  obtenerPorId,
  crear,
  actualizar,
  cambiarVisibilidad,
  eliminar,
  verificarDisponibilidad
};
