import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import { z } from "zod";

const router = Router();

// validation schema
const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

router.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. validate input
      const { email, password } = LoginSchema.parse(req.body);

      // 2. find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(401).json({
          message: "Invalid credentials",
        });
      }

      // 3. check password
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({
          message: "Invalid credentials",
        });
      }

      // 4. create JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
        },
        process.env.JWT_SECRET!,
        {
          expiresIn: "1d",
        },
      );

      // 5. response
      return res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
