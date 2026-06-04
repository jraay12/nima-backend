import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma";
import { authMiddleware, AuthRequest } from "../../middlewares/auth.middleware";
import { array } from "zod";

const router = Router();

router.get(
  "/",
  authMiddleware,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const months: any = [];
      const [active, archived, totalEvents, members, recent, upcoming] =
        await Promise.all([
          prisma.member.count({
            where: {
              is_active: true,
            },
          }),
          prisma.member.count({
            where: {
              is_active: false,
            },
          }),
          prisma.event.count(),
          prisma.member.findMany({
            select: {
              created_at: true,
            },
          }),
          prisma.event.findMany({
            orderBy: {
              created_at: "desc",
            },
            take: 3,
            select: {
              title: true,
              event_date: true,
              badge: true,
            },
          }),
          prisma.event.findMany({
            orderBy: {
              event_date: "desc",
            },
            take: 3,
            select: {
              title: true,
              event_date: true,
              badge: true,
            },
          }),
        ]);

      const monthly = Array(12).fill(0);

      members.forEach((item) => {
        const month = item.created_at.getMonth(); // 0-11
        monthly[month]++;
      });

      res.status(200).json({
        active,
        archived,
        totalEvents,
        monthly,
        recent,
        upcoming
      });
    } catch (error) {
      next(error);
    }
  },
);
export default router;
