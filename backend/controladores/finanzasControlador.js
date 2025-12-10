const { ejecutarConsulta } = require('../config/baseDatos');

// Obtener todos los registros financieros
async function obtenerTodos(req, res) {
  try {
    const registros = await ejecutarConsulta(
      `SELECT 
        id, fecha as date, monto as amount, tipo as type, descripcion as description
       FROM registros_financieros 
       ORDER BY fecha DESC`
    );

    res.json(registros);
  } catch (error) {
    console.error('Error al obtener registros financieros:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  }
}

// Obtener registros por rango de fechas
async function obtenerPorRango(req, res) {
  try {
    const { inicio, fin } = req.query;

    let sql = `SELECT 
      id, fecha as date, monto as amount, tipo as type, descripcion as description
     FROM registros_financieros`;
    
    const params = [];

    if (inicio && fin) {
      sql += ' WHERE fecha BETWEEN ? AND ?';
      params.push(inicio, fin);
    } else if (inicio) {
      sql += ' WHERE fecha >= ?';
      params.push(inicio);
    } else if (fin) {
      sql += ' WHERE fecha <= ?';
      params.push(fin);
    }

    sql += ' ORDER BY fecha DESC';

    const registros = await ejecutarConsulta(sql, params);
    res.json(registros);

  } catch (error) {
    console.error('Error al obtener registros por rango:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  }
}

// Obtener resumen financiero
async function obtenerResumen(req, res) {
  try {
    const { periodo } = req.query; // 'hoy', 'semana', 'mes', 'año'

    let condicionFecha = '';
    switch (periodo) {
      case 'hoy':
        condicionFecha = 'DATE(fecha) = CURDATE()';
        break;
      case 'semana':
        condicionFecha = 'YEARWEEK(fecha, 1) = YEARWEEK(CURDATE(), 1)';
        break;
      case 'mes':
        condicionFecha = 'YEAR(fecha) = YEAR(CURDATE()) AND MONTH(fecha) = MONTH(CURDATE())';
        break;
      case 'año':
        condicionFecha = 'YEAR(fecha) = YEAR(CURDATE())';
        break;
      default:
        condicionFecha = '1=1'; // Sin filtro
    }

    // Ingresos
    const ingresos = await ejecutarConsulta(
      `SELECT COALESCE(SUM(monto), 0) as total FROM registros_financieros 
       WHERE tipo = 'ingreso' AND ${condicionFecha}`
    );

    // Gastos
    const gastos = await ejecutarConsulta(
      `SELECT COALESCE(SUM(monto), 0) as total FROM registros_financieros 
       WHERE tipo = 'gasto' AND ${condicionFecha}`
    );

    const totalIngresos = parseFloat(ingresos[0].total);
    const totalGastos = parseFloat(gastos[0].total);
    const gananciaBruta = totalIngresos - totalGastos;
    const margenGanancia = totalIngresos > 0 ? (gananciaBruta / totalIngresos) * 100 : 0;

    res.json({
      ingresos: totalIngresos,
      gastos: totalGastos,
      gananciaBruta,
      margenGanancia
    });

  } catch (error) {
    console.error('Error al obtener resumen:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  }
}

// Obtener datos para gráficos
async function obtenerDatosGrafico(req, res) {
  try {
    const { tipo } = req.query; // 'diario', 'mensual'

    let sql;
    if (tipo === 'mensual') {
      sql = `
        SELECT 
          DATE_FORMAT(fecha, '%Y-%m') as periodo,
          SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) as ingresos,
          SUM(CASE WHEN tipo = 'gasto' THEN monto ELSE 0 END) as gastos
        FROM registros_financieros
        WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(fecha, '%Y-%m')
        ORDER BY periodo ASC
      `;
    } else {
      sql = `
        SELECT 
          DATE(fecha) as periodo,
          SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) as ingresos,
          SUM(CASE WHEN tipo = 'gasto' THEN monto ELSE 0 END) as gastos
        FROM registros_financieros
        WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY DATE(fecha)
        ORDER BY periodo ASC
      `;
    }

    const datos = await ejecutarConsulta(sql);

    res.json(datos.map(d => ({
      date: d.periodo,
      revenue: parseFloat(d.ingresos),
      cogs: parseFloat(d.gastos)
    })));

  } catch (error) {
    console.error('Error al obtener datos para gráfico:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  }
}

// Crear registro financiero
async function crear(req, res) {
  try {
    const { monto, amount, tipo, type, descripcion, description } = req.body;

    const id = `fin-${Date.now()}`;
    const montoFinal = monto || amount;
    const tipoFinal = tipo || type;
    const descFinal = descripcion || description;

    await ejecutarConsulta(
      `INSERT INTO registros_financieros (id, monto, tipo, descripcion) VALUES (?, ?, ?, ?)`,
      [id, montoFinal, tipoFinal, descFinal]
    );

    res.status(201).json({
      mensaje: 'Registro creado exitosamente',
      registro: { id, monto: montoFinal, tipo: tipoFinal, descripcion: descFinal }
    });

  } catch (error) {
    console.error('Error al crear registro financiero:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  }
}

// Eliminar registro financiero
async function eliminar(req, res) {
  try {
    const { id } = req.params;

    const resultado = await ejecutarConsulta('DELETE FROM registros_financieros WHERE id = ?', [id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'No encontrado', mensaje: 'Registro no encontrado' });
    }

    res.json({ mensaje: 'Registro eliminado exitosamente' });

  } catch (error) {
    console.error('Error al eliminar registro:', error);
    res.status(500).json({ error: 'Error del servidor', mensaje: error.message });
  }
}

module.exports = {
  obtenerTodos,
  obtenerPorRango,
  obtenerResumen,
  obtenerDatosGrafico,
  crear,
  eliminar
};
