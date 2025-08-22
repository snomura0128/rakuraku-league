import { Hono } from 'hono'
import { drizzle } from "drizzle-orm/d1";
import { eq, or } from "drizzle-orm";
import { z } from "zod";
import { leagues, matches, players, tables } from "../db/schema";
import { generateId, generateToken } from "../utils";

type Bindings = {
  DB: D1Database
  BASE_URL?: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Request validation schema
const createLeagueSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  table_count: z.number().min(1).max(10),
  match_format: z.enum(["1_game", "3_game", "5_game"]),
  participants: z.array(z.string().min(1).max(50)).min(3).max(15),
});

// POST /api/leagues - Create a new league
app.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = createLeagueSchema.parse(body);

    // Get database connection
    const db = drizzle(c.env.DB, { schema: { leagues, matches, players, tables } });

    // Generate unique IDs and tokens
    const leagueId = generateId();
    const adminToken = generateToken();
    const viewToken = generateToken();

    // Create league
    await db.insert(leagues).values({
      id: leagueId,
      admin_token: adminToken,
      view_token: viewToken,
      name: validatedData.name,
      description: validatedData.description,
      table_count: validatedData.table_count,
      match_format: validatedData.match_format,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Create players
    const participantIds = validatedData.participants.map(() => generateId());
    await db.insert(players).values(
      validatedData.participants.map((name, index) => ({
        id: participantIds[index],
        league_id: leagueId,
        name,
        created_at: new Date().toISOString(),
      })),
    );

    // Create tables
    const tableIds = Array.from({ length: validatedData.table_count }, () =>
      generateId(),
    );
    await db.insert(tables).values(
      tableIds.map((id, index) => ({
        id,
        league_id: leagueId,
        table_number: index + 1,
        status: "available" as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })),
    );

    // Generate all possible matches (round-robin)
    const matchData = [];
    for (let i = 0; i < participantIds.length; i++) {
      for (let j = i + 1; j < participantIds.length; j++) {
        matchData.push({
          id: generateId(),
          league_id: leagueId,
          player1_id: participantIds[i],
          player2_id: participantIds[j],
          status: "pending" as const,
          sets_won_player1: 0,
          sets_won_player2: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }

    await db.insert(matches).values(matchData);

    // Generate URLs using environment-aware base URL
    const baseUrl = c.env.BASE_URL || c.req.header("origin") || "http://localhost:3000";
    const adminUrl = `${baseUrl}/league/${adminToken}`;
    const viewUrl = `${baseUrl}/league/${viewToken}`;

    return c.json({
      success: true,
      data: {
        league_id: leagueId,
        admin_url: adminUrl,
        view_url: viewUrl,
        admin_token: adminToken,
        view_token: viewToken,
      },
    });
  } catch (error) {
    console.error("Error creating league:", error);

    if (error instanceof z.ZodError) {
      return c.json(
        { success: false, error: "Invalid input data", details: error.issues },
        400,
      );
    }

    return c.json(
      { success: false, error: "Internal server error" },
      500,
    );
  }
});

// GET /api/leagues/:token - Get league details
app.get('/:token', async (c) => {
  try {
    const token = c.req.param('token');

    // Get database connection
    const db = drizzle(c.env.DB, { schema: { leagues, matches, players, tables } });

    // Find league by admin_token or view_token
    const leagueResult = await db
      .select()
      .from(leagues)
      .where(or(eq(leagues.admin_token, token), eq(leagues.view_token, token)))
      .limit(1);

    if (leagueResult.length === 0) {
      return c.json(
        { success: false, error: "League not found" },
        404,
      );
    }

    const league = leagueResult[0];
    const isAdmin = league.admin_token === token;

    // Get players
    const leaguePlayers = await db
      .select()
      .from(players)
      .where(eq(players.league_id, league.id))
      .orderBy(players.created_at);

    // Get tables
    const leagueTables = await db
      .select()
      .from(tables)
      .where(eq(tables.league_id, league.id))
      .orderBy(tables.table_number);

    // Get matches
    const leagueMatches = await db
      .select()
      .from(matches)
      .where(eq(matches.league_id, league.id))
      .orderBy(matches.created_at);

    // Generate URLs
    const baseUrl = c.env.BASE_URL || c.req.header("origin") || "http://localhost:8787";
    const adminUrl = `${baseUrl}/league/${league.admin_token}`;
    const viewUrl = `${baseUrl}/league/${league.view_token}`;

    // Calculate standings
    const standings = calculateStandings(leaguePlayers, leagueMatches);

    return c.json({
      success: true,
      data: {
        id: league.id,
        name: league.name,
        description: league.description,
        table_count: league.table_count,
        match_format: league.match_format,
        players: leaguePlayers,
        matches: leagueMatches,
        tables: leagueTables,
        standings,
        created_at: league.created_at,
        updated_at: league.updated_at,
        is_admin: isAdmin,
        admin_url: isAdmin ? adminUrl : undefined,
        view_url: viewUrl,
      },
    });
  } catch (error) {
    console.error("Error fetching league:", error);
    return c.json(
      { success: false, error: "Internal server error" },
      500,
    );
  }
});

// Helper function to calculate standings
function calculateStandings(players: any[], matches: any[]) {
  const standings = players.map((player) => ({
    rank: 0,
    player,
    wins: 0,
    losses: 0,
    matches_played: 0,
    win_rate: 0,
    sets_won: 0,
    sets_lost: 0,
  }));

  // Count wins/losses and sets for each player
  matches.forEach((match) => {
    if (match.status === "completed" && match.winner_id) {
      const player1Standing = standings.find(s => s.player.id === match.player1_id);
      const player2Standing = standings.find(s => s.player.id === match.player2_id);
      
      if (player1Standing && player2Standing) {
        player1Standing.matches_played++;
        player2Standing.matches_played++;
        
        player1Standing.sets_won += match.sets_won_player1 || 0;
        player1Standing.sets_lost += match.sets_won_player2 || 0;
        player2Standing.sets_won += match.sets_won_player2 || 0;
        player2Standing.sets_lost += match.sets_won_player1 || 0;

        if (match.winner_id === match.player1_id) {
          player1Standing.wins++;
          player2Standing.losses++;
        } else {
          player2Standing.wins++;
          player1Standing.losses++;
        }
      }
    }
  });

  // Calculate win rates and assign ranks
  standings.forEach((standing) => {
    standing.win_rate = standing.matches_played > 0 
      ? Math.round((standing.wins / standing.matches_played) * 100) / 100
      : 0;
  });

  // Sort by wins (desc), then by win rate (desc), then by sets won (desc)
  standings.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (b.win_rate !== a.win_rate) return b.win_rate - a.win_rate;
    return b.sets_won - a.sets_won;
  });

  // Assign ranks
  standings.forEach((standing, index) => {
    standing.rank = index + 1;
  });

  return standings;
}

// PATCH /api/leagues/:token/matches - Update match
app.patch('/:token/matches', async (c) => {
  try {
    const token = c.req.param('token');
    const body = await c.req.json();
    const {
      matchId,
      status,
      winnerId,
      setsWonPlayer1,
      setsWonPlayer2,
      tableId,
    } = body;

    // Get database connection
    const db = drizzle(c.env.DB, { schema: { leagues, matches, players, tables } });

    // Find league by admin_token (only admin can modify matches)
    const leagueResult = await db
      .select()
      .from(leagues)
      .where(eq(leagues.admin_token, token))
      .limit(1);

    if (leagueResult.length === 0) {
      return c.json(
        { error: "League not found or insufficient permissions" },
        404,
      );
    }

    const league = leagueResult[0];

    const matchResult = await db
      .select()
      .from(matches)
      .where(eq(matches.id, matchId))
      .limit(1);

    if (matchResult.length === 0) {
      return c.json({ error: "Match not found" }, 404);
    }

    const match = matchResult[0];

    if (match.league_id !== league.id) {
      return c.json(
        { error: "Match does not belong to this league" },
        403,
      );
    }

    // Handle table assignment when match starts playing
    if (status === "playing" && tableId) {
      // Check if table is available
      const tableResult = await db
        .select()
        .from(tables)
        .where(eq(tables.id, tableId))
        .limit(1);

      if (tableResult.length === 0) {
        return c.json({ error: "Table not found" }, 404);
      }

      const table = tableResult[0];
      if (table.status !== "available") {
        return c.json(
          { error: "Table is not available" },
          400,
        );
      }

      // Update table status to occupied
      await db
        .update(tables)
        .set({
          status: "occupied",
          current_match_id: matchId,
          updated_at: new Date().toISOString(),
        })
        .where(eq(tables.id, tableId));
    }

    // Free up table when match is completed or cancelled
    if (match.table_id && (status === "completed" || status === "pending")) {
      await db
        .update(tables)
        .set({
          status: "available",
          current_match_id: null,
          updated_at: new Date().toISOString(),
        })
        .where(eq(tables.id, match.table_id));
    }

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    // Add winner and scores only if match is completed
    if (status === "completed") {
      updateData.winner_id = winnerId;
      updateData.sets_won_player1 = setsWonPlayer1 || 0;
      updateData.sets_won_player2 = setsWonPlayer2 || 0;
      updateData.completed_at = new Date().toISOString();
    } else if (status === "pending") {
      // Clear winner and scores when resetting to pending
      updateData.winner_id = null;
      updateData.sets_won_player1 = 0;
      updateData.sets_won_player2 = 0;
      updateData.completed_at = null;
      updateData.started_at = null;
      updateData.table_id = null;
    }

    // Add table assignment if provided
    if (tableId) {
      updateData.table_id = tableId;
      updateData.started_at = new Date().toISOString();
    }

    const updatedMatch = await db
      .update(matches)
      .set(updateData)
      .where(eq(matches.id, matchId))
      .returning();

    return c.json({ success: true, data: updatedMatch[0] });
  } catch (error) {
    console.error("Error updating match:", error);
    return c.json(
      { error: "Internal server error" },
      500,
    );
  }
});

export default app