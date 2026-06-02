import { Router, Request, Response, NextFunction } from "express";
import { CreateEventSchema } from "./events.validation";
import { prisma } from "../../lib/prisma";
import { upload } from "../../lib/multer";
import { cleanupFiles } from "../../utils/imageCleanUp";
import fs from "node:fs/promises";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.post(
  "/create",
  authMiddleware,
  upload.fields([
    { name: "event_image", maxCount: 1 },
    { name: "speaker_images", maxCount: 10 },
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedBody = {
        ...req.body,
        zipcode: Number(req.body.zipcode),
        featureSpeakers: req.body.featureSpeakers
          ? JSON.parse(req.body.featureSpeakers)
          : undefined,
        sponsors: req.body.sponsors ? JSON.parse(req.body.sponsors) : undefined,
      };

      const data = CreateEventSchema.parse(parsedBody);

      const files = req.files as any;

      const eventImage = files?.event_image?.[0];
      const eventImagePath = `/public/events/${eventImage.filename}`;
      const speakerFiles = files?.speaker_images || [];

      const speakers =
        data.featureSpeakers?.map((speaker: any, index: number) => ({
          fullname: speaker.fullname,
          role: speaker.role,
          title: speaker.title,
          speciality: speaker.speciality,
          image_path: speakerFiles[index]
            ? `/public/speaker/${speakerFiles[index].filename}`
            : null,
          description: speaker.description,
        })) || [];

      const event = await prisma.event.create({
        data: {
          title: data.title,
          badge: data.badge,
          start_time: data.start_time,
          end_time: data.end_time,
          event_date: data.event_date,

          venue: data.venue,
          city: data.city,
          address: data.address,
          state: data.state,
          zipcode: data.zipcode,

          image_path: eventImagePath ? eventImagePath : null,
          notes: data.notes,

          featureSpeakers: speakers.length ? { create: speakers } : undefined,

          sponsors: data.sponsors?.length
            ? { create: data.sponsors }
            : undefined,
        },
      });

      return res.status(201).json({
        message: "Event created successfully",
        event,
      });
    } catch (error) {
      await cleanupFiles(req.files);

      console.log(req.files);
      next(error);
    }
  },
);

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        featureSpeakers: true,
        sponsors: true,
      },
    });

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    return res.status(200).json({
      message: "Event fetched successfully",
      event,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        featureSpeakers: true,
        sponsors: true,
      },
      orderBy: {
        event_date: "asc",
      },
    });

    return res.status(200).json({
      message: "Events fetched successfully",
      count: events.length,
      events,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
