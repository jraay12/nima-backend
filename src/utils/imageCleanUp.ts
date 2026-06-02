import fs from "fs/promises";

export async function cleanupFiles(files: any) {
  if (!files) return;

  
  const fileList: any[] = Array.isArray(files)
    ? files
    : Object.values(files).flat();

  for (const file of fileList) {
    try {
      await fs.unlink(file.path);
      console.log("Rolled back file:", file.filename);
    } catch (err) {
      console.error("Failed to delete file:", err);
    }
  }
}