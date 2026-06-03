import { z } from "zod";

export const CreateEventSchema = z.object({
  title: z.string().min(1),
  badge: z.string().min(1),

  start_time: z.string(),
  end_time: z.string(),
  event_date: z.coerce.date(),

  venue: z.string(),
  city: z.string(),
  address: z.string(),
  state: z.string(),
  zipcode: z.coerce.number(),

  image_path: z.string().optional(),
  notes: z.string().optional(),

  featureSpeakers: z
    .array(
      z.object({
        fullname: z.string(),
        role: z.string(),
        title: z.string(),
        speciality: z.string(),
        image_path: z.string().nullable().optional(),
        description: z.string().optional(),
      })
    )
    .optional(),

  sponsors: z
    .array(
      z.object({
        name: z.string(),
        link: z.string().url(),
      })
    )
    .optional(),
});
