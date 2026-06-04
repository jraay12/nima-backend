import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma";
import { upload } from "../../lib/multer";
import { authMiddleware, AuthRequest } from "../../middlewares/auth.middleware";
import fs from "fs/promises";
import { createMemberSchema } from "./member.validation";
import path from "path";

const router = Router();

router.post(
  "/",
  authMiddleware,
  upload.fields([{ name: "member", maxCount: 1 }]),
  async (req: Request, res: Response, next: NextFunction) => {
    let filePath: string | null = null;
    let imageUrlPath: string | null = null;

    try {
      const files = req.files as {
        [fieldname: string]: Express.Multer.File[];
      };

      const memberFile = files?.member?.[0];

      if (memberFile) {
        filePath = memberFile.path;
        imageUrlPath = `/public/member/${memberFile.filename}`;
      }

      const parsedBody = createMemberSchema.parse(req.body);

      let biographyParsed: any = null;
      if (parsedBody.biography) {
        try {
          biographyParsed =
            typeof parsedBody.biography === "string"
              ? JSON.parse(parsedBody.biography)
              : parsedBody.biography;
        } catch {
          biographyParsed = [parsedBody.biography];
        }
      }

      const isUpdate = !!parsedBody.id;

      // If updating and a new image was uploaded, delete the old one
      if (isUpdate && memberFile) {
        const existing = await prisma.member.findUnique({
          where: { id: parsedBody.id },
          select: { image_path: true },
        });

        if (existing?.image_path) {
          const oldFilePath = path.join(
            __dirname,
            "../..",
            existing.image_path,
          );
          await fs.unlink(oldFilePath).catch(() => {}); // silent fail if already gone
        }
      }

      const memberData = {
        full_name: parsedBody.full_name,
        practice_name: parsedBody.practice_name,
        speciality: parsedBody.speciality,
        is_boardMember:
          parsedBody.is_boardMember === true ||
          parsedBody.is_boardMember === "true",
        board_title: parsedBody.board_title || null,
        practice_email: parsedBody.practice_email,
        practice_referral_email: parsedBody.practice_referral_email,
        practice_contact_number: parsedBody.practice_contact_number,
        fax_number: parsedBody.fax_number,
        website: parsedBody.website || null,
        biography: biographyParsed,
        city: parsedBody.city,
        state: parsedBody.state,
        country: parsedBody.country,
        // Only update image if a new one was uploaded, otherwise keep existing
        ...(imageUrlPath && { image_path: imageUrlPath }),
      };

      const member = await prisma.member.upsert({
        where: {
          id: parsedBody.id ?? "", // empty string won't match anything → triggers create
        },
        update: {
          ...memberData,
        },
        create: {
          ...memberData,
          image_path: imageUrlPath, // on create always set it (even if null)
          renewals: {
            create: {
              year: parsedBody.year,
            },
          },
        },
      });

      return res.status(isUpdate ? 200 : 201).json({
        success: true,
        message: isUpdate
          ? "Member updated successfully"
          : "Member created successfully",
        data: member,
      });
    } catch (error: any) {
      // Clean up uploaded file if something went wrong
      if (filePath) {
        await fs.unlink(filePath).catch(() => {});
      }

      if (error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.errors,
        });
      }

      next(error);
    }
  },
);

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const members = await prisma.member.findMany({
      orderBy: {
        created_at: "desc",
      },
      where: {
        is_active: true,
      },
      include: {
        renewals: {
          orderBy: {
            created_at: "desc",
          },
          take: 1,
          select: {
            year: true,
          },
        },
      },
    });

    const cleanFormat = members.map((item) => ({
      ...item,
      year: item.renewals[0].year ?? null,
    }));

    return res.status(200).json({
      data: cleanFormat,
    });
  } catch (error) {
    next(error);
  }
});

router.get(
  "/board",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const members = await prisma.member.findMany({
        where: {
          is_boardMember: true,
          is_active: true
        },
      });

      return res.status(200).json({
        data: members,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    const members = await prisma.member.findUnique({
      where: {
        id,
      },
    });

    return res.status(200).json({
      data: members,
    });
  } catch (error) {
    next(error);
  }
});

router.patch(
  "/:id/deactivate",
  authMiddleware,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };

      await prisma.member.update({
        where: {
          id,
        },
        data: {
          is_active: false,
        },
      });

      return res.status(200).json({ message: "Successfully deactivate" });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
