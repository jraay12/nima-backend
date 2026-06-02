import fs from "fs/promises";

export async function cleanupFiles(files: any) {
  if (!files) return;

  for (const fieldName in files) {
    const fileArray = files[fieldName];

    for (const file of fileArray) {
      try {
        await fs.unlink(file.path);
        console.log("Rolled back file:", file.filename);
      } catch (err) {
        console.error("Failed to delete file:", err);
      }
    }
  }
}