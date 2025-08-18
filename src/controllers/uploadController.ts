// src/controllers/uploadController.ts
import { Request, Response } from "express";
import { parseExcelToJson } from "../services/parserService";
import { saveTournamentNormalized } from "../repositories/tournamentRepo";

/**
 * POST /upload
 * Parses the uploaded Excel and returns JSON (no DB write).
 */
export async function uploadFile(req: Request, res: Response) {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const parsed = await parseExcelToJson(req.file.buffer, req.file.originalname);
    return res.json(parsed);
  } catch (error) {
    console.error("[uploadController] parse error:", error);
    return res.status(500).json({ error: "Failed to parse file" });
  }
}

/**
 * POST /upload-to-db
 * Accepts parsed JSON (TournamentData) and persists normalized data to Supabase.
 */
export async function uploadToDb(req: Request, res: Response) {
  try {
    const body = req.body;
    if (!body || !body.tournament_metadata || !body.player_rankings) {
      return res.status(400).json({ error: "Invalid payload: missing tournament data" });
    }

    const result = await saveTournamentNormalized(body);
    return res.json({ message: "Saved to Supabase", ...result });
  } catch (error) {
    console.error("[uploadController] save error:", error);
    return res.status(500).json({ error: "Failed to save to Supabase" });
  }
}
