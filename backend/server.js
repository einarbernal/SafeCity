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



// Ruta para login
app.post('/login', async (req, res) => {
  const { correo, contraseña } = req.body;

  if (!correo || !contraseña) {
    return res.status(400).json({ 
      success: false,
      message: 'Correo y contraseña son requeridos' 
    });
  }

  try {
    // 1. Primero buscar en la tabla de ciudadanos
    const [ciudadanos] = await pool.query(
      'SELECT id_ciudadano, nombres, apellido_paterno, apellido_materno, correo FROM ciudadano WHERE correo = ? AND contraseña = ?',
      [correo, contraseña]
    );

    if (ciudadanos.length > 0) {
      const ciudadano = ciudadanos[0];
      return res.json({
        success: true,
        message: 'Login exitoso (ciudadano)',
        usuario: {
          id_ciudadano: ciudadano.id_ciudadano,
          nombres: ciudadano.nombres,
          apellido_paterno: ciudadano.apellido_paterno,
          apellido_materno: ciudadano.apellido_materno,
          correo: ciudadano.correo,
          nombreCompleto: `${ciudadano.nombres} ${ciudadano.apellido_paterno} ${ciudadano.apellido_materno}`

        }
      });
    }

    // 2. Si no encuentra ciudadano, buscar en policías
    const [policias] = await pool.query(
      'SELECT id_policia, nombres, apellido_paterno, apellido_materno, correo FROM policia WHERE correo = ? AND contraseña = ?',
      [correo, contraseña]
    );

    if (policias.length > 0) {
      const policia = policias[0];
      return res.json({
        success: true,
        message: 'Login exitoso (policía)',
        usuario: {
          id_policia: policia.id_policia,
          nombres: policia.nombres,
          apellido_paterno: policia.apellido_paterno,
          apellido_materno: policia.apellido_materno,
          correo: policia.correo,
          nombreCompleto: `${policia.nombres} ${policia.apellido_paterno} ${policia.apellido_materno}`
        }
      });
    }

    // 3. Si no encuentra en ninguna tabla
    return res.status(401).json({
      success: false,
      message: 'Credenciales incorrectas'
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
});

// Ruta para crear denuncias
app.post('/denuncias', async (req, res) => {
  const { descripcion, modulo_epi, hora, fecha, tipo, calle_avenida, evidencia, id_ciudadano } = req.body;

  // Validaciones básicas
  if (!descripcion || !modulo_epi || !hora || !fecha || !tipo || !calle_avenida || !id_ciudadano) {
    return res.status(400).json({ 
      success: false,
      message: 'Todos los campos obligatorios son requeridos' 
    });
  }

  try {
    // Verificar que el ciudadano existe
    const [ciudadano] = await pool.query(
      'SELECT id_ciudadano FROM ciudadano WHERE id_ciudadano = ?',
      [id_ciudadano]
    );

    if (ciudadano.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Usuario no válido'
      });
    }

    // Insertar denuncia en la base de datos
    const [result] = await pool.query(
      `INSERT INTO denuncia 
      (descripcion, modulo_epi, hora, fecha, tipo, calle_avenida, evidencia, estado, id_ciudadano) 
      VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDIENTE', ?)`,
      [descripcion, modulo_epi, hora, fecha, tipo, calle_avenida, evidencia || null, id_ciudadano]
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


// Ruta para crear Noticias
app.post('/noticias', async (req, res) => {
  const { titulo, descripcion, hora, fecha, imagen, idPolicia } = req.body;

  // Validaciones básicas
  if (!titulo || !descripcion || !hora || !fecha || !imagen || !idPolicia) {
    return res.status(400).json({ 
      success: false,
      message: 'Todos los campos obligatorios son requeridos' 
    });
  }

  try {
    // Verificar que el policía existe
    const [policia] = await pool.query(
      'SELECT id_policia FROM policia WHERE id_policia = ?',
      [idPolicia]
    );

    if (policia.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Policía no válido'
      });
    }

    // Insertar la noticia directamente sin transacción
    const [noticiaResult] = await pool.query(
      `INSERT INTO noticia 
      (titulo, descripcion, hora, fecha, imagen, id_policia) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [titulo, descripcion, hora, fecha, imagen, idPolicia]
    );

    const noticiaId = noticiaResult.insertId;

    res.json({ 
      success: true,
      message: 'Noticia registrada exitosamente',
      noticiaId
    });

  } catch (error) {
    console.error('Error al registrar noticia:', error);
    
    res.status(500).json({ 
      success: false,
      message: 'Error al registrar la noticia en la base de datos',
      error: error.message // Opcional: incluir el mensaje de error para debugging
    });
  }
});




// Ruta para registro de ciudadanos
app.post('/registro', async (req, res) => {
  const { nombres, apellido_paterno, apellido_materno, correo, contraseña } = req.body;

  // Validaciones básicas
  if (!nombres || !apellido_paterno || !apellido_materno || !correo || !contraseña) {
    return res.status(400).json({ 
      success: false,
      message: 'Todos los campos son requeridos' 
    });
  }

  try {
    // Verificar si el correo ya existe
    const [existingUsers] = await pool.query(
      'SELECT id_ciudadano FROM ciudadano WHERE correo = ?',
      [correo]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El correo electrónico ya está registrado'
      });
    }

    // Insertar nuevo ciudadano
    const [result] = await pool.query(
      `INSERT INTO ciudadano 
      (nombres, apellido_paterno, apellido_materno, correo, contraseña) 
      VALUES (?, ?, ?, ?, ?)`,
      [nombres, apellido_paterno, apellido_materno, correo, contraseña]
    );

    res.json({ 
      success: true,
      message: 'Usuario registrado exitosamente',
      ciudadanoId: result.insertId
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al registrar el usuario en la base de datos' 
    });
  }
});
// Ruta para recuperar casos pendientes, ordenados por prioridad de tipo
app.get('/casosPendientes', async (req, res) => {
  try {
    const [casos] = await pool.query(`
      SELECT *
      FROM denuncia
      WHERE estado = 'pendiente'
      ORDER BY
        CASE tipo
          WHEN 'ASESINATO'            THEN 1
          WHEN 'asalto'               THEN 2
          WHEN 'accidente de transito' THEN 3
          ELSE 4                      -- otros tipos al final
        END,
        fecha DESC, hora DESC         -- opcional: desempata por fecha/hora
    `);

    res.json(casos);  // devuelve el array ya ordenado
  } catch (error) {
    console.error('Error al obtener casos pendientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor al obtener casos pendientes'
    });
  }
});

app.post('/atenderDenuncia', async (req, res) => {
  const { idDenuncia } = req.body;

  try {
    await pool.query(
      'UPDATE denuncia SET estado = ? WHERE id_denuncia = ?',
      ['ATENDIDO', idDenuncia]
    );

    const [rows] = await pool.query(
      'SELECT * FROM denuncia WHERE id_denuncia = ?',
      [idDenuncia]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Denuncia no encontrada' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error al actualizar denuncia:', error);
    res.status(500).json({ error: 'Error al actualizar denuncia' });
  }
});


// Ruta para obtener todas las denuncias que ya fueron atendidas
app.get('/denunciasAtendidas', async (req, res) => {
  try {
    const [denuncias] = await pool.query(`
      SELECT *
      FROM denuncia
      WHERE estado = 'ATENDIDO'
      ORDER BY fecha DESC, hora DESC
    `);

    res.json(denuncias);
  } catch (error) {
    console.error('Error al obtener denuncias atendidas:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor al obtener denuncias atendidas'
    });
  }
});






  
// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
  });
