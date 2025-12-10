const mysql = require('mysql2/promise');

// Configuración de la conexión a MySQL
const configuracionBD = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PUERTO) || 3306,
  user: process.env.DB_USUARIO || 'root',
  password: process.env.DB_CONTRASENA || '',
  database: process.env.DB_NOMBRE || 'xchef_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Crear pool de conexiones
const pool = mysql.createPool(configuracionBD);

// Función para verificar la conexión
async function verificarConexion() {
  try {
    const conexion = await pool.getConnection();
    console.log('✅ Conexión a MySQL establecida correctamente');
    conexion.release();
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con MySQL:', error.message);
    return false;
  }
}

// Función auxiliar para ejecutar consultas
async function ejecutarConsulta(sql, parametros = []) {
  try {
    const [resultados] = await pool.execute(sql, parametros);
    return resultados;
  } catch (error) {
    console.error('Error en consulta SQL:', error.message);
    throw error;
  }
}

module.exports = {
  pool,
  verificarConexion,
  ejecutarConsulta
};
