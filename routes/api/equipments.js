const router = require('express').Router();
const mysql = require('mysql');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'cetasio123';

function verifyToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  // Extraer el token del encabezado "Bearer <token>"
  const tokenParts = token.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Formato de token inválido' });
  }

  const jwtToken = tokenParts[1];

  // Verificar el token
  jwt.verify(jwtToken, JWT_SECRET, (error, decoded) => {
    if (error) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    // Almacenar los datos del usuario en la solicitud para su uso posterior
    req.user = decoded;
    next();
  });
}



const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'equipment_db'
  });

//register equipments
router.post('/add', verifyToken, (req, res) => {
  const { bienNacional, tipoEquipo, numeroSerie, estado, ubicacion, asignacion, caracteristicas } = req.body;

  const query = `
    INSERT INTO equipments (bienNacional, tipoEquipo, numeroSerie, estado, ubicacion, asignacion, caracteristicas)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [bienNacional, tipoEquipo, numeroSerie, estado, ubicacion, asignacion, caracteristicas];

  connection.query(query, values, (error, results) => {
    if (error) {
      // Verificar si el error es por duplicación de bienNacional
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'El Bien Nacional ya está registrado' });
      }
      // Otros errores
      return res.status(500).json({ error: 'Error al agregar el equipo', details: error.message });
    }
    res.status(201).json({ message: 'Equipo agregado exitosamente', id: results.insertId });
  });
});

router.get('/search', (req, res) => {
  const { bienNacional } = req.query;

  if (!bienNacional) {
    return res.status(400).json({ error: 'El parámetro bienNacional es requerido' });
  }

  // Consulta para obtener la información del equipo
  const queryEquipo = 'SELECT * FROM equipments WHERE bienNacional = ?';
  connection.query(queryEquipo, [bienNacional], (error, resultsEquipo) => {
    if (error) {
      return res.status(500).json({ error: 'Error en la consulta a la base de datos' });
    }
    if (resultsEquipo.length === 0) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    const equipo = resultsEquipo[0];

    // Consulta para obtener el último reporte del equipo
    const queryUltimoReporte = `
      SELECT motivo 
      FROM reports 
      WHERE equipment_id = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    connection.query(queryUltimoReporte, [equipo.id], (error, resultsReporte) => {
      if (error) {
        return res.status(500).json({ error: 'Error en la consulta a la base de datos' });
      }


      // Combinar la información del equipo con el último reporte
      const respuesta = {
        ...equipo, // Información del equipo
        ultimoMotivo: resultsReporte.length > 0 ? resultsReporte[0].motivo : null // Motivo del último reporte
      };

      res.status(200).json(respuesta);
    });
  });
});

router.put('/:id/status', verifyToken, (req, res) => {
  const { id } = req.params;
  const { estado, ubicacion, asignacion, motivo, observacion, caracteristicas } = req.body;
  const userId = req.user.id; // Obtener el ID del usuario desde el token

  if (!estado && !ubicacion && !asignacion && !caracteristicas) {
    return res.status(400).json({ error: 'Se requiere al menos un campo para actualizar' });
  }

  // Obtener los valores actuales del equipo
  const getQuery = 'SELECT estado, ubicacion, asignacion, caracteristicas FROM equipments WHERE id = ?';
  connection.query(getQuery, [id], (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Error al obtener los datos del equipo' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    const equipoActual = results[0];

    // Actualizar el equipo
    const updateQuery = `
      UPDATE equipments
      SET estado = ?, ubicacion = ?, asignacion = ?, caracteristicas = ?
      WHERE id = ?
    `;
    const nuevosValores = [
      estado || equipoActual.estado,
      ubicacion || equipoActual.ubicacion,
      asignacion || equipoActual.asignacion,
      caracteristicas || equipoActual.caracteristicas,
      id
    ];
    connection.query(updateQuery, nuevosValores, (error, results) => {
      if (error) {
        return res.status(500).json({ error: 'Error al actualizar el equipo' });
      }

      // Registrar el cambio en la tabla de reportes
      const reportQuery = `
        INSERT INTO reports (
          equipment_id,
          estado_anterior,
          estado_nuevo,
          ubicacion_anterior,
          ubicacion_nueva,
          asignacion_anterior,
          asignacion_nueva,
          motivo,
          observacion,
          user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const reportValues = [
        id,
        equipoActual.estado,
        estado || equipoActual.estado,
        equipoActual.ubicacion,
        ubicacion || equipoActual.ubicacion,
        equipoActual.asignacion,
        asignacion || equipoActual.asignacion,
        motivo,
        observacion,
        userId // ID del usuario que realizó el cambio
      ];

      connection.query(reportQuery, reportValues, (error, results) => {
        if (error) {
          return res.status(500).json({ error: 'Error al registrar el reporte' });
        }
        res.status(200).json({ message: 'Cambios guardados exitosamente' });
      });
    });
  });
});
  

  module.exports = router;