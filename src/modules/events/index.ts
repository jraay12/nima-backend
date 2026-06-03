import { Router, Request, Response, NextFunction } from "express";
import { CreateEventSchema } from "./events.validation";
import { prisma } from "../../lib/prisma";
import { upload } from "../../lib/multer";
import { cleanupFiles } from "../../utils/imageCleanUp";
import { authMiddleware } from "../../middlewares/auth.middleware";
import path from "node:path";
import fs from "fs/promises";

const router = Router();

router.post(
  "/create",
  authMiddleware,
  upload.any(),
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
      const files = req.files as Express.Multer.File[];
      const eventId: string | undefined = req.body.id;
      const isUpdate = !!eventId;

      // ─────────────────────────────
      // EVENT IMAGE
      // ─────────────────────────────
      const eventImageFile = files.find((f) => f.fieldname === "event_image");
      const newEventImagePath = eventImageFile
        ? `/public/events/${eventImageFile.filename}`
        : null;

      if (isUpdate && newEventImagePath) {
        const existing = await prisma.event.findUnique({
          where: { id: eventId },
          select: { image_path: true },
        });
        if (existing?.image_path) {
          const oldPath = path.join(process.cwd(), existing.image_path);
          await fs.unlink(oldPath).catch(() => {});
        }
      }

      // ─────────────────────────────
      // SPEAKER IMAGES (INDEXED)
      // ─────────────────────────────
      const speakerImageMap: Record<number, string> = {};
      files.forEach((file) => {
        if (file.fieldname.startsWith("speaker_images_")) {
          const index = Number(file.fieldname.split("_")[2]);
          speakerImageMap[index] = `/public/speaker/${file.filename}`;
        }
      });

      // ─────────────────────────────
      // CREATE
      // ─────────────────────────────
      if (!isUpdate) {
        const speakers = (data.featureSpeakers ?? []).map(
          (speaker: any, index: number) => ({
            fullname: speaker.fullname,
            role: speaker.role,
            title: speaker.title,
            speciality: speaker.speciality,
            description: speaker.description,
            image_path: speakerImageMap[index] ?? null,
          }),
        );

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
            image_path: newEventImagePath,
            notes: data.notes,
            featureSpeakers: speakers.length ? { create: speakers } : undefined,
            sponsors: data.sponsors?.length
              ? { create: data.sponsors }
              : undefined,
          },
        });

        return res
          .status(201)
          .json({ message: "Event created successfully", event });
      }

      // ─────────────────────────────
      // UPDATE
      // ─────────────────────────────

      const existingSpeakers = await prisma.featureSpeaker.findMany({
        where: { event_id: eventId },
        select: { id: true, image_path: true },
      });

      const existingSpeakerIdSet = new Set(existingSpeakers.map((s) => s.id));

      const speakers = (data.featureSpeakers ?? []).map(
        (speaker: any, index: number) => {
          const isRealId = speaker.id && existingSpeakerIdSet.has(speaker.id);
          const hasNewImage = speakerImageMap[index] !== undefined;
          return {
            id: isRealId ? speaker.id : undefined,
            existing_image_path: speaker.image_path ?? null,
            fullname: speaker.fullname,
            role: speaker.role,
            title: speaker.title,
            speciality: speaker.speciality,
            description: speaker.description,
            newImagePath: hasNewImage ? speakerImageMap[index] : null,
          };
        },
      );

      const incomingSpeakerIds = new Set(
        speakers.filter((s) => s.id).map((s) => s.id!),
      );

      // Speakers that were removed — delete their files and DB rows
      const removedSpeakers = existingSpeakers.filter(
        (s) => !incomingSpeakerIds.has(s.id),
      );

      console.log("incomingSpeakerIds", [...incomingSpeakerIds]);
      console.log("existingSpeakers", existingSpeakers);
      console.log("removedSpeakers", removedSpeakers);
      await Promise.all(
        removedSpeakers.map(async (s) => {
          if (s.image_path) {
            const oldPath = path.join(process.cwd(), s.image_path);
            await fs.unlink(oldPath).catch(() => {});
          }
          await prisma.featureSpeaker.delete({ where: { id: s.id } });
        }),
      );

      // Upsert each speaker
      await Promise.all(
        speakers.map(async (s) => {
          if (s.id) {
            // If a new image was uploaded, delete the old file first
            if (s.newImagePath) {
              const old = existingSpeakers.find((e) => e.id === s.id);
              if (old?.image_path) {
                const oldPath = path.join(process.cwd(), old.image_path);
                console.log("Deleting old speaker image:", oldPath); // ← add this
                await fs.unlink(oldPath).catch(() => {});
              }
            }

            await prisma.featureSpeaker.update({
              where: { id: s.id },
              data: {
                fullname: s.fullname,
                role: s.role,
                title: s.title,
                speciality: s.speciality,
                description: s.description,
                // ✅ Only update image_path if a new file was uploaded
                ...(s.newImagePath ? { image_path: s.newImagePath } : {}),
              },
            });
          } else {
            // New speaker — create
            await prisma.featureSpeaker.create({
              data: {
                event_id: eventId,
                fullname: s.fullname,
                role: s.role,
                title: s.title,
                speciality: s.speciality,
                description: s.description,
                image_path: s.newImagePath ?? s.existing_image_path,
              },
            });
          }
        }),
      );

      // ─────────────────────────────
      // SPONSORS (delete all, re-create)
      // ─────────────────────────────
      await prisma.sponsor.deleteMany({ where: { event_id: eventId } });

      const updatedEvent = await prisma.event.update({
        where: { id: eventId },
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
          ...(newEventImagePath && { image_path: newEventImagePath }),
          notes: data.notes,
          sponsors: data.sponsors?.length
            ? { create: data.sponsors }
            : undefined,
        },
        include: {
          featureSpeakers: true,
          sponsors: true,
        },
      });

      return res
        .status(200)
        .json({ message: "Event updated successfully", event: updatedEvent });
    } catch (error) {
      await cleanupFiles(req.files);
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
