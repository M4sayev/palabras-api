const { z } = require("zod");

const createWordSchema = z.object({
  word: z
    .string({ required_error: "Word is required" })
    .trim()
    .min(1, "Word cannot be empty")
    .max(50, "Word cannot exceed 50 characters"),

  category_id: z
    .number({ required_error: "Category ID is required" })
    .int("Category ID must be an integer")
    .positive("Category ID must be a positive number"),

  definition: z
    .string({ required_error: "Definition is required" })
    .trim()
    .min(3, "Definition must be at least 3 characters long"),

  example_sentence: z
    .string({ required_error: "Example sentence is required" })
    .trim()
    .min(3, "Example sentence must be at least 3 characters long"),
});

const updateWordSchema = createWordSchema.partial();

const handleValidation = (schema) => (req, res, next) => {
  const result = createWordSchema.safeParse(req.body);

  if (!result.success) {
    const errorMessages = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join(", ");

    const validationError = new Error(errorMessages);
    validationError.statusCode = 400;
    return next(validationError);
  }

  req.body = result.data;
  next();
};

module.exports = {
  create: handleValidation(createWordSchema),
  update: handleValidation(updateWordSchema),
};
