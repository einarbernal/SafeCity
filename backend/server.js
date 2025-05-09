require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'safecity',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Pool de conexiones
const pool = mysql.createPool(dbConfig);

// Verificar conexión a la base de datos al iniciar
pool.getConnection()
  .then(conn => {
    console.log('Conexión exitosa a MySQL');
    conn.release();
  })
  .catch(err => {
    console.error('Error de conexión a MySQL:', err);
    process.exit(1);
  });



// Ruta para crear denuncias
app.post('/denuncias', async (req, res) => {
    const { descripcion, modulo_epi, hora, fecha, tipo, calle_avenida, evidencia } = req.body;
  
    // Validaciones básicas
    if (!descripcion || !modulo_epi || !hora || !fecha || !tipo || !calle_avenida) {
      return res.status(400).json({ 
        success: false,
        message: 'Todos los campos obligatorios son requeridos' 
      });
    }
  
    try {
      // Insertar denuncia en la base de datos
      const [result] = await pool.query(
        `INSERT INTO denuncia 
        (descripcion, modulo_epi, hora, fecha, tipo, calle_avenida, evidencia, estado) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDIENTE')`,
        [descripcion, modulo_epi, hora, fecha, tipo, calle_avenida, evidencia || null]
      );
  
      res.json({ 
        success: true,
        message: 'Denuncia registrada exitosamente',
        denunciaId: result.insertId
      });
    } catch (error) {
      console.error('Error al registrar denuncia:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al registrar la denuncia en la base de datos' 
      });
    }
  });

  
// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
  });
