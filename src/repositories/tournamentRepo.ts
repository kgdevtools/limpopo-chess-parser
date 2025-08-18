// src/repositories/tournamentRepo.ts
import { supabase } from "../lib/supabaseClient";
import { TournamentData } from "../services/parserService";

export interface SaveTournamentResult {
  tournament_id: string;
  players_inserted: number;
}

export async function saveTournamentNormalized(
  data: TournamentData
): Promise<SaveTournamentResult> {
  console.log("[tournamentRepo] Saving tournament with metadata:", data.tournament_metadata);

  // ✅ Insert into tournaments
  const { data: tournamentRows, error: tournamentError } = await supabase
    .from("tournaments")
    .insert([
      {
        tournament_name: data.tournament_metadata.tournament_name ?? null,
        organizer: data.tournament_metadata.organizer ?? null,
        federation: data.tournament_metadata.federation ?? null,
        tournament_director: data.tournament_metadata.tournament_director ?? null,
        chief_arbiter: data.tournament_metadata.chief_arbiter ?? null,
        deputy_chief_arbiter: data.tournament_metadata.deputy_chief_arbiter ?? null,
        arbiter: data.tournament_metadata.arbiter ?? null,
        time_control: data.tournament_metadata.time_control ?? null,
        rate_of_play: data.tournament_metadata.rate_of_play ?? null,
        location: data.tournament_metadata.location ?? null,
        rounds: data.tournament_metadata.rounds ?? null,
        tournament_type: data.tournament_metadata.tournament_type ?? null,
        rating_calculation: data.tournament_metadata.rating_calculation ?? null,
        date: data.tournament_metadata.date ?? null,
        average_elo: data.tournament_metadata.average_elo ?? null,
        average_age: data.tournament_metadata.average_age ?? null,
        source: data.tournament_metadata.source ?? null,
      },
    ])
    .select("id") // ✅ return UUID id
    .single();

  if (tournamentError || !tournamentRows) {
    console.error("[supabase] Insert tournament error:", tournamentError);
    throw new Error("Failed to insert tournament");
  }

  const tournamentId: string = tournamentRows.id;
  console.log("[tournamentRepo] Inserted tournament id:", tournamentId);

  // ✅ Prepare player rows
  const players = data.player_rankings.map((p) => ({
    tournament_id: tournamentId,
    rank: p.rank,
    name: p.name ?? null,
    federation: p.federation ?? null,
    rating: p.rating,
    points: p.points,
    rounds: p.rounds ? JSON.stringify(p.rounds) : "[]",
    tie_breaks: p.tie_breaks ? JSON.stringify(p.tie_breaks) : "{}",
  }));

  // ✅ Insert players
  const { error: playersError } = await supabase.from("players").insert(players);

  if (playersError) {
    console.error("[supabase] Insert players error:", playersError);
    throw new Error("Failed to insert players");
  }

  console.log("[tournamentRepo] Saved", players.length, "players for tournament", tournamentId);

  // ✅ Return structured object (controller can safely spread this)
  return {
    tournament_id: tournamentId,
    players_inserted: players.length,
  };
}
