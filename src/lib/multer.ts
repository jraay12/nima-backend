import multer from "multer";
import path from "node:path";
import fs from "node:fs";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = "uploads";

    // ─────────────────────────────
    // FIX: use prefix matching
    // ─────────────────────────────
    if (file.fieldname === "event_image") {
      folder = "events";
    } else if (file.fieldname.startsWith("speaker_images_")) {
      folder = "speaker";
    } else if (file.fieldname.startsWith("member")) {
      folder = "member";
    }

    const dir = path.join("./public", folder);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },

  filename: function (_req, file, cb) {
    // safer unique filename (avoids collisions)
    const uniqueName =
      `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;

    cb(null, uniqueName);
  },
});

export const upload = multer({ storage });