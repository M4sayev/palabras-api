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

const bulkDeleteSchema = z.object({
  ids: z
    .array(z.number().int().positive())
    .min(1, "You must provide at least one ID to delete"),
});

const updateWordSchema = createWordSchema.partial();

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});

const resetPasswordSchema = z.object({
  token: z
    .string({ required_error: "Reset token is required" })
    .length(64, "Token must be exactly 64 hexadecimal characters"),

  newPassword: z
    .string({ required_error: "New password is required" })
    .min(6, "Password must be at least 6 characters long"),
});

module.exports = {
  createWordSchema,
  bulkDeleteSchema,
  updateWordSchema,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
