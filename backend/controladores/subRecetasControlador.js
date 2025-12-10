const { ejecutarConsulta, pool } = require('../config/baseDatos');

// Obtener todas las subrecetas
async function obtenerTodas(req, res) {
  try {
    const subrecetas = await ejecutarConsulta(
      `SELECT 
        id, nombre, descripcion, 
        tiempo_preparacion as tiempoPreparacion
       FROM subrecetas 
       ORDER BY nombre`
    );

    // Obtener ingredientes para cada subreceta
    for (let subreceta of subrecetas) {
      const ingredientes = await ejecutarConsulta(
        `SELECT 
          ings.inventario_id as inventarioId, 
          ings.cantidad, ings.merma,
          i.nombre as nombreInventario, i.unidad
         FROM ingredientes_subreceta ings
         JOIN inventario i ON ings.inventario_id = i.id
         WHERE ings.subreceta_id = ?`,
        [subreceta.id]
      );
      subreceta.ingredientes = ingredientes.map(ing => ({
        inventoryId: ing.inventarioId,
        quantity: parseFloat(ing.cantidad),
        wastage: parseFloat(ing.merma)
      }));
      // Para compatibilidad con frontend
      subreceta.prepTime = subreceta.tiempoPreparacion;
      subreceta.name = subreceta.nombre;
      subreceta.description = subreceta.descripcion;
      subreceta.ingredients = subreceta.ingredientes;
    }

    res.json(subrecetas);
  } catch (error) {
    console.error('Error al obtener subrecetas:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  }
}

// Obtener subreceta por ID
async function obtenerPorId(req, res) {
  try {
    const { id } = req.params;
    
    const subrecetas = await ejecutarConsulta(
      `SELECT id, nombre, descripcion, tiempo_preparacion as tiempoPreparacion
       FROM subrecetas WHERE id = ?`,
      [id]
    );

    if (subrecetas.length === 0) {
      return res.status(404).json({ error: 'No encontrado', mensaje: 'Subreceta no encontrada' });
    }

    const subreceta = subrecetas[0];
    
    const ingredientes = await ejecutarConsulta(
      `SELECT inventario_id as inventarioId, cantidad, merma
       FROM ingredientes_subreceta WHERE subreceta_id = ?`,
      [id]
    );
    subreceta.ingredientes = ingredientes;
    subreceta.prepTime = subreceta.tiempoPreparacion;
    subreceta.ingredients = ingredientes.map(ing => ({
      inventoryId: ing.inventarioId,
      quantity: parseFloat(ing.cantidad),
      wastage: parseFloat(ing.merma)
    }));

    res.json(subreceta);

  } catch (error) {
    console.error('Error al obtener subreceta:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  }
}

// Crear nueva subreceta
async function crear(req, res) {
  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();
    
    const { nombre, descripcion, tiempoPreparacion, prepTime, ingredientes, ingredients } = req.body;

    // Validación: nombre requerido
    if (!nombre || nombre.trim() === '') {
      await conexion.rollback();
      return res.status(400).json({ error: 'Validación', mensaje: 'El nombre es requerido' });
    }

    // Validación: verificar nombre duplicado
    const [existente] = await conexion.execute(
      'SELECT id FROM subrecetas WHERE LOWER(nombre) = LOWER(?)',
      [nombre.trim()]
    );
    if (existente.length > 0) {
      await conexion.rollback();
      return res.status(400).json({ error: 'Validación', mensaje: 'Ya existe una subreceta con ese nombre' });
    }

    // Validación: tiempo no negativo
    const tiempo = parseFloat(tiempoPreparacion || prepTime) || 0;
    if (tiempo < 0) {
      await conexion.rollback();
      return res.status(400).json({ error: 'Validación', mensaje: 'El tiempo de preparación no puede ser negativo' });
    }

    const id = `sr${Date.now()}`;
    const ings = ingredientes || ingredients || [];

    await conexion.execute(
      `INSERT INTO subrecetas (id, nombre, descripcion, tiempo_preparacion) 
       VALUES (?, ?, ?, ?)`,
      [id, nombre.trim(), descripcion || '', tiempo]
    );

    // Insertar ingredientes
    for (const ing of ings) {
      await conexion.execute(
        `INSERT INTO ingredientes_subreceta (subreceta_id, inventario_id, cantidad, merma) 
         VALUES (?, ?, ?, ?)`,
        [id, ing.inventoryId || ing.inventarioId, ing.quantity || ing.cantidad, ing.wastage || ing.merma || 0]
      );
    }

    await conexion.commit();

    res.status(201).json({
      mensaje: 'Subreceta creada exitosamente',
      subreceta: { id, nombre, descripcion, tiempoPreparacion: tiempo, ingredientes: ings }
    });

  } catch (error) {
    await conexion.rollback();
    console.error('Error al crear subreceta:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  } finally {
    conexion.release();
  }
}

// Actualizar subreceta
async function actualizar(req, res) {
  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();
    
    const { id } = req.params;
    const { nombre, descripcion, tiempoPreparacion, prepTime, ingredientes, ingredients } = req.body;

    // Validación: nombre requerido
    if (!nombre || nombre.trim() === '') {
      await conexion.rollback();
      return res.status(400).json({ error: 'Validación', mensaje: 'El nombre es requerido' });
    }

    // Validación: verificar nombre duplicado (excluyendo el actual)
    const [existente] = await conexion.execute(
      'SELECT id FROM subrecetas WHERE LOWER(nombre) = LOWER(?) AND id != ?',
      [nombre.trim(), id]
    );
    if (existente.length > 0) {
      await conexion.rollback();
      return res.status(400).json({ error: 'Validación', mensaje: 'Ya existe otra subreceta con ese nombre' });
    }

    // Validación: tiempo no negativo
    const tiempo = parseFloat(tiempoPreparacion || prepTime) || 0;
    if (tiempo < 0) {
      await conexion.rollback();
      return res.status(400).json({ error: 'Validación', mensaje: 'El tiempo de preparación no puede ser negativo' });
    }

    const ings = ingredientes || ingredients || [];

    await conexion.execute(
      `UPDATE subrecetas SET nombre = ?, descripcion = ?, tiempo_preparacion = ? WHERE id = ?`,
      [nombre.trim(), descripcion, tiempo, id]
    );

    // Actualizar ingredientes
    await conexion.execute('DELETE FROM ingredientes_subreceta WHERE subreceta_id = ?', [id]);
    
    for (const ing of ings) {
      await conexion.execute(
        `INSERT INTO ingredientes_subreceta (subreceta_id, inventario_id, cantidad, merma) 
         VALUES (?, ?, ?, ?)`,
        [id, ing.inventoryId || ing.inventarioId, ing.quantity || ing.cantidad, ing.wastage || ing.merma || 0]
      );
    }

    await conexion.commit();
    res.json({ mensaje: 'Subreceta actualizada exitosamente' });

  } catch (error) {
    await conexion.rollback();
    console.error('Error al actualizar subreceta:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  } finally {
    conexion.release();
  }
}

// Eliminar subreceta
async function eliminar(req, res) {
  try {
    const { id } = req.params;

    const resultado = await ejecutarConsulta('DELETE FROM subrecetas WHERE id = ?', [id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'No encontrado', mensaje: 'Subreceta no encontrada' });
    }

    res.json({ mensaje: 'Subreceta eliminada exitosamente' });

  } catch (error) {
    console.error('Error al eliminar subreceta:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  }
}

module.exports = {
  obtenerTodas,
  obtenerPorId,
  crear,
  actualizar,
  eliminar
};
