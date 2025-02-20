const router = require('express').Router();
const mysql = require('mysql');



const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'equipment_db'
  });

//register equipments
router.post('/add', (req, res) => {
  const { bienNacional, tipoEquipo, numeroSerie, estado, ubicacion, asignacion } = req.body;

  const query = `
    INSERT INTO equipments (bienNacional, tipoEquipo, numeroSerie, estado, ubicacion, asignacion)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const values = [bienNacional, tipoEquipo, numeroSerie, estado, ubicacion, asignacion];

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

  const query = 'SELECT * FROM equipments WHERE bienNacional = ?';
  connection.query(query, [bienNacional], (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Error en la consulta a la base de datos' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }
    res.status(200).json(results[0]);
  });
});

router.put('/:id/status', (req, res) => {
  const { id } = req.params;
  const { estado, ubicacion, asignacion, motivo, observacion } = req.body;

  if (!estado && !ubicacion && !asignacion) {
    return res.status(400).json({ error: 'Se requiere al menos un campo para actualizar' });
  }

  // Obtener los valores actuales del equipo
  const getQuery = 'SELECT estado, ubicacion, asignacion FROM equipments WHERE id = ?';
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
      SET estado = ?, ubicacion = ?, asignacion = ?
      WHERE id = ?
    `;
    const nuevosValores = [
      estado || equipoActual.estado,
      ubicacion || equipoActual.ubicacion,
      asignacion || equipoActual.asignacion,
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
          observacion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        observacion
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