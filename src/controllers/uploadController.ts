// src/controllers/uploadController.ts
import { Request, Response } from "express";
import { ParserService } from "../services/parserService";

export const uploadFile = (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const parser = new ParserService(req.file.originalname);
    const result = parser.parse(req.file.buffer);

    console.log(`[uploadController:uploadFile] File=${req.file.originalname} Parsed=`, result.tournament_metadata);

    res.json(result);
  } catch (err) {
    console.error(`[uploadController:uploadFile] File=${req.file.originalname} Error=`, err);
    res.status(500).json({ error: "Failed to parse file" });
  }
};
