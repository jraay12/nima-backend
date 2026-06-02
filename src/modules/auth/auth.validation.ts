import { z } from "zod";

export const LoginSchema = z.object({
  email: z.email("Invalid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export type LoginDto = z.infer<typeof LoginSchema>;