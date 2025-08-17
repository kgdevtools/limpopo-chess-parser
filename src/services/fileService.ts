import fs from "fs";
import { logAction } from "../utils/logger";

export function deleteFile(filePath: string) {
  try {
    fs.unlinkSync(filePath);
    logAction(filePath, "deleteFile", "Deleted");
  } catch (e: any) {
    logAction(filePath, "deleteFile", "Delete failed: " + e.message);
  }
}
