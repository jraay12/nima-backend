import express from "express";
import cors from "cors";
import { errorMiddleware } from "./middlewares/error.middleware";
import authRoutes from "./modules/auth/index";
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1/auth", authRoutes);

app.use(errorMiddleware);

export default app;
