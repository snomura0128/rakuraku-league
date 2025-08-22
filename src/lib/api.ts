/**
 * API client for Worker endpoints
 */

const getApiBaseUrl = () => {
	// Check if we're in the browser
	if (typeof window !== "undefined") {
		// URLベースで環境を判定
		const hostname = window.location.hostname;

		if (hostname === "localhost") {
			return "http://localhost:8787";
		} else if (hostname.includes("rakuraku-league-dev.pages.dev")) {
			return "https://rakuraku-league-api.tomra-3104.workers.dev";
		} else if (hostname === "rakuraku-league.com") {
			return "https://rakuraku-league-api-prod.tomra-3104.workers.dev";
		}

		// フォールバック
		return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";
	}
	// Server-side fallback
	return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";
};

export const apiClient = {
	async post(endpoint: string, data: any) {
		const baseUrl = getApiBaseUrl();
		const response = await fetch(`${baseUrl}${endpoint}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});
		return response;
	},

	async get(endpoint: string) {
		const baseUrl = getApiBaseUrl();
		const response = await fetch(`${baseUrl}${endpoint}`);
		return response;
	},

	async patch(endpoint: string, data: any) {
		const baseUrl = getApiBaseUrl();
		const response = await fetch(`${baseUrl}${endpoint}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});
		return response;
	},
};

export default apiClient;
