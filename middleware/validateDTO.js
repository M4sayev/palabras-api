const {
  createWordSchema,
  updateWordSchema,
  bulkDeleteSchema,
  registerSchema,
  loginSchema,
} = require("../validation/schemas");

const handleValidation = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

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
  bulkDelete: handleValidation(bulkDeleteSchema),
  registerUser: handleValidation(registerSchema),
  loginUser: handleValidation(loginSchema),
};
