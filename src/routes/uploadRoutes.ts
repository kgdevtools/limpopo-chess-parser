// src/routes/uploadRoutes.ts
import { Router } from "express";
import multer from "multer";
import { uploadFile } from "../controllers/uploadController";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("file"), uploadFile);

export default router;
