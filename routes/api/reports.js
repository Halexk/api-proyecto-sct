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

  //Equipos reparados en un período de tiempo
  router.get('/reparados', (req, res) => {
    const { fechaInicio, fechaFin } = req.query;
  
    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({ error: 'Las fechas de inicio y fin son requeridas' });
    }
  
    const query = `
      SELECT COUNT(*) AS totalReparados
      FROM reports
      WHERE motivo = 'reparacion'
        AND created_at BETWEEN ? AND ?
    `;
    connection.query(query, [fechaInicio, fechaFin], (error, results) => {
      if (error) {
        return res.status(500).json({ error: 'Error en la consulta a la base de datos' });
      }
      if (results.length === 0) {
        return res.status(200).json({ mensaje: 'No se encontraron datos de equipos reparados' });
      }
      res.status(200).json(results[0]); // Devuelve { totalReparados: X }
    });
  });


//Tiempo promedio de reparación
router.get('/tiempo-reparacion', (req, res) => {
  const { fechaInicio, fechaFin } = req.query;

  if (!fechaInicio || !fechaFin) {
    return res.status(400).json({ error: 'Las fechas de inicio y fin son requeridas' });
  }

  const query = `
    SELECT AVG(TIMESTAMPDIFF(HOUR, r1.created_at, r2.created_at)) AS tiempoPromedio
    FROM reports r1
    JOIN reports r2 ON r1.equipment_id = r2.equipment_id
    WHERE r1.motivo = 'reparacion'
      AND r2.motivo = 'entrega'
      AND r1.created_at BETWEEN ? AND ?
  `;
  connection.query(query, [fechaInicio, fechaFin], (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Error en la consulta a la base de datos' });
    }
    if (results.length === 0 || !results[0].tiempoPromedio) {
      return res.status(200).json({ mensaje: 'No se encontraron datos de tiempo de reparación' });
    }
    res.status(200).json(results[0]); // Devuelve { tiempoPromedio: X }
    
  });
});


  //Equipos reubicados y ubicaciones más comunes
  router.get('/reubicados', (req, res) => {
    const { fechaInicio, fechaFin } = req.query;
  
    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({ error: 'Las fechas de inicio y fin son requeridas' });
    }
  
    const query = `
      SELECT 
        equipment_id AS equipo,
        ubicacion_anterior,
        ubicacion_nueva
      FROM reports
      WHERE motivo = 'reubicacion'
        AND created_at BETWEEN ? AND ?
    `;
    connection.query(query, [fechaInicio, fechaFin], (error, results) => {
      if (error) {
        return res.status(500).json({ error: 'Error en la consulta a la base de datos' });
      }
      if (results.length === 0) {
        return res.status(200).json({ mensaje: 'No se encontraron datos de reubicados' });
      }
    // Devuelve una lista de reubicaciones
      console.log(results)
      const reubicados = results.map(row => ({
        equipo: row.equipo,
        ubicacionAnterior: row.ubicacion_anterior,
        ubicacionNueva: row.ubicacion_nueva,
      }))
      res.status(200).json(reubicados);// Devuelve una lista de ubicaciones con totales
    });
  });


//Ubicación de la que se retiraron más equipos para reparación
router.get('/retiros-reparacion', (req, res) => {
  const { fechaInicio, fechaFin } = req.query;

  if (!fechaInicio || !fechaFin) {
    return res.status(400).json({ error: 'Las fechas de inicio y fin son requeridas' });
  }

  const query = `
    SELECT 
      ubicacion_anterior AS ubicacion,
      COUNT(*) AS totalRetiros
    FROM reports
    WHERE motivo = 'reparacion'
      AND created_at BETWEEN ? AND ?
    GROUP BY ubicacion_anterior
    ORDER BY totalRetiros DESC
  `;
  connection.query(query, [fechaInicio, fechaFin], (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Error en la consulta a la base de datos' });
    }
    if (results.length === 0) {
      return res.status(200).json({ mensaje: 'No se encontraron datos de retiros para reparación' });
    }
    res.status(200).json(results); // Devuelve una lista de ubicaciones con totales
  });
});

  module.exports = router;