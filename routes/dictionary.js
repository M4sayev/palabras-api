const express = require("express");
const asyncWrapper = require("../middleware/asyncWrapper.js");
const {
  getWords,
  getSingleWord,
  deleteWord,
  createWord,
  updateWord,
  bulkDeleteWords,
} = require("../controllers/dictionary.js");
const validateWordDto = require("../middleware/validateWord.js");

const router = express.Router();

router
  .route("/words")
  .get(asyncWrapper(getWords))
  .post(validateWordDto.create, asyncWrapper(createWord))
  .delete(validateWordDto.bulkDelete, asyncWrapper(bulkDeleteWords));

router
  .route("/words/:id")
  .get(asyncWrapper(getSingleWord))
  .delete(asyncWrapper(deleteWord))
  .patch(validateWordDto.update, asyncWrapper(updateWord));

module.exports = router;
