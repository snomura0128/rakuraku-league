import { eq, or } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { getLocalDb } from "@/lib/db/local";
import { leagues, matches, players, tables } from "@/lib/db/schema";

export async function GET(
	request: NextRequest,
	{ params }: { params: { token: string } },
) {
	try {
		const token = params.token;

		// Get database connection (local for development)
		const db = getLocalDb();

		// Find league by admin_token or view_token
		const leagueResult = await db
			.select()
			.from(leagues)
			.where(or(eq(leagues.admin_token, token), eq(leagues.view_token, token)))
			.limit(1);

		if (leagueResult.length === 0) {
			return NextResponse.json(
				{ success: false, error: "League not found" },
				{ status: 404 },
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
		const baseUrl = request.headers.get("origin") || "http://localhost:3000";
		const adminUrl = `${baseUrl}/league/${league.admin_token}`;
		const viewUrl = `${baseUrl}/league/${league.view_token}`;

		// Calculate standings
		const standings = calculateStandings(leaguePlayers, leagueMatches);

		return NextResponse.json({
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
		return NextResponse.json(
			{ success: false, error: "Internal server error" },
			{ status: 500 },
		);
	}
}

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
			const player1Index = standings.findIndex(
				(s) => s.player.id === match.player1_id,
			);
			const player2Index = standings.findIndex(
				(s) => s.player.id === match.player2_id,
			);

			if (player1Index >= 0) standings[player1Index].matches_played++;
			if (player2Index >= 0) standings[player2Index].matches_played++;

			// Add sets won/lost
			if (player1Index >= 0) {
				standings[player1Index].sets_won += match.sets_won_player1 || 0;
				standings[player1Index].sets_lost += match.sets_won_player2 || 0;
			}
			if (player2Index >= 0) {
				standings[player2Index].sets_won += match.sets_won_player2 || 0;
				standings[player2Index].sets_lost += match.sets_won_player1 || 0;
			}

			if (match.winner_id === match.player1_id) {
				if (player1Index >= 0) standings[player1Index].wins++;
				if (player2Index >= 0) standings[player2Index].losses++;
			} else if (match.winner_id === match.player2_id) {
				if (player2Index >= 0) standings[player2Index].wins++;
				if (player1Index >= 0) standings[player1Index].losses++;
			}
		}
	});

	// Calculate win rates
	standings.forEach((standing) => {
		standing.win_rate =
			standing.matches_played > 0 ? standing.wins / standing.matches_played : 0;
	});

	// Sort by wins (descending), then by set difference (descending), then by win rate (descending)
	standings.sort((a, b) => {
		if (a.wins !== b.wins) return b.wins - a.wins;
		const aSetDiff = a.sets_won - a.sets_lost;
		const bSetDiff = b.sets_won - b.sets_lost;
		if (aSetDiff !== bSetDiff) return bSetDiff - aSetDiff;
		return b.win_rate - a.win_rate;
	});

	// Assign ranks
	standings.forEach((standing, index) => {
		standing.rank = index + 1;
	});

	return standings;
}
