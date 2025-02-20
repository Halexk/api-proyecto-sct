-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS equipment_db;
USE equipment_db;

-- Crear la tabla 'equipments'
CREATE TABLE IF NOT EXISTS equipments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bienNacional VARCHAR(255) NOT NULL UNIQUE, -- Clave única
    tipoEquipo VARCHAR(255) NOT NULL,
    numeroSerie INT NOT NULL,
    estado ENUM('en uso', 'reparacion', 'inoperativo') NOT NULL,
    ubicacion VARCHAR(255) NOT NULL,
    asignacion VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear la tabla 'reports'
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipment_id INT NOT NULL,
    estado_anterior ENUM('en uso', 'reparacion', 'inoperativo') NOT NULL,
    estado_nuevo ENUM('en uso', 'reparacion', 'inoperativo') NOT NULL,
    ubicacion_anterior VARCHAR(255) NOT NULL,
    ubicacion_nueva VARCHAR(255) NOT NULL,
    asignacion_anterior VARCHAR(255) NOT NULL,
    asignacion_nueva VARCHAR(255) NOT NULL,
    motivo ENUM('reubicación', 'reparación', 'reasignación') NOT NULL,
    observacion TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipments(id) ON DELETE CASCADE
);