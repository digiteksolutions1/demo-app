const mysql = require("mysql2/promise");
require("dotenv").config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  enableKeepAlive: true,
});

(async () => {
  try {
    const connection = await db.getConnection();
    console.log("✅ Connected to MySQL database!");
    connection.release();
  } catch (err) {
    console.error("❌ MySQL connection error:", err);
  }
})();

module.exports = db;
