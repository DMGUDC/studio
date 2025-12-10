const { ejecutarConsulta, pool } = require('../config/baseDatos');

// Obtener todos los pedidos
async function obtenerTodos(req, res) {
  try {
    const pedidos = await ejecutarConsulta(
      `SELECT 
        id, mesa, mesero, estado, total, 
        metodo_pago as metodoPago, personas,
        UNIX_TIMESTAMP(creado_en) * 1000 as creadoEn
       FROM pedidos 
       ORDER BY creado_en DESC`
    );

    // Obtener items para cada pedido
    for (let pedido of pedidos) {
      // Convertir total a número
      pedido.total = parseFloat(pedido.total) || 0;
      
      const items = await ejecutarConsulta(
        `SELECT 
          ip.id, ip.platillo_id as platilloId, ip.nombre_platillo as nombre,
          ip.cantidad, ip.precio, ip.notas
         FROM items_pedido ip
         WHERE ip.pedido_id = ?`,
        [pedido.id]
      );

      // Obtener subrecetas para cada item
      for (let item of items) {
        const subrecetas = await ejecutarConsulta(
          `SELECT 
            sip.id, sip.subreceta_id as subrecetaId, sip.estado,
            sip.cocinero_asignado as cocineroAsignado,
            s.nombre, s.descripcion, s.tiempo_preparacion as tiempoPreparacion
           FROM subrecetas_item_pedido sip
           JOIN subrecetas s ON sip.subreceta_id = s.id
           WHERE sip.item_pedido_id = ?`,
          [item.id]
        );
        
        item.subRecipes = subrecetas.map(sr => ({
          id: sr.subrecetaId,
          nombre: sr.nombre,
          descripcion: sr.descripcion,
          status: sr.estado,
          assignedCook: sr.cocineroAsignado,
          prepTime: sr.tiempoPreparacion
        }));
        
        // Obtener IDs de subrecetas del platillo
        const subrecetaIds = await ejecutarConsulta(
          `SELECT subreceta_id FROM platillo_subrecetas WHERE platillo_id = ?`,
          [item.platilloId]
        );
        item.subRecipeIds = subrecetaIds.map(s => s.subreceta_id);
      }

      pedido.items = items;
    }

    res.json(pedidos);
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  }
}

// Obtener pedido por ID
async function obtenerPorId(req, res) {
  try {
    const { id } = req.params;
    
    const pedidos = await ejecutarConsulta(
      `SELECT 
        id, mesa, mesero, estado, total, 
        metodo_pago as metodoPago, personas,
        UNIX_TIMESTAMP(creado_en) * 1000 as creadoEn
       FROM pedidos WHERE id = ?`,
      [id]
    );

    if (pedidos.length === 0) {
      return res.status(404).json({ error: 'No encontrado', mensaje: 'Pedido no encontrado' });
    }

    const pedido = pedidos[0];
    
    // Obtener items
    const items = await ejecutarConsulta(
      `SELECT 
        ip.id, ip.platillo_id as platilloId, ip.nombre_platillo as nombre,
        ip.cantidad, ip.precio, ip.notas
       FROM items_pedido ip
       WHERE ip.pedido_id = ?`,
      [id]
    );

    for (let item of items) {
      const subrecetas = await ejecutarConsulta(
        `SELECT 
          sip.subreceta_id as id, sip.estado as status,
          sip.cocinero_asignado as assignedCook,
          s.nombre as name, s.descripcion as description, 
          s.tiempo_preparacion as prepTime
         FROM subrecetas_item_pedido sip
         JOIN subrecetas s ON sip.subreceta_id = s.id
         WHERE sip.item_pedido_id = ?`,
        [item.id]
      );
      item.subRecipes = subrecetas;
    }

    pedido.items = items;
    res.json(pedido);

  } catch (error) {
    console.error('Error al obtener pedido:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  }
}

// Crear nuevo pedido
async function crear(req, res) {
  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();
    
    const { mesa, mesero, items, total, personas } = req.body;

    // Generar ID de pedido
    const [ultimoPedido] = await conexion.execute(
      `SELECT id FROM pedidos ORDER BY creado_en DESC LIMIT 1`
    );
    
    let numeroPedido = 1;
    if (ultimoPedido.length > 0) {
      const match = ultimoPedido[0].id.match(/ORD(\d+)/);
      if (match) {
        numeroPedido = parseInt(match[1]) + 1;
      }
    }
    const id = `ORD${numeroPedido.toString().padStart(3, '0')}`;

    // Insertar pedido
    await conexion.execute(
      `INSERT INTO pedidos (id, mesa, mesero, estado, total, personas) 
       VALUES (?, ?, ?, 'Pendiente', ?, ?)`,
      [id, mesa, mesero, total, personas || 1]
    );

    // Insertar items del pedido
    for (const item of items) {
      const [resultado] = await conexion.execute(
        `INSERT INTO items_pedido (pedido_id, platillo_id, nombre_platillo, cantidad, precio, notas) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, item.id, item.nombre || item.name, item.cantidad || item.quantity, item.precio || item.price, item.notas || item.notes || null]
      );

      const itemPedidoId = resultado.insertId;

      // Obtener subrecetas del platillo y crear instancias para el pedido
      const [subrecetas] = await conexion.execute(
        `SELECT subreceta_id FROM platillo_subrecetas WHERE platillo_id = ? ORDER BY orden`,
        [item.id]
      );

      for (const sr of subrecetas) {
        await conexion.execute(
          `INSERT INTO subrecetas_item_pedido (item_pedido_id, subreceta_id, estado) 
           VALUES (?, ?, 'Pendiente')`,
          [itemPedidoId, sr.subreceta_id]
        );
      }
    }

    // Actualizar estado de la mesa
    await conexion.execute(
      `UPDATE mesas SET estado = 'ocupada', pedido_id = ?, personas = ? WHERE nombre = ?`,
      [id, personas, mesa]
    );

    await conexion.commit();

    res.status(201).json({
      mensaje: 'Pedido creado exitosamente',
      pedido: { id, mesa, mesero, estado: 'Pendiente', total, personas }
    });

  } catch (error) {
    await conexion.rollback();
    console.error('Error al crear pedido:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  } finally {
    conexion.release();
  }
}

// Actualizar pedido
async function actualizar(req, res) {
  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();
    
    const { id } = req.params;
    const { mesa, mesero, items, total, personas } = req.body;

    // Obtener mesa original
    const [pedidoOriginal] = await conexion.execute(
      'SELECT mesa FROM pedidos WHERE id = ?',
      [id]
    );

    if (pedidoOriginal.length === 0) {
      return res.status(404).json({ error: 'No encontrado', mensaje: 'Pedido no encontrado' });
    }

    const mesaOriginal = pedidoOriginal[0].mesa;

    // Actualizar pedido
    await conexion.execute(
      `UPDATE pedidos SET mesa = ?, mesero = ?, total = ?, personas = ?, estado = 'Pendiente' WHERE id = ?`,
      [mesa, mesero, total, personas, id]
    );

    // Eliminar items anteriores
    await conexion.execute('DELETE FROM items_pedido WHERE pedido_id = ?', [id]);

    // Insertar nuevos items
    for (const item of items) {
      const [resultado] = await conexion.execute(
        `INSERT INTO items_pedido (pedido_id, platillo_id, nombre_platillo, cantidad, precio, notas) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, item.id, item.nombre || item.name, item.cantidad || item.quantity, item.precio || item.price, item.notas || item.notes || null]
      );

      const itemPedidoId = resultado.insertId;

      const [subrecetas] = await conexion.execute(
        `SELECT subreceta_id FROM platillo_subrecetas WHERE platillo_id = ? ORDER BY orden`,
        [item.id]
      );

      for (const sr of subrecetas) {
        await conexion.execute(
          `INSERT INTO subrecetas_item_pedido (item_pedido_id, subreceta_id, estado) 
           VALUES (?, ?, 'Pendiente')`,
          [itemPedidoId, sr.subreceta_id]
        );
      }
    }

    // Actualizar mesas
    if (mesaOriginal !== mesa) {
      await conexion.execute(
        `UPDATE mesas SET estado = 'disponible', pedido_id = NULL, personas = NULL WHERE nombre = ?`,
        [mesaOriginal]
      );
    }
    await conexion.execute(
      `UPDATE mesas SET estado = 'ocupada', pedido_id = ?, personas = ? WHERE nombre = ?`,
      [id, personas, mesa]
    );

    await conexion.commit();
    res.json({ mensaje: 'Pedido actualizado exitosamente' });

  } catch (error) {
    await conexion.rollback();
    console.error('Error al actualizar pedido:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  } finally {
    conexion.release();
  }
}

// Actualizar estado del pedido
async function actualizarEstado(req, res) {
  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();
    
    const { id } = req.params;
    const { estado, metodoPago, montoFinal } = req.body;

    // Obtener datos del pedido
    const [pedido] = await conexion.execute(
      'SELECT mesa, total FROM pedidos WHERE id = ?',
      [id]
    );

    if (pedido.length === 0) {
      return res.status(404).json({ error: 'No encontrado', mensaje: 'Pedido no encontrado' });
    }

    // Actualizar estado
    if (metodoPago) {
      await conexion.execute(
        `UPDATE pedidos SET estado = ?, metodo_pago = ?, total = ? WHERE id = ?`,
        [estado, metodoPago, montoFinal || pedido[0].total, id]
      );
    } else {
      await conexion.execute(
        `UPDATE pedidos SET estado = ? WHERE id = ?`,
        [estado, id]
      );
    }

    // Si el pedido está entregado o cancelado, liberar la mesa
    if (estado === 'Entregado' || estado === 'Cancelado') {
      await conexion.execute(
        `UPDATE mesas SET estado = 'disponible', pedido_id = NULL, personas = NULL WHERE nombre = ?`,
        [pedido[0].mesa]
      );

      // Registrar ingreso si hay monto final
      if (montoFinal && montoFinal > 0) {
        const finanzasId = `fin-rev-${Date.now()}`;
        await conexion.execute(
          `INSERT INTO registros_financieros (id, monto, tipo, descripcion) VALUES (?, ?, 'ingreso', ?)`,
          [finanzasId, montoFinal, `Pedido ${id} (${estado})`]
        );
      }
    }

    await conexion.commit();
    res.json({ mensaje: 'Estado del pedido actualizado' });

  } catch (error) {
    await conexion.rollback();
    console.error('Error al actualizar estado del pedido:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  } finally {
    conexion.release();
  }
}

// Liquidar pedido (cobrar y cerrar)
async function liquidar(req, res) {
  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();
    
    const { id } = req.params;
    const { metodoPago, montoFinal } = req.body;

    const [pedido] = await conexion.execute(
      'SELECT mesa FROM pedidos WHERE id = ?',
      [id]
    );

    if (pedido.length === 0) {
      return res.status(404).json({ error: 'No encontrado', mensaje: 'Pedido no encontrado' });
    }

    // Actualizar pedido
    await conexion.execute(
      `UPDATE pedidos SET estado = 'Entregado', metodo_pago = ?, total = ? WHERE id = ?`,
      [metodoPago, montoFinal, id]
    );

    // Liberar mesa
    await conexion.execute(
      `UPDATE mesas SET estado = 'disponible', pedido_id = NULL, personas = NULL WHERE nombre = ?`,
      [pedido[0].mesa]
    );

    // Registrar ingreso
    const finanzasId = `fin-rev-${Date.now()}`;
    await conexion.execute(
      `INSERT INTO registros_financieros (id, monto, tipo, descripcion) VALUES (?, ?, 'ingreso', ?)`,
      [finanzasId, montoFinal, `Pedido ${id}`]
    );

    await conexion.commit();
    res.json({ mensaje: 'Pedido liquidado exitosamente' });

  } catch (error) {
    await conexion.rollback();
    console.error('Error al liquidar pedido:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  } finally {
    conexion.release();
  }
}

// Actualizar estado de subreceta de un item del pedido
async function actualizarSubreceta(req, res) {
  try {
    const { pedidoId, itemId, subrecetaId } = req.params;
    const { estado, cocineroAsignado } = req.body;

    // Buscar el item_pedido - puede ser por ID numérico o por platillo_id
    let items = await ejecutarConsulta(
      `SELECT id FROM items_pedido WHERE pedido_id = ? AND id = ?`,
      [pedidoId, itemId]
    );

    // Si no se encuentra, intentar buscar por platillo_id
    if (items.length === 0) {
      items = await ejecutarConsulta(
        `SELECT id FROM items_pedido WHERE pedido_id = ? AND platillo_id = ?`,
        [pedidoId, itemId]
      );
    }

    if (items.length === 0) {
      return res.status(404).json({ error: 'No encontrado', mensaje: 'Item no encontrado' });
    }

    if (cocineroAsignado !== undefined) {
      await ejecutarConsulta(
        `UPDATE subrecetas_item_pedido 
         SET estado = ?, cocinero_asignado = ? 
         WHERE item_pedido_id = ? AND subreceta_id = ?`,
        [estado, cocineroAsignado, items[0].id, subrecetaId]
      );
    } else {
      await ejecutarConsulta(
        `UPDATE subrecetas_item_pedido SET estado = ? WHERE item_pedido_id = ? AND subreceta_id = ?`,
        [estado, items[0].id, subrecetaId]
      );
    }

    res.json({ mensaje: 'Subreceta actualizada' });

  } catch (error) {
    console.error('Error al actualizar subreceta:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  }
}

module.exports = {
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  actualizarEstado,
  liquidar,
  actualizarSubreceta
};
