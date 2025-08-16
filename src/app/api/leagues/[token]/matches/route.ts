import { and, eq, or } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { getLocalDb } from "@/lib/db/local";
import { leagues, matches, tables } from "@/lib/db/schema";

export async function PATCH(
	request: NextRequest,
	{ params }: { params: { token: string } },
) {
	try {
		const { token } = params;
		const body = await request.json();
		const {
			matchId,
			status,
			winnerId,
			setsWonPlayer1,
			setsWonPlayer2,
			tableId,
		} = body;

		// Get database connection (local for development)
		const db = getLocalDb();

		// Find league by admin_token or view_token (but only admin can modify matches)
		const leagueResult = await db
			.select()
			.from(leagues)
			.where(eq(leagues.admin_token, token))
			.limit(1);

		if (leagueResult.length === 0) {
			return NextResponse.json(
				{ error: "League not found or insufficient permissions" },
				{ status: 404 },
			);
		}

		const league = leagueResult[0];

		const matchResult = await db
			.select()
			.from(matches)
			.where(eq(matches.id, matchId))
			.limit(1);
		if (matchResult.length === 0) {
			return NextResponse.json({ error: "Match not found" }, { status: 404 });
		}

		const match = matchResult[0];

		if (match.league_id !== league.id) {
			return NextResponse.json(
				{ error: "Match does not belong to this league" },
				{ status: 403 },
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
				return NextResponse.json({ error: "Table not found" }, { status: 404 });
			}

			const table = tableResult[0];
			if (table.status !== "available") {
				return NextResponse.json(
					{ error: "Table is not available" },
					{ status: 400 },
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

		return NextResponse.json({ success: true, data: updatedMatch[0] });
	} catch (error) {
		console.error("Error updating match:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
