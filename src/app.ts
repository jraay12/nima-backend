import express from "express";
import cors, { CorsOptions } from "cors";
import { errorMiddleware } from "./middlewares/error.middleware";
import authRoutes from "./modules/auth/index";
import eventRoutes from "./modules/events/index";
import memberRoutes from "./modules/members/index";
import dashbaordRoutes from "./modules/dashboard/index"
import path from "path";

const app = express();

const corsOptions: CorsOptions = {
  origin: ["http://localhost:5173", "https://jraay12.github.io"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};


app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowed = ["http://localhost:5173", "https://jraay12.github.io"];

  if (origin && allowed.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(cors(corsOptions));
app.use(express.json());
app.use("/public", express.static(path.join(process.cwd(), "public")));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/event", eventRoutes);
app.use("/api/v1/members", memberRoutes);
app.use("/api/v1/dashboard", dashbaordRoutes);


app.use(errorMiddleware);

export default app;