const { ejecutarConsulta } = require('../config/baseDatos');

// Obtener todas las mesas
async function obtenerTodas(req, res) {
  try {
    const mesas = await ejecutarConsulta(
      `SELECT 
        m.id, m.nombre, m.piso_id as pisoId, m.estado, 
        m.forma, m.posicion_x as posicionX, m.posicion_y as posicionY,
        m.personas, m.pedido_id as pedidoId,
        p.nombre as pisoNombre
       FROM mesas m
       LEFT JOIN pisos p ON m.piso_id = p.id
       ORDER BY m.piso_id, m.nombre`
    );

    res.json(mesas);
  } catch (error) {
    console.error('Error al obtener mesas:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  }
}

// Obtener mesas por piso
async function obtenerPorPiso(req, res) {
  try {
    const { pisoId } = req.params;
    
    const mesas = await ejecutarConsulta(
      `SELECT 
        id, nombre, piso_id as pisoId, estado, 
        forma, posicion_x as posicionX, posicion_y as posicionY,
        personas, pedido_id as pedidoId
       FROM mesas WHERE piso_id = ?
       ORDER BY nombre`,
      [pisoId]
    );

    res.json(mesas);
  } catch (error) {
    console.error('Error al obtener mesas por piso:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  }
}

// Obtener pisos con sus mesas
async function obtenerPisos(req, res) {
  try {
    const pisos = await ejecutarConsulta('SELECT id, nombre FROM pisos ORDER BY nombre');
    
    const resultado = {};
    for (const piso of pisos) {
      const mesas = await ejecutarConsulta(
        `SELECT 
          id, nombre, estado, forma, 
          posicion_x as x, posicion_y as y,
          personas, pedido_id as pedidoId
         FROM mesas WHERE piso_id = ?`,
        [piso.id]
      );
      resultado[piso.id] = {
        nombre: piso.nombre,
        mesas: mesas.map(m => ({
          ...m,
          shape: m.forma === 'redonda' ? 'round' : 'square',
          status: m.estado
        }))
      };
    }

    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener pisos:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  }
}

// Crear nueva mesa
async function crear(req, res) {
  try {
    const { nombre, pisoId, forma, posicionX, posicionY } = req.body;

    const id = `mesa${Date.now()}`;

    await ejecutarConsulta(
      `INSERT INTO mesas (id, nombre, piso_id, estado, forma, posicion_x, posicion_y) 
       VALUES (?, ?, ?, 'disponible', ?, ?, ?)`,
      [id, nombre, pisoId, forma || 'cuadrada', posicionX || 0, posicionY || 0]
    );

    res.status(201).json({
      mensaje: 'Mesa creada exitosamente',
      mesa: { id, nombre, pisoId, estado: 'disponible', forma: forma || 'cuadrada', posicionX, posicionY }
    });

  } catch (error) {
    console.error('Error al crear mesa:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  }
}

// Actualizar estado de mesa
async function actualizarEstado(req, res) {
  try {
    const { id } = req.params;
    const { estado, pedidoId, personas } = req.body;

    await ejecutarConsulta(
      `UPDATE mesas SET estado = ?, pedido_id = ?, personas = ? WHERE id = ?`,
      [estado, pedidoId || null, personas || null, id]
    );

    res.json({ mensaje: 'Estado de mesa actualizado' });

  } catch (error) {
    console.error('Error al actualizar estado de mesa:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  }
}

// Actualizar estado de mesa por nombre
async function actualizarEstadoPorNombre(req, res) {
  try {
    const { nombre } = req.params;
    const { estado, pedidoId, personas } = req.body;

    await ejecutarConsulta(
      `UPDATE mesas SET estado = ?, pedido_id = ?, personas = ? WHERE nombre = ?`,
      [estado, pedidoId || null, personas || null, nombre]
    );

    res.json({ mensaje: 'Estado de mesa actualizado' });

  } catch (error) {
    console.error('Error al actualizar estado de mesa:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  }
}

// Actualizar posición de mesa
async function actualizarPosicion(req, res) {
  try {
    const { id } = req.params;
    const { posicionX, posicionY } = req.body;

    await ejecutarConsulta(
      `UPDATE mesas SET posicion_x = ?, posicion_y = ? WHERE id = ?`,
      [posicionX, posicionY, id]
    );

    res.json({ mensaje: 'Posición de mesa actualizada' });

  } catch (error) {
    console.error('Error al actualizar posición de mesa:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  }
}

// Eliminar mesa
async function eliminar(req, res) {
  try {
    const { id } = req.params;

    const resultado = await ejecutarConsulta('DELETE FROM mesas WHERE id = ?', [id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'No encontrado', mensaje: 'Mesa no encontrada' });
    }

    res.json({ mensaje: 'Mesa eliminada exitosamente' });

  } catch (error) {
    console.error('Error al eliminar mesa:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  }
}

module.exports = {
  obtenerTodas,
  obtenerPorPiso,
  obtenerPisos,
  crear,
  actualizarEstado,
  actualizarEstadoPorNombre,
  actualizarPosicion,
  eliminar
};
