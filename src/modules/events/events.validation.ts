import { z } from "zod";

export const CreateEventSchema = z.object({
  title: z.string().optional(),
  badge: z.string().optional(),

  start_time: z.string().optional(),
  end_time: z.string().optional(),
  event_date: z.coerce.date().optional(),

  venue: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  state: z.string().optional(),

  zipcode: z.coerce.number().optional(),

  image_path: z.string().optional(),
  notes: z.string().optional(),

  featureSpeakers: z
    .array(
      z.object({
        id: z.string().optional(),

        fullname: z.string().optional(),
        role: z.string().optional(),
        title: z.string().optional(),
        speciality: z.string().optional(),

        image_path: z.string().nullable().optional(),
        description: z.string().optional(),
      })
    )
    .optional(),

  sponsors: z
    .array(
      z.object({
        id: z.string().optional(),

        name: z.string().optional(),
        link: z.string().url().optional().or(z.literal("")),
      })
    )
    .optional(),
});