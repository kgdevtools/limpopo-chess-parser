// src/services/parserService.ts
import * as XLSX from "xlsx";

export interface TournamentMetadata {
  organizer?: string;
  federation?: string;
  chief_arbiter?: string;
  time_control?: string;
  location?: string;
  rounds?: number | null;
  tournament_type?: string;
  rating_type?: string;
  date?: string;
  average_elo?: number | null;
  average_age?: number | null;
}

export interface PlayerRanking {
  rank: number;
  name?: string;
  federation?: string; // ✅ added
  rating: number | null;
  rounds: any[];
  points: number | null;
  tie_breaks: Record<string, number | null>;
}

export interface TournamentData {
  tournament_metadata: TournamentMetadata;
  player_rankings: PlayerRanking[];
}

export class ParserService {
  private fileName: string;

  constructor(fileName: string) {
    this.fileName = fileName;
  }

  public parse(buffer: Buffer): TournamentData {
    console.log(`[ParserService:parse] File=${this.fileName} Starting parse`);

    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const metadata = this.extractMetadata(rows);
    const playerRankings = this.extractPlayers(rows);

    console.log(`[ParserService:parse] File=${this.fileName} Parsed metadata=`, metadata);
    console.log(`[ParserService:parse] File=${this.fileName} Extracted ${playerRankings.length} players`);

    return {
      tournament_metadata: metadata,
      player_rankings: playerRankings,
    };
  }

  private extractMetadata(rows: any[][]): TournamentMetadata {
    const metadata: TournamentMetadata = {};

    for (const row of rows) {
      if (!row || row.length === 0) continue;
      const cell = this.cleanCell(row[0]);

      if (/organizer/i.test(cell)) metadata.organizer = row[0].split(":").pop()?.trim();
      if (/federation/i.test(cell)) metadata.federation = row[0].split(":").pop()?.trim();
      if (/chief arbiter/i.test(cell)) metadata.chief_arbiter = row[0].split(":").pop()?.trim();
      if (/time control/i.test(cell)) metadata.time_control = row[0].split(":").pop()?.trim();
      if (/location/i.test(cell)) metadata.location = row[0].split(":").pop()?.trim();
      if (/rounds?/i.test(cell)) metadata.rounds = this.parseNumber(row[1]);
      if (/type/i.test(cell)) metadata.tournament_type = row[0].split(":").pop()?.trim();
      if (/rating/i.test(cell)) metadata.rating_type = row[0].split(":").pop()?.trim();
      if (/date/i.test(cell)) metadata.date = row[0].split(":").pop()?.trim();
    }

    metadata.average_elo = null;
    metadata.average_age = null;

    console.log(`[ParserService:extractMetadata] File=${this.fileName} Extracted metadata=`, metadata);
    return metadata;
  }

  private extractPlayers(rows: any[][]): PlayerRanking[] {
    const players: PlayerRanking[] = [];

    // find header row
    const headerIndex = rows.findIndex(
      (row) =>
        row.some((c: any) =>
          /^(rk\.?|rank|pos\.?|position)$/i.test(this.cleanCell(c))
        ) &&
        row.some((c: any) => /name/i.test(this.cleanCell(c))) &&
        row.some((c: any) => /(rtg|elo)/i.test(this.cleanCell(c)))
    );

    if (headerIndex === -1) {
      console.warn(`[ParserService:extractPlayers] File=${this.fileName} No header row found`);
      return players;
    }

    const headers = rows[headerIndex].map((h: any) => this.cleanCell(h));
    console.log(`[ParserService:extractPlayers] File=${this.fileName} Headers=`, headers);

    for (let i = headerIndex + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const rankIdx = headers.findIndex((h) => /^(rk\.?|rank|pos\.?|position)$/i.test(h));
      const nameIdx = headers.findIndex((h) => /name/i.test(h));
      const fedIdx = headers.findIndex((h) => /^fed$/i.test(h)); // ✅ federation column
      const ratingIdx = headers.findIndex((h) => /(rtg|elo)/i.test(h));
      const pointsIdx = headers.findIndex((h) => /pts?/i.test(h));

      const player: PlayerRanking = {
        rank: this.parseNumber(row[rankIdx]) ?? 0,
        name: this.cleanCell(row[nameIdx]),
        federation: fedIdx >= 0 ? this.cleanCell(row[fedIdx]) : undefined, // ✅ FED
        rating: this.parseNumber(row[ratingIdx]),
        rounds: [],
        points: this.parseFloat(row[pointsIdx]) ?? 0,
        tie_breaks: {},
      };

      // parse rounds
      headers.forEach((h, idx) => {
        if (/(\d+\.?rd|\d+\.?round)/i.test(h)) {
          const val = this.cleanCell(row[idx]);
          if (val) player.rounds.push(this.parseRound(val));
        }
      });

      // parse TBs
      headers.forEach((h, idx) => {
        if (/tb\d+/i.test(h)) {
          player.tie_breaks[h.toUpperCase()] = this.parseFloat(row[idx]);
        }
      });

      players.push(player);
    }

    console.log(`[ParserService:extractPlayers] File=${this.fileName} Players parsed count=${players.length}`);
    return players;
  }

  private parseRound(val: string) {
    const clean = this.cleanCell(val);
    if (!clean) return null;

    const match = clean.match(/(\d+)([wb])?([01=+½-])?/i);

    if (!match) {
      return { raw: clean, result: null };
    }

    let result: "win" | "loss" | "draw" | "absent" | "missed" | null = null;

    if (/(\+|1)/.test(match[3] ?? "")) result = "win";
    else if (/(-|0)/.test(match[3] ?? "")) result = "loss";
    else if (/(=|½)/.test(match[3] ?? "")) result = "draw";
    else if (clean === "0") result = "absent";
    else if (clean === "-1") result = "missed";

    return {
      opponent: match[1],
      color: match[2] === "w" ? "white" : match[2] === "b" ? "black" : null,
      result,
      raw: clean,
    };
  }

  private cleanCell(val: any): string {
    return val ? String(val).trim() : "";
  }

  private parseNumber(val: any): number | null {
    const n = parseInt(this.cleanCell(val), 10);
    return isNaN(n) ? null : n;
  }

  private parseFloat(val: any): number | null {
    const n = Number(this.cleanCell(val));
    return isNaN(n) ? null : n;
  }
}
