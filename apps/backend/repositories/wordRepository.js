const pool = require("../db/connect.js");
const redisClient = require("../config/redis.js");
const { invalidateWordCache } = require("../utils/redis.js");
const logger = require("../config/logger.js");

class WordRepository {
  async findFilteredWords({ category, search }) {
    const cleanCategory = category?.trim().toLowerCase() || "all";
    const cleanSearch = search?.trim().toLowerCase() || "none";

    const cachedKey = `category:${cleanCategory}:search:${cleanSearch}`;

    try {
      const cachedData = await redisClient.get(cachedKey);
      if (cachedData) {
        console.log("Words cache hit");
        return JSON.parse(cachedData);
      }
    } catch (error) {
      logger.error("Redis read error:", error.message);
    }

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

    try {
      await redisClient.setEx(cachedKey, 3600, JSON.stringify(result.rows));
    } catch (error) {
      logger.error("Redis write error ", error.message);
    }

    return result.rows;
  }

  async deleteById(id) {
    const queryText = `
    WITH deleted_word AS (
      DELETE FROM words 
      WHERE word_id = $1 
      RETURNING *
    )
    SELECT 
      dw.*, 
      c.name AS category_name
    FROM deleted_word dw
    LEFT JOIN meanings m ON dw.word_id = m.word_id
    LEFT JOIN categories c ON c.category_id = m.category_id;
  `;

    const result = await pool.query(queryText, [id]);

    const hasDeleted = result.rowCount !== 0;

    if (hasDeleted) {
      invalidateWordCache(result.rows[0].category_name);
    }

    return hasDeleted ? result.rows[0] : null;
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
    if (!ids || ids.length === 0) return { count: 0, words: [] };

    const parameterPlaceholders = ids
      .map((_, index) => `$${index + 1}`)
      .join(", ");

    const queryText = `
        WITH deleted_words AS (
          DELETE FROM words 
          WHERE word_id IN (${parameterPlaceholders})
          RETURNING *
        )
        SELECT 
          dw.*, 
          c.name AS category_name
        FROM deleted_words dw
        LEFT JOIN meanings m ON dw.word_id = m.word_id
        LEFT JOIN categories c ON c.category_id = m.category_id;
    `;

    const result = await pool.query(queryText, ids);

    if (result.rowCount > 0) {
      const affectedCategories = [
        ...new Set(
          result.rows.map(
            ((row) => row.category_name?.trim().toLowerCase()).filter(Boolean),
          ),
        ),
      ];

      try {
        await Promise.all(
          affectedCategories.map((category) => invalidateWordCache(category)),
        );
      } catch (cacheError) {
        logger.error("Bulk cache invalidation failed:", cacheError.message);
      }
    }

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
      logger.error("Error creating the word", error.message);
      throw error;
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

    const categoriesToInvalidate = new Set();

    try {
      await client.query("BEGIN");

      const oldCategoryCheck = await client.query(
        `
      SELECT c.name 
      FROM meanings m
      INNER JOIN categories c ON c.category_id = m.category_id
      WHERE m.word_id = $1
    `,
        [id],
      );

      if (oldCategoryCheck.rows.length === 0) {
        await client.query("ROLLBACK");
        return null;
      }

      if (oldCategoryCheck.rows[0]?.name) {
        categoriesToInvalidate.add(
          oldCategoryCheck.rows[0].name.trim().toLowerCase(),
        );
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

        const newCategoryCheck = await client.query(
          "SELECT name FROM categories WHERE category_id = $1",
          [category_id],
        );
        if (newCategoryCheck.rows[0]?.name) {
          categoriesToInvalidate.add(
            newCategoryCheck.rows[0].name.trim().toLowerCase(),
          );
        }
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

      try {
        if (categoriesToInvalidate.size > 0) {
          await Promise.all(
            Array.from(categoriesToInvalidate).map((cat) =>
              invalidateWordCache(cat),
            ),
          );
        } else {
          await invalidateWordCache();
        }
      } catch (cacheError) {
        logger.error(
          "Post-commit cache invalidation failed (word-update):",
          cacheError.message,
        );
      }

      return true;
    } catch (error) {
      await client.query("ROLLBACK");
      logger.error("Transaction failed, rolling back:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }
}

const wordRepository = new WordRepository();

module.exports = wordRepository;
