import { z } from "zod";

export const createWordSchema = z.object({
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

export const bulkDeleteSchema = z.object({
  ids: z
    .array(z.number().int().positive())
    .min(1, "You must provide at least one ID to delete"),
});

export const updateWordSchema = createWordSchema.partial();

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export const resetPasswordSchema = z.object({
  token: z
    .string({ required_error: "Reset token is required" })
    .length(64, "Token must be exactly 64 hexadecimal characters"),

  newPassword: z
    .string({ required_error: "New password is required" })
    .min(6, "Password must be at least 6 characters long"),
});

export const resetPasswordRealTimeSchema = z.object({
  newPassword: z
    .string({ required_error: "New password is required" })
    .min(6, "Password must be at least 6 characters long"),
  repeatPassword: z
    .string({ required_error: "Repeat password is required" })
    .min(6, "Password must be at least 6 characters long"),
});
