require('dotenv').config(); // Carga las variables de entorno al inicio

const mysql = require('mysql');
const bodyParser = require('body-parser');
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Clave secreta para firmar los tokens (debe ser segura y almacenada en variables de entorno)
const JWT_SECRET = process.env.JWT_SECRET;

// Función para generar un token JWT
function generateToken(user) {
  const payload = {
    id: user.id,
    dni: user.dni,
  };

  // Generar el token con una expiración de 1 hora (3600 segundos)
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

  return token;
}


// Configuración de la conexión a la base de datos usando variables de entorno
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect((error) => {
  if (error) {
    console.error('Error al conectar a la base de datos:', error);
  } else {
    console.log('Conexión a la base de datos establecida');
  }
});

// Middleware para parsear JSON
router.use(bodyParser.json());


router.post('/register', (req, res) => {
  const { nombre, apellido, dni, cargo, password } = req.body;

  if (!nombre || !apellido || !dni || !cargo || !password) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  // Cifrar la contraseña
  const saltRounds = 10;
  bcrypt.hash(password, saltRounds, (error, hashedPassword) => {
    if (error) {
      return res.status(500).json({ error: 'Error al cifrar la contraseña' });
    }

    const query = `
      INSERT INTO users (nombre, apellido, dni, cargo, password)
      VALUES (?, ?, ?, ?, ?)
    `;
    const values = [nombre, apellido, dni, cargo, hashedPassword];

    connection.query(query, values, (error, results) => {
      if (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'El DNI ya está registrado' });
        }
        return res.status(500).json({ error: 'Error al registrar el usuario' });
      }
      res.status(201).json({ message: 'Usuario registrado exitosamente' });
    });
  });
});


router.post('/login', (req, res) => {
  const { dni, password } = req.body;

  if (!dni || !password) {
    return res.status(400).json({ error: 'DNI y contraseña son requeridos' });
  }

  const query = 'SELECT * FROM users WHERE dni = ?';
  connection.query(query, [dni], (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Error en la consulta a la base de datos' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = results[0];

    // Verificar la contraseña
    bcrypt.compare(password, user.password, (error, isMatch) => {
      if (error) {
        return res.status(500).json({ error: 'Error al verificar la contraseña' });
      }
      if (!isMatch) {
        return res.status(401).json({ error: 'Contraseña incorrecta' });
      }

      // Generar un token JWT
      const token = generateToken(user);

      // Devolver el token y los datos del usuario (sin la contraseña)
      const userData = { id: user.id, nombre: user.nombre, apellido: user.apellido, dni: user.dni, cargo: user.cargo };
      res.status(200).json({ token, user: userData });
    });
  });
});




module.exports = router;
