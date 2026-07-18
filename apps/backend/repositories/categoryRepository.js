const { pool } = require("../db/connect");

class CategoryRepository {
  async findAll() {
    const queryText = "SELECT * FROM categories;";
    const result = await pool.query(queryText);
    return result.rows;
  }
}

const categoryRepository = new CategoryRepository();

module.exports = categoryRepository;
