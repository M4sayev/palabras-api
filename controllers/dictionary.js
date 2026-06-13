const pool = require("../db/connect.js");

const getWords = async (req, res) => {
  const { category, search } = req.query;
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

  return res.status(200).json({
    success: true,
    count: result.rowCount,
    data: result.rows,
  });
};

const getSingleWord = async (req, res) => {
  const id = req.params.id;

  const queryText = `
    SELECT w.word_id, w.word, c.name AS category_name, 
    c.description AS category_description, m.definition, m.example_sentence
    FROM words w
    INNER JOIN meanings m ON w.word_id = m.word_id
    INNER JOIN categories c ON c.category_id = m.category_id
    WHERE w.word_id = $1; 
  `;

  const result = await pool.query(queryText, [id]);

  if (result.rows.length === 0) {
    const error = new Error("Word not found");
    error.statusCode = 404;
    return next(error);
  }

  return res.status(200).json({
    success: true,
    data: result.rows[0],
  });
};

const deleteWord = async (req, res) => {
  const id = req.params.id;

  const queryText = `
    DELETE FROM words 
    WHERE word_id = $1 
    RETURNING *;
  `;

  const result = await pool.query(queryText, [id]);

  if (result.rowCount === 0) {
    const error = new Error("Word not found");
    error.statusCode = 404;
    return next(error);
  }

  return res.status(200).json({
    success: true,
    message: "Word and its associated meanings deleted successfully.",
    deletedWord: result.rows[0],
  });
};

const createWord = async (req, res, next) => {
  const { word, category_id, definition, example_sentence } = req.body;

  if (!word || !category_id || !definition || !example_sentence) {
    const error = new Error(
      "Please provide all required fields: word, category_id, definition, example_sentence",
    );
    error.statusCode = 400;
    return next(error);
  }

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

    return res.status(201).json({
      success: true,
      message: "Word and meaning created successfully!",
      data: {
        word_id: newWordId,
        word: word,
        meaning_id: meaningResult.rows[0].meaning_id,
        category_id: category_id,
        definition: definition,
        example_sentence: example_sentence,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");

    return next(error);
  } finally {
    client.release();
  }
};

const updateWord = async (req, res, next) => {
  const id = req.params.id;
  const { word, category_id, definition, example_sentence } = req.body;

  if (Object.keys(req.body).length === 0) {
    const error = new Error("Please provide at least one field to update.");
    error.statusCode = 400;
    return next(error);
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

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

    return res.status(200).json({
      success: true,
      message: "Word and associated meanings updated successfully!",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    return next(error);
  } finally {
    client.release();
  }
};

const bulkDeleteWords = async (req, res, next) => {
  const ids = req.body.ids;
  const parameterPlaceholders = ids
    .map((_, index) => `$${index + 1}`)
    .join(", ");

  const queryText = `
    DELETE FROM words 
    WHERE word_id IN (${parameterPlaceholders})
    RETURNING *;
  `;

  const result = await pool.query(queryText, ids);

  if (result.rowCount === 0) {
    const error = new Error("No words were found matching the provided IDs.");
    error.statusCode = 404;
    return next(error);
  }

  return res.status(200).json({
    success: true,
    message: `Successfully deleted ${result.rowCount} words and their associated meanings.`,
    deletedCount: result.rowCount,
    deletedWords: result.rows,
  });
};

module.exports = {
  getWords,
  getSingleWord,
  deleteWord,
  createWord,
  updateWord,
  bulkDeleteWords,
};
