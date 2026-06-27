const express = require("express");
const asyncWrapper = require("../middleware/asyncWrapper.js");
const {
  getWords,
  getSingleWord,
  deleteWord,
  createWord,
  updateWord,
  bulkDeleteWords,
  getCategories,
} = require("../controllers/dictionary.js");
const validateDto = require("../middleware/validateDTO.js");

const router = express.Router();

/**
 * @openapi
 * /dictionary/words:
 *   get:
 *     summary: Retrieve words with dynamic filtering
 *     description: Fetches words, meanings, and categories. Supports search strings and category filtering.
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter words by exact category name (e.g., Nouns)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Case-insensitive search on the word field
 *     responses:
 *       200:
 *         description: A successful array of filtered words.
 *       500:
 *         description: Internal Server Error.
 *
 *   post:
 *     summary: Create a brand new word with its details
 *     description: Uses a safe transaction to insert data across the words and meanings tables.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - word
 *               - category_id
 *               - definition
 *               - example_sentence
 *             properties:
 *               word:
 *                 type: string
 *                 example: "test"
 *               category_id:
 *                 type: integer
 *                 example: 1
 *               definition:
 *                 type: string
 *                 example: "A very nice dictionary test word."
 *               example_sentence:
 *                 type: string
 *                 example: "Let us code with bebra."
 *     responses:
 *       201:
 *         description: Word and meaning created successfully.
 *       400:
 *         description: Validation failed (Zod error catching).
 *       500:
 *         description: Internal Server Error.
 *   delete:
 *     summary: Bulk delete multiple words at once
 *     description: Wipes a batch of words and their cascading meanings by passing an array of IDs in the request body.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 description: Array of word IDs to delete
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: All specified words and their corresponding records deleted successfully.
 *       400:
 *         description: Validation failed (Zod caught an empty array or text strings instead of numbers).
 *       404:
 *         description: No matching words were found for the provided IDs.
 *       500:
 *         description: Internal Server Error.
 */
router
  .route("/words")
  .get(asyncWrapper(getWords))
  .post(validateDto.create, asyncWrapper(createWord))
  .delete(validateDto.bulkDelete, asyncWrapper(bulkDeleteWords));

/**
 * @openapi
 * /dictionary/words/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: integer
 *       description: The primary key ID of the word
 *
 *   get:
 *     summary: Fetch a single word profile
 *     responses:
 *       200:
 *         description: Word details found successfully.
 *       404:
 *         description: Word not found.
 *
 *   delete:
 *     summary: Remove a word and cascade delete meanings
 *     responses:
 *       200:
 *         description: Word and corresponding relationship rows wiped cleanly.
 *       404:
 *         description: Word not found.
 *
 *   patch:
 *     summary: Partially update a word or its definition details
 *     description: Reuses your Zod partial evaluation schema. Pass only the keys you need changed.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               word:
 *                 type: string
 *               category_id:
 *                 type: integer
 *               definition:
 *                 type: string
 *               example_sentence:
 *                 type: string
 *     responses:
 *       200:
 *         description: Details patched successfully.
 *       400:
 *         description: Invalid field types provided.
 *       404:
 *         description: Word profile not found.
 */
router
  .route("/words/:id")
  .get(asyncWrapper(getSingleWord))
  .delete(asyncWrapper(deleteWord))
  .patch(validateDto.update, asyncWrapper(updateWord));

/**
 * @openapi
 * /categories:
 *   get:
 *     summary: List all word categories
 *     description: Returns every category in the catalog, ordered by name. Used to populate category filters and the add/edit word form on the frontend.
 *     responses:
 *       200:
 *         description: Categories retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       category_id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "verbs"
 *                       description:
 *                         type: string
 *                         example: "Action words or states of being."
 *       500:
 *         description: Internal Server Error.
 */
router.route("/categories").get(asyncWrapper(getCategories));

module.exports = router;
