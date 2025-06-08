import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: '43.203.225.97',
  user: 'sangmok',
  password: 'wwqq1551',
  database: 'qrgen',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool; 