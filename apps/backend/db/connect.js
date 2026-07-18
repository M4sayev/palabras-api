const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
});

async function testDBConnection() {
  try {
    await pool.query("SELECT 1");
    console.log("Database connected");
  } catch (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  }
}

module.exports = { pool, testDBConnection };
