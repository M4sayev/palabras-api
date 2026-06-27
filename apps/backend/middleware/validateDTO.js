const handleValidation = (schemaName) => async (req, res, next) => {
  try {
    const schemas = await import("@my-app/validation");
    const schema = schemas[schemaName];

    if (!schema) {
      return next(new Error(`Validation schema '${schemaName}' not found.`));
    }

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
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create: handleValidation("createWordSchema"),
  update: handleValidation("updateWordSchema"),
  bulkDelete: handleValidation("bulkDeleteSchema"),
  registerUser: handleValidation("registerSchema"),
  loginUser: handleValidation("loginSchema"),
  forgotPassword: handleValidation("forgotPasswordSchema"),
  resetPassword: handleValidation("resetPasswordSchema"),
};
