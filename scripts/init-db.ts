import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { join } from "path";

// Read the migration SQL file
const migrationSql = readFileSync(
	join(process.cwd(), "migrations/0000_exotic_lucky_pierre.sql"),
	"utf8",
);

// Initialize database
const db = new Database("./dev.db");

// Run migration
try {
	db.exec(migrationSql);
	console.log("Database initialized successfully!");
} catch (error) {
	console.error("Error initializing database:", error);
} finally {
	db.close();
}
