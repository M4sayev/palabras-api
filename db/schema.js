const fs = require("fs");
const path = require("path");
const pool = require("./connect.js");
require("dotenv").config();

async function createDBSchemas() {
  if (process.env.NODE_ENV === "production") {
    console.error(
      "❌ DANGER: Schema scripts are blocked in production to protect live data!",
    );
    process.exit(1);
  }

  try {
    console.log("Reading schema.sql file...");
    const schemaPath = path.join(__dirname, "schema.sql");
    const schemaSQL = fs.readFileSync(schemaPath, "utf-8");

    console.log("Executing SQL script to create tables...");
    await pool.query(schemaSQL);
    console.log("Database tables created successfully! 🎉");
  } catch (error) {
    console.error("Error creating database tables:", error);
  } finally {
    await pool.end();
  }
}

createDBSchemas();
