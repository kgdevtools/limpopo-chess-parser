import { Router } from "express";
import { supabase } from "../lib/supabaseClient";

const router = Router();

// GET all tournaments
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("tournaments")
      .select("id, created_at, tournament_name, organizer, federation, location, date")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("[tournaments] fetch error:", err);
    res.status(500).json({ error: "Failed to fetch tournaments" });
  }
});

// GET rankings (average of best 6 TB1 across all tournaments)
router.get("/rankings", async (req, res) => {
  try {
    const rawLimit = String(req.query.limit ?? "50");
    const limit = Math.max(1, parseInt(rawLimit, 10) || 50);

    // Fetch all players with fields needed
    const { data: players, error: pErr } = await supabase
      .from("players")
      .select("tournament_id, name, federation, rating, tie_breaks, created_at");
    if (pErr) throw pErr;

    // Fetch tournaments to map tournament_id → name/date
    const { data: tournaments, error: tErr } = await supabase
      .from("tournaments")
      .select("id, tournament_name, date");
    if (tErr) throw tErr;

    const tMap = new Map<string, { id: string; tournament_name: string | null; date: string | null }>();
    (tournaments || []).forEach((t: any) => tMap.set(t.id, t));

    const normalizeName = (s: string | null) =>
      (s || "")
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9\s.-]/g, "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

    const parseTB1 = (tb: any): number | null => {
      try {
        if (!tb) return null;
        const obj = typeof tb === "string" ? JSON.parse(tb) : tb;
        const v = obj?.TB1;
        const n = typeof v === "string" ? parseFloat(v) : v;
        return Number.isFinite(n) ? (n as number) : null;
      } catch {
        return null;
      }
    };

    type Entry = {
      tournament_id: string;
      tournament_name: string | null;
      date: string | null;
      tb1: number | null;
      rating: number | null;
      federation: string | null;
      created_at: string | null;
    };

    type Group = {
      name: string;
      name_key: string;
      dob: string | null;
      latest_federation: string | null;
      latest_rating: number | null;
      entries: Entry[];
    };

    const groups = new Map<string, Group>();

    for (const row of players || []) {
      const rawName = (row as any).name as string | null;
      const key = normalizeName(rawName);
      if (!key) continue;

      const tournament_id = (row as any).tournament_id as string;
      const tb1 = parseTB1((row as any).tie_breaks);
      const t = tMap.get(tournament_id);

      const entry: Entry = {
        tournament_id,
        tournament_name: t?.tournament_name ?? null,
        date: t?.date ?? null,
        tb1,
        rating: (row as any).rating ?? null,
        federation: (row as any).federation ?? null,
        created_at: (row as any).created_at ?? null,
      };

      let g = groups.get(key);
      if (!g) {
        g = {
          name: rawName || key,
          name_key: key,
          dob: null,
          latest_federation: entry.federation ?? null,
          latest_rating: entry.rating ?? null,
          entries: [],
        };
        groups.set(key, g);
      }

      // Track latest federations/ratings by created_at if present
      const prev = g.entries.length ? g.entries[g.entries.length - 1] : undefined;
      const newer = prev && prev.created_at && entry.created_at
        ? new Date(entry.created_at) > new Date(prev.created_at)
        : true;
      if (newer && rawName) g.name = rawName;
      if (newer && entry.federation != null) g.latest_federation = entry.federation;
      if (newer && entry.rating != null) g.latest_rating = entry.rating;

      g.entries.push(entry);
    }

    const results = Array.from(groups.values()).map((g) => {
      const withTb = g.entries
        .filter((e) => e.tb1 != null && Number.isFinite(e.tb1 as number))
        .sort((a, b) => (b.tb1 as number) - (a.tb1 as number));

      const used = withTb.slice(0, 6);
      const avg = used.length > 0
        ? used.reduce((sum, e) => sum + (e.tb1 as number), 0) / used.length
        : null;

      const tournaments_used = used.map((e) => ({
        tournament_id: e.tournament_id,
        tournament_name: e.tournament_name,
        date: e.date,
        tb1: e.tb1,
      }));

      const tournaments_played = g.entries.map((e) => ({
        tournament_id: e.tournament_id,
        tournament_name: e.tournament_name,
        date: e.date,
        tb1: e.tb1,
      }));

      return {
        name: g.name,
        date_of_birth: g.dob,
        federation: g.latest_federation,
        rating: g.latest_rating,
        average_performance: avg,
        tournaments_used,
        tournaments_played,
      };
    });

    results.sort((a, b) => {
      const av = a.average_performance ?? -Infinity;
      const bv = b.average_performance ?? -Infinity;
      return bv - av;
    });

    res.json(results.slice(0, limit));
  } catch (err) {
    console.error("[tournaments] rankings error:", err);
    res.status(500).json({ error: "Failed to compute rankings" });
  }
});

// GET single tournament with players
router.get("/:id", async (req, res) => {
  try {
    const { data: tournament, error: tError } = await supabase
      .from("tournaments")
      .select("id, created_at, tournament_name, organizer, federation, location, date")
      .eq("id", req.params.id)
      .single();

    if (tError) throw tError;

    const { data: players, error: pError } = await supabase
      .from("players")
      .select("rank, name, federation, rating, points")
      .eq("tournament_id", req.params.id)
      .order("rank", { ascending: true });

    if (pError) throw pError;

    res.json({ tournament, players });
  } catch (err) {
    console.error("[tournaments] single fetch error:", err);
    res.status(500).json({ error: "Failed to fetch tournament" });
  }
});

export default router;
