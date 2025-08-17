// Match format types
export type MatchFormat = "1_game" | "3_game" | "5_game";

// Set score type
export interface SetScore {
	p1_score: number;
	p2_score: number;
}

// League types
export interface League {
	id: string;
	admin_token: string;
	view_token: string;
	name: string;
	description?: string;
	table_count: number;
	match_format: MatchFormat;
	created_at: string;
	updated_at: string;
}

// Player types
export interface Player {
	id: string;
	league_id: string;
	name: string;
	created_at: string;
}

// Table types
export interface Table {
	id: string;
	league_id: string;
	table_number: number;
	status: "available" | "occupied";
	current_match_id?: string;
	created_at: string;
	updated_at: string;
}

// Match types
export interface Match {
	id: string;
	league_id: string;
	player1_id: string;
	player2_id: string;
	table_id?: string;
	status: "pending" | "playing" | "completed";
	winner_id?: string;
	sets_data?: SetScore[];
	sets_won_player1: number;
	sets_won_player2: number;
	input_by?: string;
	started_at?: string;
	completed_at?: string;
	created_at: string;
	updated_at: string;
}

// API Response types
export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
}

// League detail type with all related data
export interface LeagueDetail {
	id: string;
	name: string;
	description?: string;
	table_count: number;
	match_format: MatchFormat;
	players: Player[];
	matches: Match[];
	tables: Table[];
	created_at: string;
	updated_at: string;
	is_admin: boolean;
	admin_url?: string;
	view_url?: string;
}

// Standing type for rankings
export interface Standing {
	rank: number;
	player: Player;
	wins: number;
	losses: number;
	matches_played: number;
	win_rate: number;
	sets_won: number;
	sets_lost: number;
}

// Access level type
export type AccessLevel = "admin" | "view";

// Token validation type
export interface TokenValidation {
	league_id: string;
	access_level: AccessLevel;
	is_valid: boolean;
}
