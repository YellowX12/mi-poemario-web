import mysql from 'mysql2/promise';

// Cambiamos "pool" por "db" aquí para que coincida con tus importaciones:
export const db = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: parseInt(process.env.MYSQL_PORT as string),
  ssl: {
// Esto evita que Vercel aborte al no tener el certificado físico de Aiven
    rejectUnauthorized: false 
  },
  // Le da a Vercel 10 segundos extra para negociar la conexión
  connectTimeout: 10000 
});