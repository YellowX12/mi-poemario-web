-- Base de datos para Mi Poemario
-- Ejecutar este script en MySQL para crear todas las tablas necesarias

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS mi_poemario;
USE mi_poemario;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de poemas
CREATE TABLE IF NOT EXISTS poemas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  contenido TEXT NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id INT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla de likes/dislikes en poemas
CREATE TABLE IF NOT EXISTS poem_likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  poema_id INT NOT NULL,
  user_id INT NOT NULL,
  tipo ENUM('like', 'dislike') NOT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (poema_id) REFERENCES poemas(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_like (poema_id, user_id)
);

-- Tabla de favoritos
CREATE TABLE IF NOT EXISTS favoritos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  poema_id INT NOT NULL,
  user_id INT NOT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (poema_id) REFERENCES poemas(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_fav (poema_id, user_id)
);

-- Tabla de comentarios
CREATE TABLE IF NOT EXISTS comentarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  poema_id INT NOT NULL,
  user_id INT NOT NULL,
  contenido TEXT NOT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (poema_id) REFERENCES poemas(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Usuario administrador por defecto (contraseña: admin)
INSERT IGNORE INTO users (nombre, email, password) VALUES
('Admin', 'admi@admid.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Algunos poemas de ejemplo
INSERT IGNORE INTO poemas (titulo, contenido, user_id) VALUES
('Primer Verso', 'En la quietud de la noche\nlas palabras buscan su lugar\ncomo estrellas en el firmamento\nesperando ser descubiertas\npor ojos curiosos y almas sensibles.', 1),
('Susurros del Viento', 'El viento susurra secretos antiguos\nentre las hojas de los árboles centenarios\nllevando consigo memorias olvidadas\ny promesas que nunca se cumplieron\nen el silencio de la madrugada.', 1),
('Reflejo en el Agua', 'En el estanque cristalino\nse refleja el cielo azul\ny las nubes pasan veloces\ncomo pensamientos efímeros\nen la mente de un poeta distraído.', 1);

-- Índices para mejor rendimiento
CREATE INDEX idx_poemas_user_id ON poemas(user_id);
CREATE INDEX idx_poemas_fecha ON poemas(fecha_creacion DESC);
CREATE INDEX idx_poem_likes_poema ON poem_likes(poema_id);
CREATE INDEX idx_poem_likes_user ON poem_likes(user_id);
CREATE INDEX idx_favoritos_poema ON favoritos(poema_id);
CREATE INDEX idx_favoritos_user ON favoritos(user_id);
CREATE INDEX idx_comentarios_poema ON comentarios(poema_id);
CREATE INDEX idx_comentarios_fecha ON comentarios(fecha DESC);