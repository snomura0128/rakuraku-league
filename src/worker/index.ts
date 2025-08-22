import { Hono } from "hono";
import { cors } from "hono/cors";
import leaguesRoute from "./routes/leagues";

// Environment types
type Bindings = {
	DB: D1Database;
	BASE_URL?: string;
	ENVIRONMENT?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS for all routes
app.use(
	"*",
	cors({
		origin: "*",
		allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
	}),
);

// Health check endpoint
app.get("/health", (c) => {
	return c.json({ status: "ok", message: "Rakuraku League API is running" });
});

// API routes
app.route("/api/leagues", leaguesRoute);

export default app;
