import { Router } from "express";
import multer from "multer";
import { uploadFile, uploadToDb } from "../controllers/uploadController";

const router = Router();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });

// Parse only
router.post("/", upload.single("file"), uploadFile);

// Save to DB
router.post("/to-db", uploadToDb);

export default router;
