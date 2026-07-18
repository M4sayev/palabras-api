const fs = require("fs");
const path = require("path");
const { pool } = require("./connect.js");
require("dotenv").config();

async function runSeeder() {
  if (process.env.NODE_ENV === "production") {
    console.error(
      "❌ DANGER: Seed scripts are blocked in production to protect live data!",
    );
    process.exit(1);
  }
  try {
    console.log("🌱 Reading seed.sql file...");
    const seedPath = path.join(__dirname, "seed.sql");
    const seedSQL = fs.readFileSync(seedPath, "utf-8");

    console.log("Inserting dummy development data...");
    await pool.query(seedSQL);
    console.log("Database successfully seeded! 🌱");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await pool.end();
  }
}

runSeeder();
