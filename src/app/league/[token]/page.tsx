"use client";

export const runtime = "edge";

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
import { apiClient } from "@/lib/api";
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
				const response = await apiClient.get(`/api/leagues/${params.token}`);

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
			const response = await apiClient.patch(
				`/api/leagues/${params.token}/matches`,
				{
					matchId,
					status,
					winnerId,
					setsWonPlayer1,
					setsWonPlayer2,
					tableId,
				},
			);

			if (!response.ok) {
				throw new Error("試合の更新に失敗しました");
			}

			// リーグデータを再取得
			const leagueResponse = await apiClient.get(
				`/api/leagues/${params.token}`,
			);
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
									<Trophy className="h-4 w-4" />
									<span>{formatMatchFormat(league.match_format)}</span>
								</div>
								<div className="flex items-center gap-1 text-muted-foreground">
									<Users className="h-4 w-4" />
									<span>{league.players.length}名</span>
								</div>
								<div className="flex items-center gap-1 text-muted-foreground">
									<TableIcon className="h-4 w-4" />
									<span>{league.table_count}台</span>
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

			<div className="container mx-auto px-2 py-6">
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
						<MobileMatchCards
							players={league.players}
							matches={league.matches}
							isAdmin={league.is_admin}
							tables={league.tables}
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

	const [cellSizes, setCellSizes] = useState({
		leftCol: 100,
		cellCol: 80,
		cellHeight: 80,
		fontSize: "text-sm",
		padding: "p-2",
	});

	useEffect(() => {
		const updateSizes = () => {
			const isMobile = window.innerWidth < 768;
			setCellSizes({
				leftCol: isMobile ? 80 : 100,
				cellCol: isMobile ? 70 : 80,
				cellHeight: isMobile ? 60 : 80,
				fontSize: isMobile ? "text-xs" : "text-sm",
				padding: isMobile ? "p-1" : "p-2",
			});
		};

		updateSizes();
		window.addEventListener("resize", updateSizes);
		return () => window.removeEventListener("resize", updateSizes);
	}, []);

	return (
		<div className="w-full">
			<div
				className="overflow-auto border rounded-lg mx-auto"
				style={{
					maxHeight: "70vh",
					width: `${cellSizes.leftCol + cellSizes.cellCol * players.length}px`,
					maxWidth: "100%",
				}}
			>
				<table
					className="relative border-collapse table-fixed"
					style={{
						width: `${cellSizes.leftCol + cellSizes.cellCol * players.length}px`,
					}}
				>
					<colgroup>
						<col style={{ width: `${cellSizes.leftCol}px` }} />
						{players.map((player) => (
							<col
								key={player.id}
								style={{ width: `${cellSizes.cellCol}px` }}
							/>
						))}
					</colgroup>
					<thead className="sticky top-0 z-20 bg-white">
						<tr>
							<th
								className={`font-semibold bg-white border-b border-r sticky left-0 z-30 ${cellSizes.padding} text-left min-w-20`}
							></th>
							{players.map((player) => (
								<th
									key={player.id}
									className="text-center min-w-20 bg-white border-b z-20 p-1 font-semibold"
								>
									<div
										className={`px-2 ${cellSizes.fontSize} leading-tight line-clamp-2`}
										title={player.name}
									>
										{player.name}
									</div>
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{players.map((player1) => (
							<tr key={player1.id}>
								<td className="font-semibold bg-white sticky left-0 border-r z-10 min-w-20 p-1">
									<div
										className={`px-2 ${cellSizes.fontSize} leading-tight line-clamp-2`}
										title={player1.name}
									>
										{player1.name}
									</div>
								</td>
								{players.map((player2) => (
									<td key={player2.id} className="p-0.5 text-center">
										{player1.id === player2.id ? (
											<div
												className="w-full bg-muted/50 rounded-lg flex items-center justify-center"
												style={{ height: `${cellSizes.cellHeight}px` }}
											>
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
												cellHeight={cellSizes.cellHeight}
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

// Mobile Card Layout Component
function MobileMatchCards({
	players,
	matches,
	isAdmin,
	tables,
	onMatchClick,
}: {
	players: Player[];
	matches: Match[];
	isAdmin: boolean;
	tables: any[];
	onMatchClick: (match: Match, player1: Player, player2: Player) => void;
}) {
	const [filterStatus, setFilterStatus] = useState<
		"all" | "pending" | "playing" | "completed"
	>("pending");
	const [showPlayableOnly, setShowPlayableOnly] = useState(true);

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

	// 全ての対戦組み合わせを生成
	const allMatches = [];
	for (let i = 0; i < players.length; i++) {
		for (let j = i + 1; j < players.length; j++) {
			const player1 = players[i];
			const player2 = players[j];
			const match = getMatch(player1.id, player2.id);
			if (match) {
				allMatches.push({ match, player1, player2 });
			}
		}
	}

	// フィルター適用
	const filteredMatches = allMatches.filter(({ match, player1, player2 }) => {
		// メインフィルター
		if (filterStatus !== "all" && match.status !== filterStatus) {
			return false;
		}

		// 試合可能フィルター（未対戦時のみ適用）
		if (filterStatus === "pending" && showPlayableOnly) {
			const isDisabled =
				isPlayerInPlayingMatch(player1.id) ||
				isPlayerInPlayingMatch(player2.id);
			if (isDisabled) return false;
		}

		return true;
	});

	return (
		<div className="w-full space-y-4">
			{/* フィルターボタン */}
			<div className="flex flex-wrap gap-2 p-4 py-0">
				{[
					{
						key: "pending" as const,
						label: "未対戦",
						count: allMatches.filter(({ match }) => match.status === "pending")
							.length,
					},
					{
						key: "playing" as const,
						label: "試合中",
						count: allMatches.filter(({ match }) => match.status === "playing")
							.length,
					},
					{
						key: "completed" as const,
						label: "試合終了",
						count: allMatches.filter(
							({ match }) => match.status === "completed",
						).length,
					},
					{ key: "all" as const, label: "全て", count: allMatches.length },
				].map(({ key, label, count }) => (
					<button
						key={key}
						onClick={() => setFilterStatus(key)}
						className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
							filterStatus === key
								? "bg-blue-100 text-blue-700 border border-blue-200"
								: "bg-gray-100 text-gray-600 border border-gray-200"
						}`}
					>
						{label} ({count})
					</button>
				))}
			</div>

			{/* 試合可能フィルター */}
			{filterStatus === "pending" && (
				<div className="px-4 pt-0">
					<div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg border">
						<div className="flex items-center gap-3">
							<span className="text-sm font-medium text-gray-700">
								試合可能な対戦のみ表示
							</span>
							<span className="text-xs text-gray-500">
								(
								{
									allMatches.filter(
										({ match, player1, player2 }) =>
											match.status === "pending" &&
											!isPlayerInPlayingMatch(player1.id) &&
											!isPlayerInPlayingMatch(player2.id),
									).length
								}
								件)
							</span>
						</div>

						{/* トグルスイッチ */}
						<button
							onClick={() => setShowPlayableOnly(!showPlayableOnly)}
							className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
								showPlayableOnly ? "bg-blue-600" : "bg-gray-300"
							}`}
						>
							<span
								className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
									showPlayableOnly ? "translate-x-6" : "translate-x-1"
								}`}
							/>
						</button>
					</div>
				</div>
			)}

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-3 px-4">
				{filteredMatches.map(({ match, player1, player2 }) => {
					const matchKey = `${player1.id}-${player2.id}`;
					const isDisabled =
						isPlayerInPlayingMatch(player1.id) ||
						isPlayerInPlayingMatch(player2.id);
					const isClickable =
						isAdmin && !(match.status === "pending" && isDisabled);

					return (
						<div
							key={matchKey}
							className={`bg-white border rounded-lg p-4 ${
								isClickable
									? "shadow-md cursor-pointer hover:shadow-lg active:shadow-inner active:transform active:scale-95 transition-all duration-150"
									: "shadow-sm"
							}`}
							onClick={() => {
								if (isClickable) {
									onMatchClick(match, player1, player2);
								}
							}}
						>
							<div className="flex items-center justify-between mb-3">
								<div className="flex items-center space-x-3">
									<span className="font-medium text-base" title={player1.name}>
										{player1.name}
									</span>
									<span className="text-gray-400 text-sm">vs</span>
									<span className="font-medium text-base" title={player2.name}>
										{player2.name}
									</span>
								</div>

								{/* 状態バッジ */}
								<div className="flex items-center">
									{match.status === "completed" && match.winner_id && (
										<div className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
											試合終了
										</div>
									)}
									{match.status === "playing" && (
										<div className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full">
											試合中
										</div>
									)}
									{match.status === "pending" && (
										<div className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
											{isDisabled ? "試合不可" : "未対戦"}
										</div>
									)}
								</div>
							</div>

							{/* 試合結果または状態表示 */}
							<div className="flex items-center justify-center py-3">
								{match.status === "completed" && match.winner_id ? (
									<div className="text-center">
										<div className="text-lg font-bold text-gray-800">
											{match.sets_won_player1} - {match.sets_won_player2}
										</div>
										<div className="text-sm text-gray-600 mt-1">
											勝者:{" "}
											{match.winner_id === player1.id
												? player1.name
												: player2.name}
										</div>
									</div>
								) : (
									<div className="text-center text-gray-500">
										{match.status === "playing" &&
											(match.table_id
												? `${tables.find((t) => t.id === match.table_id)?.table_number || ""}番台で試合中`
												: "試合中")}
										{match.status === "pending" &&
											(isDisabled
												? "他の試合中のため対戦不可"
												: "タップして試合開始")}
									</div>
								)}
							</div>
						</div>
					);
				})}
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
	cellHeight,
	onMatchClick,
}: {
	match: Match | undefined;
	player1: Player;
	player2: Player;
	isAdmin: boolean;
	isDisabled: boolean;
	cellHeight: number;
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

		const clickableStyle =
			"bg-white shadow-md border-2 transition-all duration-150 cursor-pointer hover:shadow-lg active:shadow-inner active:transform active:scale-95";

		switch (match.status) {
			case "pending":
				return `${clickableStyle} border-slate-200 hover:border-slate-300 text-slate-700`;
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
			className={`w-full rounded-lg p-1 text-xs font-medium ${getStatusStyle()}`}
			style={{ height: `${cellHeight}px` }}
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
