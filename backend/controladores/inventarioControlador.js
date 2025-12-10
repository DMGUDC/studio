const { ejecutarConsulta, pool } = require('../config/baseDatos');

// Obtener todo el inventario
async function obtenerTodos(req, res) {
  try {
    const inventario = await ejecutarConsulta(
      `SELECT 
        id, nombre, categoria, stock, unidad, 
        umbral, precio
       FROM inventario 
       ORDER BY categoria, nombre`
    );

    // Agregar alias en inglés y convertir números
    const inventarioConvertido = inventario.map(item => ({
      ...item,
      name: item.nombre,
      category: item.categoria,
      unit: item.unidad,
      threshold: parseFloat(item.umbral) || 0,
      price: parseFloat(item.precio) || 0,
      stock: parseFloat(item.stock) || 0,
    }));

    res.json(inventarioConvertido);
  } catch (error) {
    console.error('Error al obtener inventario:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  }
}

// Obtener item por ID
async function obtenerPorId(req, res) {
  try {
    const { id } = req.params;
    
    const items = await ejecutarConsulta(
      `SELECT id, nombre, categoria, stock, unidad, umbral, precio
       FROM inventario WHERE id = ?`,
      [id]
    );

    if (items.length === 0) {
      return res.status(404).json({ error: 'No encontrado', mensaje: 'Producto no encontrado' });
    }

    const item = items[0];
    res.json({
      ...item,
      name: item.nombre,
      category: item.categoria,
      unit: item.unidad,
      threshold: parseFloat(item.umbral) || 0,
      price: parseFloat(item.precio) || 0,
      stock: parseFloat(item.stock) || 0,
    });

  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  }
}

// Obtener items con bajo stock
async function obtenerBajoStock(req, res) {
  try {
    const items = await ejecutarConsulta(
      `SELECT id, nombre, categoria, stock, unidad, umbral, precio
       FROM inventario 
       WHERE stock <= umbral
       ORDER BY stock ASC`
    );

    const itemsConvertidos = items.map(item => ({
      ...item,
      name: item.nombre,
      category: item.categoria,
      unit: item.unidad,
      threshold: parseFloat(item.umbral) || 0,
      price: parseFloat(item.precio) || 0,
      stock: parseFloat(item.stock) || 0,
    }));

    res.json(itemsConvertidos);
  } catch (error) {
    console.error('Error al obtener items con bajo stock:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  }
}

// Crear nuevo producto de inventario
async function crear(req, res) {
  try {
    const { nombre, categoria, stock, unidad, umbral, threshold, precio, price } = req.body;

    // Validación: nombre requerido
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'Validación', mensaje: 'El nombre es requerido' });
    }

    // Validación: verificar nombre duplicado
    const existente = await ejecutarConsulta(
      'SELECT id FROM inventario WHERE LOWER(nombre) = LOWER(?)',
      [nombre.trim()]
    );
    if (existente.length > 0) {
      return res.status(400).json({ error: 'Validación', mensaje: 'Ya existe un producto con ese nombre' });
    }

    const stockFinal = parseFloat(stock) || 0;
    const umbralFinal = parseFloat(umbral || threshold) || 0;
    const precioFinal = parseFloat(precio || price) || 0;

    // Validación: no valores negativos
    if (stockFinal < 0) {
      return res.status(400).json({ error: 'Validación', mensaje: 'El stock no puede ser negativo' });
    }
    if (umbralFinal < 0) {
      return res.status(400).json({ error: 'Validación', mensaje: 'El umbral no puede ser negativo' });
    }
    if (precioFinal < 0) {
      return res.status(400).json({ error: 'Validación', mensaje: 'El precio no puede ser negativo' });
    }

    const id = `inv${Date.now()}`;

    await ejecutarConsulta(
      `INSERT INTO inventario (id, nombre, categoria, stock, unidad, umbral, precio) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, nombre.trim(), categoria, stockFinal, unidad, umbralFinal, precioFinal]
    );

    res.status(201).json({
      mensaje: 'Producto creado exitosamente',
      producto: { id, nombre: nombre.trim(), categoria, stock: stockFinal, unidad, threshold: umbralFinal, price: precioFinal }
    });

  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  }
}

// Actualizar producto de inventario
async function actualizar(req, res) {
  try {
    const { id } = req.params;
    const { nombre, categoria, stock, unidad, umbral, threshold, precio, price } = req.body;

    // Validación: nombre requerido
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'Validación', mensaje: 'El nombre es requerido' });
    }

    // Validación: verificar nombre duplicado (excluyendo el actual)
    const existente = await ejecutarConsulta(
      'SELECT id FROM inventario WHERE LOWER(nombre) = LOWER(?) AND id != ?',
      [nombre.trim(), id]
    );
    if (existente.length > 0) {
      return res.status(400).json({ error: 'Validación', mensaje: 'Ya existe otro producto con ese nombre' });
    }

    const stockFinal = parseFloat(stock) || 0;
    const umbralFinal = parseFloat(umbral || threshold) || 0;
    const precioFinal = parseFloat(precio || price) || 0;

    // Validación: no valores negativos
    if (stockFinal < 0) {
      return res.status(400).json({ error: 'Validación', mensaje: 'El stock no puede ser negativo' });
    }
    if (umbralFinal < 0) {
      return res.status(400).json({ error: 'Validación', mensaje: 'El umbral no puede ser negativo' });
    }
    if (precioFinal < 0) {
      return res.status(400).json({ error: 'Validación', mensaje: 'El precio no puede ser negativo' });
    }

    await ejecutarConsulta(
      `UPDATE inventario SET nombre = ?, categoria = ?, stock = ?, unidad = ?, umbral = ?, precio = ? WHERE id = ?`,
      [nombre.trim(), categoria, stockFinal, unidad, umbralFinal, precioFinal, id]
    );

    res.json({ mensaje: 'Producto actualizado exitosamente' });

  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  }
}

// Reabastecer inventario
async function reabastecer(req, res) {
  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();
    
    const { id } = req.params;
    const { cantidad } = req.body;

    // Validación: cantidad debe ser positiva
    const cantidadNum = parseFloat(cantidad) || 0;
    if (cantidadNum <= 0) {
      return res.status(400).json({ error: 'Validación', mensaje: 'La cantidad debe ser mayor a cero' });
    }

    // Obtener información del producto
    const [productos] = await conexion.execute(
      'SELECT nombre, precio FROM inventario WHERE id = ?',
      [id]
    );

    if (productos.length === 0) {
      return res.status(404).json({ error: 'No encontrado', mensaje: 'Producto no encontrado' });
    }

    const producto = productos[0];

    // Actualizar stock
    await conexion.execute(
      'UPDATE inventario SET stock = stock + ? WHERE id = ?',
      [cantidadNum, id]
    );

    // Registrar gasto
    const costo = cantidad * parseFloat(producto.precio);
    const finanzasId = `fin-exp-${Date.now()}`;
    await conexion.execute(
      `INSERT INTO registros_financieros (id, monto, tipo, descripcion) VALUES (?, ?, 'gasto', ?)`,
      [finanzasId, costo, `Reabastecimiento: ${cantidad} x ${producto.nombre}`]
    );

    await conexion.commit();
    res.json({ 
      mensaje: 'Producto reabastecido exitosamente',
      costo: costo
    });

  } catch (error) {
    await conexion.rollback();
    console.error('Error al reabastecer producto:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  } finally {
    conexion.release();
  }
}

// Descontar stock (usado cuando se prepara un pedido)
async function descontarStock(req, res) {
  try {
    const { id } = req.params;
    const { cantidad } = req.body;

    await ejecutarConsulta(
      'UPDATE inventario SET stock = stock - ? WHERE id = ? AND stock >= ?',
      [cantidad, id, cantidad]
    );

    res.json({ mensaje: 'Stock descontado exitosamente' });

  } catch (error) {
    console.error('Error al descontar stock:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  }
}

// Eliminar producto de inventario
async function eliminar(req, res) {
  try {
    const { id } = req.params;

    const resultado = await ejecutarConsulta('DELETE FROM inventario WHERE id = ?', [id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'No encontrado', mensaje: 'Producto no encontrado' });
    }

    res.json({ mensaje: 'Producto eliminado exitosamente' });

  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  }
}

module.exports = {
  obtenerTodos,
  obtenerPorId,
  obtenerBajoStock,
  crear,
  actualizar,
  reabastecer,
  descontarStock,
  eliminar
};
