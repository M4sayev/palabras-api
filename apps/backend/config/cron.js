const { pool } = require("../db/connect");
const { broadcast, setWordOfTheDay } = require("./websocket");
const cron = require("node-cron");

async function pickWordOfTheDay() {
  const result = await pool.query(`
        SELECT w.word, w.word_id, m.definition, m.example_sentence, c.name AS category_name
        FROM words w
        JOIN meanings m ON w.word_id = m.word_id
        JOIN categories c ON c.category_id = m.category_id
        ORDER BY RANDOM()
        LIMIT 1
    `);

  const word = result.rows[0];
  setWordOfTheDay(word);
  broadcast(word);
}

function initCron() {
  cron.schedule("0 * * * *", pickWordOfTheDay);
  pickWordOfTheDay();
}

module.exports = { initCron };
