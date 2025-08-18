import { Router } from "express";
import { supabase } from "../lib/supabaseClient";

const router = Router();

// GET all tournaments with normalized structure
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("tournaments")
      .select("id, created_at, raw_metadata, results")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // normalize response
    const tournaments = data.map(t => ({
      id: t.id,
      created_at: t.created_at,
      metadata: t.raw_metadata || {},
      results: t.results || [],
    }));

    res.json(tournaments);
  } catch (err) {
    console.error("[tournaments] fetch error:", err);
    res.status(500).json({ error: "Failed to fetch tournaments" });
  }
});

// GET single tournament by id
router.get("/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("tournaments")
      .select("id, created_at, raw_metadata, results")
      .eq("id", req.params.id)
      .single();

    if (error) throw error;

    res.json({
      id: data.id,
      created_at: data.created_at,
      metadata: data.raw_metadata || {},
      results: data.results || [],
    });
  } catch (err) {
    console.error("[tournaments] single fetch error:", err);
    res.status(500).json({ error: "Failed to fetch tournament" });
  }
});

export default router;
