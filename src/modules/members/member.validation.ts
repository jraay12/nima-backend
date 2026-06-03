import { z } from "zod";

export const createMemberSchema = z.object({
  full_name: z.string().optional(),
  practice_name: z.string().optional(),

  practice_email: z.string().email().optional(),
  practice_referral_email: z.string().email().optional(),

  practice_contact_number: z.string().optional(),
  fax_number: z.string().optional(),

  website: z.string().url().optional().or(z.literal("")),

  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  is_boardMember: z.union([z.boolean(), z.string()]).optional(),
  board_title: z.string().optional(),


  // biography comes as string (we parse JSON manually)
  biography: z.any().optional(),
});