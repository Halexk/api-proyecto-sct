-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS equipment_db;
USE equipment_db;

-- Crear la tabla 'equipments'
CREATE TABLE IF NOT EXISTS equipments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bienNacional VARCHAR(255) NOT NULL UNIQUE,
    tipoEquipo VARCHAR(255) NOT NULL,
    numeroSerie VARCHAR(255) NOT NULL, -- Cambiado a VARCHAR
    estado ENUM('operativo', 'reparacion', 'inoperativo') NOT NULL,
    ubicacion VARCHAR(255) NOT NULL,
    asignacion VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear la tabla 'reports'
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipment_id INT NOT NULL,
    user_id INT NOT NULL,
    estado_anterior ENUM'operativo', 'reparacion', 'inoperativo') NOT NULL,
    estado_nuevo ENUM('operativo', 'reparacion', 'inoperativo') NOT NULL,
    ubicacion_anterior VARCHAR(255) NOT NULL,
    ubicacion_nueva VARCHAR(255) NOT NULL,
    asignacion_anterior VARCHAR(255) NOT NULL,
    asignacion_nueva VARCHAR(255) NOT NULL,
    motivo ENUM('reubicacion', 'reparacion', 'reasignacion', 'entrega','esperaPieza','desincorporacion','esperaEntrega') NOT NULL,
    observacion TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


-- Crearla base de datos de los usuarios 
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    dni VARCHAR(20) NOT NULL UNIQUE,
    cargo VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);