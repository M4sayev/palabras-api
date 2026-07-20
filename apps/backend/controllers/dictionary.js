const wordRepository = require("../repositories/wordRepository.js");
const categoryRepository = require("../repositories/categoryRepository.js");
const createNotFoundHandler = require("../errors/notFoundError.js");

const getWords = async (req, res) => {
  const category = req.query.category;
  const search = req.query.search;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);
  const offset = (page - 1) * limit;

  const { words, total } = await wordRepository.findFilteredWords({
    category,
    search,
    limit,
    offset,
  });

  return res.status(200).json({
    success: true,
    count: words.length,
    data: words,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
};

const getSingleWord = async (req, res, next) => {
  const id = req.params.id;

  const word = await wordRepository.getWordById(id);

  if (!word) {
    return createNotFoundHandler("Word not found")(req, res, next);
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
    return createNotFoundHandler("Word not found")(req, res, next);
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
    return createNotFoundHandler("Word not found")(req, res, next);
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
    return createNotFoundHandler(
      "No words were found matching the provided IDs.",
    )(req, res, next);
  }

  return res.status(200).json({
    success: true,
    message: `Successfully deleted ${count} words and their associated meanings.`,
    deletedCount: count,
    deletedWords: words,
  });
};

const getCategories = async (req, res, next) => {
  const categories = await categoryRepository.findAll();

  return res.status(200).json({
    success: true,
    count: categories.length,
    data: categories,
  });
};

module.exports = {
  getWords,
  getSingleWord,
  deleteWord,
  createWord,
  updateWord,
  bulkDeleteWords,
  getCategories,
};
