CREATE DATABASE IF NOT EXISTS encubadora_db;
USE encubadora_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'CLIENTE') NOT NULL DEFAULT 'CLIENTE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS readings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    temperatura DECIMAL(5,2) NOT NULL,
    humedad DECIMAL(5,2) NOT NULL,
    timestamp DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (timestamp)
);

-- Insertar un admin por defecto (password es 'admin123' encriptada con bcrypt)
-- $2b$10$y58o5hX37P8fU5C/hS7nhe94G/6m1s1jG2jN.EwUuE4Z.tD6rJ4M6 -> admin123
INSERT IGNORE INTO users (id, nombre, email, password, role) VALUES 
(1, 'Administrador', 'admin@admin.com', '$2b$10$y58o5hX37P8fU5C/hS7nhe94G/6m1s1jG2jN.EwUuE4Z.tD6rJ4M6', 'ADMIN');
