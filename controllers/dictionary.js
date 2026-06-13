const wordRepository = require("../repositories/wordRepository.js");

const getWords = async (req, res) => {
  const { category, search } = req.query;

  const words = await wordRepository.findFilteredWords({ category, search });

  return res.status(200).json({
    success: true,
    count: words.length,
    data: words,
  });
};

const getSingleWord = async (req, res, next) => {
  const id = req.params.id;

  const word = await wordRepository.getWordById(id);

  if (!word) {
    const error = new Error("Word not found");
    error.statusCode = 404;
    return next(error);
  }

  return res.status(200).json({
    success: true,
    data: word,
  });
};

const deleteWord = async (req, res, next) => {
  const id = req.params.id;

  const word = await wordRepository.deleteById(id);

  if (!word) {
    const error = new Error("Word not found");
    error.statusCode = 404;
    return next(error);
  }

  return res.status(200).json({
    success: true,
    message: "Word and its associated meanings deleted successfully.",
    deletedWord: word,
  });
};

const createWord = async (req, res, next) => {
  const newWord = await wordRepository.createWordAndMeaning(req.body);

  return res.status(201).json({
    success: true,
    message: "Word and meaning created successfully!",
    data: newWord,
  });
};

const updateWord = async (req, res, next) => {
  const id = req.params.id;
  const { word, category_id, definition, example_sentence } = req.body;

  if (Object.keys(req.body).length === 0) {
    const error = new Error("Please provide at least one field to update.");
    error.statusCode = 400;
    return next(error);
  }

  const result = await wordRepository.updateWordAndMeaning({ id, ...req.body });

  if (!result) {
    const error = new Error("Word not found");
    error.statusCode = 404;
    return next(error);
  }

  return res.status(200).json({
    success: true,
    message: "Word and associated meanings updated successfully!",
  });
};

const bulkDeleteWords = async (req, res, next) => {
  const ids = req.body.ids;

  const { count, words } = await wordRepository.bulkDeleteByIds(ids);

  if (count === 0) {
    const error = new Error("No words were found matching the provided IDs.");
    error.statusCode = 404;
    return next(error);
  }

  return res.status(200).json({
    success: true,
    message: `Successfully deleted ${count} words and their associated meanings.`,
    deletedCount: count,
    deletedWords: words,
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
