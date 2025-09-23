import { sql } from "drizzle-orm"
import { integer, primaryKey, sqliteTable, text, unique } from "drizzle-orm/sqlite-core"

// Leagues table
export const leagues = sqliteTable("leagues", {
  id: text("id").primaryKey(),
  admin_token: text("admin_token").notNull().unique(),
  view_token: text("view_token").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  table_count: integer("table_count").notNull().default(2),
  match_format: text("match_format").notNull().default("3_game"), // 1_game | 3_game | 5_game
  created_at: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
})

// Players table
export const players = sqliteTable("players", {
  id: text("id").primaryKey(),
  league_id: text("league_id")
    .notNull()
    .references(() => leagues.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  created_at: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
})

// Tables (ping pong tables) table
export const tables = sqliteTable(
  "tables",
  {
    id: text("id").primaryKey(),
    league_id: text("league_id")
      .notNull()
      .references(() => leagues.id, { onDelete: "cascade" }),
    table_number: integer("table_number").notNull(),
    status: text("status").notNull().default("available"), // available | occupied
    current_match_id: text("current_match_id"), // Will reference matches.id when matches table is created
    created_at: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updated_at: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    unique_league_table: unique().on(table.league_id, table.table_number),
  })
)

// Matches table
export const matches = sqliteTable("matches", {
  id: text("id").primaryKey(),
  league_id: text("league_id")
    .notNull()
    .references(() => leagues.id, { onDelete: "cascade" }),
  player1_id: text("player1_id")
    .notNull()
    .references(() => players.id, { onDelete: "cascade" }),
  player2_id: text("player2_id")
    .notNull()
    .references(() => players.id, { onDelete: "cascade" }),
  table_id: text("table_id").references(() => tables.id),
  status: text("status").notNull().default("pending"), // pending | playing | completed
  winner_id: text("winner_id").references(() => players.id),
  sets_data: text("sets_data"), // JSON string for set scores (optional)
  sets_won_player1: integer("sets_won_player1").notNull().default(0),
  sets_won_player2: integer("sets_won_player2").notNull().default(0),
  input_by: text("input_by"),
  started_at: text("started_at"),
  completed_at: text("completed_at"),
  created_at: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
})

// Export types
export type League = typeof leagues.$inferSelect
export type NewLeague = typeof leagues.$inferInsert
export type Player = typeof players.$inferSelect
export type NewPlayer = typeof players.$inferInsert
export type Table = typeof tables.$inferSelect
export type NewTable = typeof tables.$inferInsert
export type Match = typeof matches.$inferSelect
export type NewMatch = typeof matches.$inferInsert
