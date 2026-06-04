import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma";
import { upload } from "../../lib/multer";
import { authMiddleware } from "../../middlewares/auth.middleware";
import fs from "fs/promises";
import { createMemberSchema } from "./member.validation";

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
        imageUrlPath = `/public/member/${memberFile.filename}`; // ✅
      }

      // ✅ Zod validation
      const parsedBody = createMemberSchema.parse(req.body);

      // ✅ Biography parsing (Google Docs JSON style supported)
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

      // ✅ Prisma create (UPDATED SCHEMA)
      const member = await prisma.member.create({
        data: {
          full_name: parsedBody.full_name,
          practice_name: parsedBody.practice_name,
          speciality: parsedBody.speciality,
          // no need to force boolean logic anymore unless you want override
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

          image_path: imageUrlPath,

          city: parsedBody.city,
          state: parsedBody.state,
          country: parsedBody.country,
          renewals: {
            create: {
              year: parsedBody.year,
            },
          },
        },
      });

      return res.status(201).json({
        success: true,
        message: "Member created successfully",
        data: member,
      });
    } catch (error: any) {
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
    });

    return res.status(200).json({
      data: members,
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

export default router;
