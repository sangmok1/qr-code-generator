import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: '3.36.113.228',
  user: 'sangmok',
  password: 'wwqq1551',
  database: 'neople',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool; 