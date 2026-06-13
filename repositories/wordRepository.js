const pool = require("../db/connect.js");

class WordRepository {
  async findFilteredWords({ category, search }) {
    let queryText = `
        SELECT 
        w.word_id, w.word, c.name AS category_name,
        c.description AS category_description, m.meaning_id,
        m.definition, m.example_sentence
        FROM words w INNER JOIN meanings m ON w.word_id = m.word_id
        INNER JOIN categories c ON c.category_id = m.category_id  
    `;

    const queryParams = [];
    const whereClauses = [];

    if (category) {
      queryParams.push(category);
      whereClauses.push(`c.name = $${queryParams.length}`);
    }

    if (search) {
      queryParams.push(`%${search}%`);
      whereClauses.push(`w.word ILIKE $${queryParams.length}`);
    }

    if (whereClauses.length > 0) {
      queryText += " WHERE " + whereClauses.join(" AND ");
    }

    queryText += ` ORDER BY w.word ASC;`;

    const result = await pool.query(queryText, queryParams);
    return result.rows;
  }

  async deleteById(id) {
    const queryText = `
    DELETE FROM words 
    WHERE word_id = $1 
    RETURNING *;
  `;

    const result = await pool.query(queryText, [id]);

    return result.rowCount === 0 ? null : result.rows[0];
  }

  async getWordById(id) {
    const queryText = `
        SELECT w.word_id, w.word, c.name AS category_name, 
        c.description AS category_description, m.definition, m.example_sentence
        FROM words w
        INNER JOIN meanings m ON w.word_id = m.word_id
        INNER JOIN categories c ON c.category_id = m.category_id
        WHERE w.word_id = $1; 
    `;

    const result = await pool.query(queryText, [id]);

    return result.rows.length === 0 ? null : result.rows[0];
  }

  async bulkDeleteByIds(ids) {
    const parameterPlaceholders = ids
      .map((_, index) => `$${index + 1}`)
      .join(", ");

    const queryText = `
        DELETE FROM words 
        WHERE word_id IN (${parameterPlaceholders})
        RETURNING *;
    `;

    const result = await pool.query(queryText, ids);

    return {
      count: result.rowCount,
      words: result.rows,
    };
  }

  async createWordAndMeaning({
    word,
    category_id,
    definition,
    example_sentence,
  }) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const wordQuery = `
      INSERT INTO words (word) 
      VALUES ($1) 
      RETURNING word_id;
    `;

      const wordResult = await client.query(wordQuery, [word]);
      const newWordId = wordResult.rows[0].word_id;

      const meaningQuery = `
      INSERT INTO meanings (word_id, category_id, definition, example_sentence)
      VALUES ($1, $2, $3, $4)
      RETURNING meaning_id;
    `;

      const meaningResult = await client.query(meaningQuery, [
        newWordId,
        category_id,
        definition,
        example_sentence,
      ]);

      await client.query("COMMIT");

      return {
        word_id: newWordId,
        word,
        meaning_id: meaningResult.rows[0].meaning_id,
        category_id,
        definition,
        example_sentence,
      };
    } catch (error) {
      await client.query("ROLLBACK");

      return next(error);
    } finally {
      client.release();
    }
  }

  async updateWordAndMeaning({
    id,
    word,
    category_id,
    definition,
    example_sentence,
  }) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const check = await client.query(
        "SELECT * FROM words WHERE word_id = $1",
        [id],
      );
      if (check.rows.length === 0) {
        await client.query("ROLLBACK");
        return null;
      }

      if (word) {
        await client.query("UPDATE words SET word = $1 WHERE word_id = $2", [
          word,
          id,
        ]);
      }

      const meaningFields = [];
      const meaningValues = [];

      if (category_id) {
        meaningValues.push(category_id);
        meaningFields.push(`category_id = $${meaningValues.length}`);
      }

      if (definition) {
        meaningValues.push(definition);
        meaningFields.push(`definition = $${meaningValues.length}`);
      }

      if (example_sentence) {
        meaningValues.push(example_sentence);
        meaningFields.push(`example_sentence = $${meaningValues.length}`);
      }

      if (meaningFields.length > 0) {
        meaningValues.push(id);
        const meaningQuery = `
        UPDATE meanings 
        SET ${meaningFields.join(", ")} 
        WHERE word_id = $${meaningValues.length};
      `;
        await client.query(meaningQuery, meaningValues);
      }

      await client.query("COMMIT");

      return true;
    } catch (error) {
      await client.query("ROLLBACK");
      return error;
    } finally {
      client.release();
    }
  }
}

const wordRepository = new WordRepository();

module.exports = wordRepository;
