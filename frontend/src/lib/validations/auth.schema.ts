import { z } from "zod";

/**
 * Sanitizes email inputs by stripping zero-width spaces, non-breaking spaces
 * (frequently injected by iOS/Safari autofill), trimming and converting to lowercase.
 */
export const cleanEmail = (val: unknown): string => {
  if (typeof val !== "string") return "";
  return val
    .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, "")
    .trim()
    .toLowerCase();
};

export const emailValidator = z
  .string()
  .transform(cleanEmail)
  .pipe(z.string().email("Invalid email address"));

export const LoginSchema = z.object({
  email: emailValidator,
  password: z.string().min(1, "Password is required"),
});

export const passwordValidator = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .refine((val) => /[0-9]/.test(val) || /[^A-Za-z0-9]/.test(val), {
    message: "Password must include at least one number or symbol",
  });

export const SignupSchema = z
  .object({
    firstName: z.string().trim().min(2, "First name must be at least 2 characters"),
    lastName: z.string().trim().min(2, "Last name must be at least 2 characters"),
    email: emailValidator,
    password: passwordValidator,
    confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const ForgotPasswordSchema = z.object({
  email: emailValidator,
});

export const ResetPasswordSchema = z
  .object({
    password: passwordValidator,
    confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof LoginSchema>;
export type SignupInput = z.infer<typeof SignupSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
