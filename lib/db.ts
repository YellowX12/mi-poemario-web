import mysql from 'mysql2/promise';

// Cambiamos "pool" por "db" aquí para que coincida con tus importaciones:
export const db = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: parseInt(process.env.MYSQL_PORT as string),
  ssl: {
    rejectUnauthorized: true
  }
});