"use client";

import {
	Ban,
	Calendar,
	CheckCircle,
	Home,
	Play,
	Settings,
	Share,
	Swords,
	Table as TableIcon,
	Trophy,
	Users,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import MatchResultModal from "@/components/MatchResultModal";
import {
	Badge,
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/components/ui";
import { formatDate, formatMatchFormat } from "@/lib/utils";
import type { LeagueDetail, Match, Player, Standing } from "@/types";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface LeaguePageProps {
	params: {
		token: string;
	};
}

export default function LeaguePage({ params }: LeaguePageProps) {
	const [league, setLeague] = useState<LeagueDetail | null>(null);
	const [standings, setStandings] = useState<Standing[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<
		"matrix" | "standings" | "matches"
	>("matrix");
	const [selectedMatch, setSelectedMatch] = useState<{
		match: Match;
		player1: Player;
		player2: Player;
	} | null>(null);

	const handleShare = async () => {
		const shareData = {
			title: `${league?.name} - らくらくリーグ戦`,
			text: `${league?.name}のリーグ戦をチェックしよう！`,
			url: window.location.href,
		};

		if (navigator.share) {
			await navigator.share(shareData);
		} else {
			// Web Share APIがサポートされていない場合はクリップボードにコピー
			await navigator.clipboard.writeText(window.location.href);
			alert("URLをクリップボードにコピーしました");
		}
	};

	useEffect(() => {
		async function fetchLeague() {
			try {
				const response = await fetch(`/api/leagues/${params.token}`);

				if (!response.ok) {
					throw new Error("リーグ戦が見つかりません");
				}

				const result = await response.json();

				if (result.success) {
					setLeague(result.data);
					setStandings(result.data.standings || []);
				} else {
					throw new Error(result.error || "データの取得に失敗しました");
				}
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "不明なエラーが発生しました",
				);
			} finally {
				setLoading(false);
			}
		}

		fetchLeague();
	}, [params.token]);

	const updateMatch = async (
		matchId: string,
		status: string,
		winnerId?: string,
		setsWonPlayer1?: number,
		setsWonPlayer2?: number,
		tableId?: string,
	) => {
		try {
			const response = await fetch(`/api/leagues/${params.token}/matches`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					matchId,
					status,
					winnerId,
					setsWonPlayer1,
					setsWonPlayer2,
					tableId,
				}),
			});

			if (!response.ok) {
				throw new Error("試合の更新に失敗しました");
			}

			// リーグデータを再取得
			const leagueResponse = await fetch(`/api/leagues/${params.token}`);
			if (leagueResponse.ok) {
				const result = await leagueResponse.json();
				if (result.success) {
					setLeague(result.data);
					setStandings(result.data.standings || []);
				}
			}
		} catch (error) {
			console.error("Error updating match:", error);
			throw error;
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center space-y-4">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
					<p className="text-muted-foreground">読み込み中...</p>
				</div>
			</div>
		);
	}

	if (error || !league) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center p-4">
				<Card className="max-w-md w-full">
					<CardHeader>
						<CardTitle className="text-destructive">
							エラーが発生しました
						</CardTitle>
						<CardDescription>
							{error || "リーグ戦の情報を取得できませんでした"}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button asChild className="w-full">
							<Link href="/">
								<Home className="mr-2 h-4 w-4" />
								ホームに戻る
							</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="border-b bg-background">
				<div className="container mx-auto px-4 py-6">
					<div className="flex items-start justify-between gap-4">
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-3 mb-3">
								<Button
									variant="ghost"
									size="sm"
									asChild
									className="text-muted-foreground hover:text-foreground"
								>
									{/* <Link href="/">
										<Home className="mr-2 h-4 w-4" />
										ホーム
									</Link> */}
								</Button>
								<Badge
									variant={league.is_admin ? "default" : "secondary"}
									className="shrink-0"
								>
									{league.is_admin ? "編集モード" : "閲覧者"}
								</Badge>

								{league.is_admin && (
									<div className="flex gap-2 ml-auto">
										{/* <Button variant="outline" size="sm">
											<Settings className="h-4 w-4 mr-2" />
											設定
										</Button> */}
										<Button size="sm" onClick={handleShare}>
											<Share className="h-4 w-4 mr-2" />
											共有
										</Button>
									</div>
								)}
							</div>

							<div className="space-y-2">
								<h1 className="text-2xl md:text-3xl font-bold tracking-tight truncate">
									{league.name}
								</h1>
								{league.description && (
									<p className="text-muted-foreground text-sm md:text-base">
										{league.description}
									</p>
								)}
							</div>

							<div className="flex items-start sm:items-center sm:gap-4 gap-2 mt-4 text-sm">
								<div className="flex items-center gap-1 text-muted-foreground">
									<TableIcon className="h-4 w-4" />
									<span>{league.table_count}台</span>
								</div>
								<div className="flex items-center gap-1 text-muted-foreground">
									<Trophy className="h-4 w-4" />
									<span>{formatMatchFormat(league.match_format)}</span>
								</div>
								<div className="flex items-center gap-1 text-muted-foreground">
									<Users className="h-4 w-4" />
									<span>{league.players.length}名</span>
								</div>
								<div className="flex items-center gap-1 text-muted-foreground">
									<Calendar className="h-4 w-4" />
									<span>{formatDate(league.created_at)}</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</header>

			<div className="container mx-auto px-4 py-6">
				<Tabs
					value={activeTab}
					onValueChange={(value) => setActiveTab(value as any)}
					className="w-full"
				>
					<TabsList className="grid w-full grid-cols-3 mb-6">
						<TabsTrigger
							value="matrix"
							className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
						>
							対戦表
						</TabsTrigger>
						<TabsTrigger
							value="matches"
							className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
						>
							試合一覧
						</TabsTrigger>
						<TabsTrigger
							value="standings"
							className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
						>
							順位表
						</TabsTrigger>
					</TabsList>

					<TabsContent value="matrix" className="space-y-4">
						<MatchMatrix
							players={league.players}
							matches={league.matches}
							isAdmin={league.is_admin}
							onMatchClick={(match, player1, player2) =>
								setSelectedMatch({ match, player1, player2 })
							}
						/>
					</TabsContent>
					<TabsContent value="matches" className="space-y-4">
						<MatchesList
							matches={league.matches}
							players={league.players}
							isAdmin={league.is_admin}
							onMatchClick={(match, player1, player2) =>
								setSelectedMatch({ match, player1, player2 })
							}
						/>
					</TabsContent>
					<TabsContent value="standings" className="space-y-4">
						<StandingsTable standings={standings} />
					</TabsContent>
				</Tabs>
			</div>

			{/* Match Result Modal */}
			{selectedMatch && (
				<MatchResultModal
					isOpen={true}
					onClose={() => setSelectedMatch(null)}
					match={selectedMatch.match}
					player1={selectedMatch.player1}
					player2={selectedMatch.player2}
					tables={league.tables}
					matchFormat={league.match_format}
					onUpdateMatch={updateMatch}
				/>
			)}
		</div>
	);
}

// Match Matrix Component
function MatchMatrix({
	players,
	matches,
	isAdmin,
	onMatchClick,
}: {
	players: Player[];
	matches: Match[];
	isAdmin: boolean;
	onMatchClick: (match: Match, player1: Player, player2: Player) => void;
}) {
	const getMatch = (player1Id: string, player2Id: string) => {
		return matches.find(
			(m) =>
				(m.player1_id === player1Id && m.player2_id === player2Id) ||
				(m.player1_id === player2Id && m.player2_id === player1Id),
		);
	};

	const isPlayerInPlayingMatch = (playerId: string) => {
		return matches.some(
			(m) =>
				m.status === "playing" &&
				(m.player1_id === playerId || m.player2_id === playerId),
		);
	};

	return (
		<div className="w-full">
			<div
				className="overflow-auto border rounded-lg"
				style={{ maxHeight: "70vh" }}
			>
				<table className="relative w-full border-collapse">
					<thead className="sticky top-0 z-20 bg-white">
						<tr>
							<th className="font-semibold bg-white border-b border-r sticky left-0 z-30 p-3 text-left min-w-20"></th>
							{players.map((player) => (
								<th
									key={player.id}
									className="text-center min-w-20 bg-white border-b z-20 p-3 font-semibold"
								>
									<div className="truncate px-2">{player.name}</div>
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{players.map((player1) => (
							<tr key={player1.id}>
								<td className="font-semibold bg-white sticky left-0 border-r z-10 min-w-20 p-3">
									<div className="truncate px-2">{player1.name}</div>
								</td>
								{players.map((player2) => (
									<td key={player2.id} className="p-0.5 text-center">
										{player1.id === player2.id ? (
											<div className="w-full h-20 bg-muted/50 rounded-lg flex items-center justify-center">
												<span className="text-muted-foreground text-lg">-</span>
											</div>
										) : (
											<MatchCell
												match={getMatch(player1.id, player2.id)}
												player1={player1}
												player2={player2}
												isAdmin={isAdmin}
												isDisabled={
													isPlayerInPlayingMatch(player1.id) ||
													isPlayerInPlayingMatch(player2.id)
												}
												onMatchClick={onMatchClick}
											/>
										)}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

// Match Cell Component
function MatchCell({
	match,
	player1,
	player2,
	isAdmin,
	isDisabled,
	onMatchClick,
}: {
	match: Match | undefined;
	player1: Player;
	player2: Player;
	isAdmin: boolean;
	isDisabled: boolean;
	onMatchClick: (match: Match, player1: Player, player2: Player) => void;
}) {
	const [checkmarkAnimationData, setCheckmarkAnimationData] =
		useState<any>(null);
	const [xMarkAnimationData, setXMarkAnimationData] = useState<any>(null);

	useEffect(() => {
		// Load animations
		Promise.all([
			import("@/components/circle-only-animation.json").then(
				(module) => module.default,
			),
			import("@/components/cross-no-circle.json").then(
				(module) => module.default,
			),
		])
			.then(([checkmark, xMark]) => {
				setCheckmarkAnimationData(checkmark);
				setXMarkAnimationData(xMark);
			})
			.catch(console.error);
	}, []);

	if (!match) return null;

	const getStatusStyle = () => {
		if (match.status === "pending" && isDisabled) {
			return "bg-white border-2 border-gray-200 text-gray-500 cursor-not-allowed opacity-70 transition-all duration-150";
		}

		const clickableStyle = "bg-white shadow-md border-2 transition-all duration-150 cursor-pointer hover:shadow-lg active:shadow-inner active:transform active:scale-95";

		switch (match.status) {
			case "pending":
				return `${clickableStyle} border-blue-200 hover:border-blue-300 text-blue-700`;
			case "playing":
				return `${clickableStyle} border-orange-300 hover:border-orange-400 text-orange-700`;
			case "completed":
				return `${clickableStyle} border-gray-200 hover:border-gray-300 text-gray-600`;
			default:
				return `${clickableStyle} border-gray-200 text-muted-foreground`;
		}
	};

	const renderCompletedMatch = () => {
		if (match.status !== "completed" || !match.winner_id) return null;

		const isPlayer1Winner = match.winner_id === player1.id;
		const winnerSets = isPlayer1Winner
			? match.sets_won_player1
			: match.sets_won_player2;
		const loserSets = isPlayer1Winner
			? match.sets_won_player2
			: match.sets_won_player1;
		const animationData = isPlayer1Winner
			? checkmarkAnimationData
			: xMarkAnimationData;

		return (
			<div className="flex flex-col items-center justify-center h-full">
				<div className="w-8 h-8 mb-1">
					{animationData && (
						<Lottie
							animationData={animationData}
							loop={false}
							autoplay={true}
							style={{ width: "100%", height: "100%" }}
						/>
					)}
				</div>
				<div className="text-xs font-medium">
					{winnerSets}-{loserSets}
				</div>
			</div>
		);
	};

	const getStatusContent = () => {
		if (match.status === "completed" && match.winner_id) {
			return renderCompletedMatch();
		}

		if (match.status === "playing") {
			return (
				<div className="flex flex-col items-center justify-center gap-1">
					<Swords className="h-4 w-4" />
					<div className="text-xs font-medium">試合中</div>
				</div>
			);
		}

		if (match.status === "pending" && isDisabled) {
			return (
				<div className="flex flex-col items-center justify-center gap-1">
					<Ban className="h-4 w-4" />
					<div className="text-xs font-medium">試合不可</div>
				</div>
			);
		}

		if (match.status === "pending") {
			return (
				<div className="flex flex-col items-center justify-center gap-1">
					<div className="text-xs font-medium">未対戦</div>
				</div>
			);
		}

		return (
			<div className="flex items-center justify-center">
				<Play className="h-4 w-4" />
			</div>
		);
	};

	const isClickable = isAdmin && !(match.status === "pending" && isDisabled);

	return (
		<Button
			variant="ghost"
			size="sm"
			className={`w-full h-20 rounded-lg p-1 text-xs font-medium ${getStatusStyle()}`}
			disabled={!isClickable}
			onClick={() => {
				if (isClickable) {
					onMatchClick(match, player1, player2);
				}
			}}
		>
			{getStatusContent()}
		</Button>
	);
}

// Standings Table Component
function StandingsTable({ standings }: { standings: Standing[] }) {
	return (
		<Card>
			<CardContent className="p-0">
				<div className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>順位</TableHead>
								<TableHead>参加者</TableHead>
								<TableHead className="text-center">勝数</TableHead>
								<TableHead className="text-center">負数</TableHead>
								<TableHead className="text-center">試合数</TableHead>
								<TableHead className="text-center">得失ゲーム</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{standings.map((standing) => (
								<TableRow key={standing.player.id}>
									<TableCell>
										<div className="flex items-center gap-2">
											<Badge
												className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
													standing.rank === 1
														? "bg-yellow-400 text-yellow-900 hover:bg-yellow-400"
														: standing.rank === 2
															? "bg-gray-300 text-gray-800 hover:bg-gray-300"
															: standing.rank === 3
																? "bg-orange-400 text-orange-900 hover:bg-orange-400"
																: "bg-muted text-muted-foreground hover:bg-muted"
												}`}
											>
												{standing.rank}
											</Badge>
										</div>
									</TableCell>
									<TableCell className="font-medium">
										{standing.player.name}
									</TableCell>
									<TableCell className="text-center font-semibold text-green-600">
										{standing.wins}
									</TableCell>
									<TableCell className="text-center text-muted-foreground">
										{standing.losses}
									</TableCell>
									<TableCell className="text-center text-muted-foreground">
										{standing.matches_played}
									</TableCell>
									<TableCell className="text-center">
										<span
											className={`font-medium ${standing.sets_won - standing.sets_lost >= 0 ? "text-green-600" : "text-red-600"}`}
										>
											{standing.sets_won >= 0 && standing.sets_lost >= 0
												? `${standing.sets_won > standing.sets_lost ? "+" : ""}${standing.sets_won - standing.sets_lost}`
												: "-"}
										</span>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</CardContent>
		</Card>
	);
}

// Matches List Component
function MatchesList({
	matches,
	players,
	isAdmin,
	onMatchClick,
}: {
	matches: Match[];
	players: Player[];
	isAdmin: boolean;
	onMatchClick: (match: Match, player1: Player, player2: Player) => void;
}) {
	const getPlayerName = (playerId: string) => {
		return players.find((p) => p.id === playerId)?.name || "不明";
	};

	const getPlayer = (playerId: string) => {
		return players.find((p) => p.id === playerId);
	};

	const isPlayerInPlayingMatch = (playerId: string) => {
		return matches.some(
			(m) =>
				m.status === "playing" &&
				(m.player1_id === playerId || m.player2_id === playerId),
		);
	};

	const getStatusIcon = (status: string, isDisabled: boolean) => {
		if (status === "completed")
			return <CheckCircle className="h-4 w-4 text-green-600" />;
		if (status === "playing")
			return <Swords className="h-4 w-4 text-orange-600" />;
		if (isDisabled) return <Ban className="h-4 w-4 text-gray-500" />;
		if (status === "pending") return null;
		return <Play className="h-4 w-4 text-blue-600" />;
	};

	const getStatusBadge = (status: string, isDisabled: boolean) => {
		if (status === "completed")
			return (
				<Badge className="bg-green-100 text-green-800 hover:bg-green-100">
					完了
				</Badge>
			);
		if (status === "playing")
			return (
				<Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
					試合中
				</Badge>
			);
		if (isDisabled) return <Badge variant="secondary">待機中</Badge>;
		return <Badge variant="outline">未対戦</Badge>;
	};

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
			{matches.map((match) => {
				const player1 = getPlayer(match.player1_id);
				const player2 = getPlayer(match.player2_id);
				const isDisabled =
					match.status === "pending" &&
					(isPlayerInPlayingMatch(match.player1_id) ||
						isPlayerInPlayingMatch(match.player2_id));
				const isClickable = isAdmin && !isDisabled;

				// Get border and text color based on status
				const getCardStyle = () => {
					if (match.status === "pending" && isDisabled) {
						return "border-gray-200";
					}
					switch (match.status) {
						case "pending":
							return "border-blue-200";
						case "playing":
							return "border-orange-300";
						case "completed":
							return "border-gray-200";
						default:
							return "border-gray-200";
					}
				};

				const getTextColor = () => {
					if (match.status === "pending" && isDisabled) {
						return "text-gray-500";
					}
					switch (match.status) {
						case "pending":
							return "text-blue-700";
						case "playing":
							return "text-orange-700";
						case "completed":
							return "text-gray-600";
						default:
							return "text-gray-500";
					}
				};

				return (
					<Card
						key={match.id}
						className={`${isClickable ? "cursor-pointer hover:shadow-lg active:shadow-inner active:transform active:scale-95 transition-all duration-150" : ""} border-2 ${getCardStyle()}`}
						onClick={() => {
							if (isClickable && player1 && player2) {
								onMatchClick(match, player1, player2);
							}
						}}
					>
						<CardContent className="p-4 h-20">
							<div className="flex items-center gap-3 h-full">
								<div className="flex flex-col items-center justify-center gap-1 min-w-16">
									{getStatusIcon(match.status, isDisabled)}
									<div className={`text-xs text-center font-medium ${getTextColor()}`}>
										{match.status === "completed" && "試合終了"}
										{match.status === "playing" && "試合中"}
										{match.status === "pending" && !isDisabled && "未対戦"}
										{match.status === "pending" && isDisabled && "試合不可"}
									</div>
								</div>
								<div className="flex-1 min-w-0">
									<div className="font-medium truncate">
										{getPlayerName(match.player1_id)} vs{" "}
										{getPlayerName(match.player2_id)}
									</div>
									{match.status === "completed" && match.winner_id && (
										<div className="text-sm text-muted-foreground truncate">
											勝者: {getPlayerName(match.winner_id)} (
											{match.sets_won_player1}-{match.sets_won_player2})
										</div>
									)}
									{isDisabled && (
										<div className="text-sm text-muted-foreground truncate">
											選手が他の試合中のため
										</div>
									)}
								</div>
							</div>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}
