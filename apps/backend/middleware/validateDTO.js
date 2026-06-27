const {
  createWordSchema,
  updateWordSchema,
  bulkDeleteSchema,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require("../validation/schemas");

const handleValidation = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const validationErrors = {};

    result.error.issues.forEach((issue) => {
      const fieldName = issue.path.join(".");
      validationErrors[fieldName] = issue.message;
    });

    const err = new Error("Validation Failed");
    err.statusCode = 400;

    err.validationErrors = validationErrors;
    return next(err);
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
  forgotPassword: handleValidation(forgotPasswordSchema),
  resetPassword: handleValidation(resetPasswordSchema),
};
