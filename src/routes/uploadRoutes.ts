import { Router } from "express";
import multer from "multer";
import { uploadFile, uploadToDb } from "../controllers/uploadController";

const router = Router();
const upload = multer();

// Parse only
router.post("/", upload.single("file"), uploadFile);

// Save to DB
router.post("/to-db", uploadToDb);

export default router;
