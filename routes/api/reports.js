const router = require('express').Router();
const mysql = require('mysql');



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
  console.log(fechaInicio, fechaFin)
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
      res.status(200).json(results[0]);
    });
  });


//Tiempo promedio de reparación
  router.get('/tiempo-reparacion', (req, res) => {
    const { fechaInicio, fechaFin } = req.query;
  
    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({ error: 'Las fechas de inicio y fin son requeridas' });
    }
  
    const query = `
      SELECT AVG(TIMESTAMPDIFF(DAY, r1.created_at, r2.created_at)) AS tiempoPromedio
      FROM reports r1
      JOIN reports r2 ON r1.equipment_id = r2.equipment_id
      WHERE r1.motivo = 'reparacion'
        AND r2.motivo = 'reasignacion'
        AND r1.created_at BETWEEN ? AND ?
    `;
    connection.query(query, [fechaInicio, fechaFin], (error, results) => {
      if (error) {
        return res.status(500).json({ error: 'Error en la consulta a la base de datos' });
      }
      res.status(200).json(results[0]);
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
        COUNT(*) AS totalReubicados,
        ubicacion_nueva AS ubicacionMasComun
      FROM reports
      WHERE motivo = 'reubicacion'
        AND created_at BETWEEN ? AND ?
      GROUP BY ubicacion_nueva
      ORDER BY totalReubicados DESC
      LIMIT 1
    `;
    connection.query(query, [fechaInicio, fechaFin], (error, results) => {
      if (error) {
        return res.status(500).json({ error: 'Error en la consulta a la base de datos' });
      }
      res.status(200).json(results[0]);
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
      res.status(200).json(results);
    });
  });


  module.exports = router;