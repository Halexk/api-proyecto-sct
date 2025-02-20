const express = require('express');
const mysql = require('mysql');
const app = express();
const cors = require('cors');

// Configura CORS para permitir solicitudes desde http://localhost:4200
app.use(cors({
    origin: 'http://localhost:4200', // Permite solo este origen
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'] // Cabeceras permitidas
  }));
  
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'equipment_db'
  });

require('dotenv').config();


// Config 
connection.connect();
app.use(express.json());

// GET
app.use('/api', require('./routes/api'));

const  PORT = process.env.PORT || 3000;
app.listen(PORT , () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
})

