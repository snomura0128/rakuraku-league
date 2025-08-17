import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getLocalDb } from "@/lib/db/local";
import { leagues, matches, players, tables } from "@/lib/db/schema";
import { generateId, generateToken } from "@/lib/utils";

// Request validation schema
const createLeagueSchema = z.object({
	name: z.string().min(1).max(100),
	description: z.string().max(500).optional(),
	table_count: z.number().min(1).max(10),
	match_format: z.enum(["1_game", "3_game", "5_game"]),
	participants: z.array(z.string().min(1).max(50)).min(3).max(20),
});

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const validatedData = createLeagueSchema.parse(body);

		// Get database connection (local for development)
		const db = getLocalDb();

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

		// Create participants
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

		// Generate URLs
		const baseUrl = request.headers.get("origin") || "http://localhost:3000";
		const adminUrl = `${baseUrl}/league/${adminToken}`;
		const viewUrl = `${baseUrl}/league/${viewToken}`;

		return NextResponse.json({
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
			return NextResponse.json(
				{ success: false, error: "Invalid input data", details: error.issues },
				{ status: 400 },
			);
		}

		return NextResponse.json(
			{ success: false, error: "Internal server error" },
			{ status: 500 },
		);
	}
}
