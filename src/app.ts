import express from "express";
import cors, { CorsOptions } from "cors";
import { errorMiddleware } from "./middlewares/error.middleware";
import authRoutes from "./modules/auth/index";
import eventRoutes from "./modules/events/index"
import path from "path";
const app = express();

const corsOptions: CorsOptions = {
  origin: ["http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
};


app.use(cors(corsOptions));
app.use(express.json());
app.use("/public", express.static(path.join(process.cwd(), "public")));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/event", eventRoutes);

app.use(errorMiddleware);

export default app;
