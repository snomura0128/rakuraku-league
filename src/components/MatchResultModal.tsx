"use client";

import { useState } from "react";
import type { Match, MatchFormat, Player, Table } from "@/types";

interface MatchResultModalProps {
	isOpen: boolean;
	onClose: () => void;
	match: Match;
	player1: Player;
	player2: Player;
	tables?: Table[];
	matchFormat: MatchFormat;
	onUpdateMatch: (
		matchId: string,
		status: string,
		winnerId?: string,
		setsWonPlayer1?: number,
		setsWonPlayer2?: number,
		tableId?: string,
	) => Promise<void>;
}

export default function MatchResultModal({
	isOpen,
	onClose,
	match,
	player1,
	player2,
	tables = [],
	matchFormat,
	onUpdateMatch,
}: MatchResultModalProps) {
	const [status, setStatus] = useState(match.status);
	const [winnerId, setWinnerId] = useState(match.winner_id || "");
	const [setsWonPlayer1, setSetsWonPlayer1] = useState(
		match.sets_won_player1 || 0,
	);
	const [setsWonPlayer2, setSetsWonPlayer2] = useState(
		match.sets_won_player2 || 0,
	);
	const [selectedTableId, setSelectedTableId] = useState("");
	const [showTableSelection, setShowTableSelection] = useState(
		match.status === "pending",
	);
	const [selectedScore, setSelectedScore] = useState<string>("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	if (!isOpen) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			await onUpdateMatch(
				match.id,
				status,
				status === "completed" ? winnerId : undefined,
				status === "completed" ? setsWonPlayer1 : undefined,
				status === "completed" ? setsWonPlayer2 : undefined,
			);
			onClose();
		} catch (error) {
			console.error("Error updating match:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleStartMatch = () => {
		setShowTableSelection(true);
	};

	const handleTableSelect = async (tableId: string) => {
		setIsSubmitting(true);
		try {
			await onUpdateMatch(
				match.id,
				"playing",
				undefined,
				undefined,
				undefined,
				tableId,
			);
			onClose();
		} catch (error) {
			console.error("Error starting match:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const availableTables = tables.filter(
		(table) => table.status === "available",
	);

	const getScoreOptions = (format: MatchFormat) => {
		switch (format) {
			case "1_game":
				return [
					{ label: "1-0", player1Sets: 1, player2Sets: 0, winner: player1.id },
					{ label: "0-1", player1Sets: 0, player2Sets: 1, winner: player2.id },
				];
			case "3_game":
				return [
					{ label: "2-0", player1Sets: 2, player2Sets: 0, winner: player1.id },
					{ label: "0-2", player1Sets: 0, player2Sets: 2, winner: player2.id },
					{ label: "2-1", player1Sets: 2, player2Sets: 1, winner: player1.id },
					{ label: "1-2", player1Sets: 1, player2Sets: 2, winner: player2.id },
				];
			case "5_game":
				return [
					{ label: "3-0", player1Sets: 3, player2Sets: 0, winner: player1.id },
					{ label: "0-3", player1Sets: 0, player2Sets: 3, winner: player2.id },
					{ label: "3-1", player1Sets: 3, player2Sets: 1, winner: player1.id },
					{ label: "1-3", player1Sets: 1, player2Sets: 3, winner: player2.id },
					{ label: "3-2", player1Sets: 3, player2Sets: 2, winner: player1.id },
					{ label: "2-3", player1Sets: 2, player2Sets: 3, winner: player2.id },
				];
			default:
				return [];
		}
	};

	const scoreOptions = getScoreOptions(matchFormat);
	const player1Options = scoreOptions.filter(
		(option) => option.winner === player1.id,
	);
	const player2Options = scoreOptions.filter(
		(option) => option.winner === player2.id,
	);

	const handleScoreSelect = (score: (typeof scoreOptions)[0]) => {
		setSelectedScore(score.label);
		setWinnerId(score.winner);
		setSetsWonPlayer1(score.player1Sets);
		setSetsWonPlayer2(score.player2Sets);
	};

	const handleCompleteMatch = async () => {
		if (!selectedScore) return;

		setIsSubmitting(true);
		try {
			await onUpdateMatch(
				match.id,
				"completed",
				winnerId,
				setsWonPlayer1,
				setsWonPlayer2,
			);
			onClose();
		} catch (error) {
			console.error("Error completing match:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleResetMatch = async () => {
		setIsSubmitting(true);
		try {
			await onUpdateMatch(match.id, "pending", "", 0, 0);
			onClose();
		} catch (error) {
			console.error("Error resetting match:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-lg max-w-md w-full p-6">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-lg font-semibold">
						{player1.name} vs {player2.name}
					</h2>
					<button
						onClick={onClose}
						className="text-gray-500 hover:text-gray-700"
					>
						✕
					</button>
				</div>

				{match.status === "pending" && (
					<div className="space-y-4">
						<p className="text-gray-600">使用する台を選択してください</p>
						{availableTables.length > 0 ? (
							<div className="space-y-2 max-h-48 overflow-y-auto">
								{availableTables.map((table) => (
									<button
										key={table.id}
										onClick={() => handleTableSelect(table.id)}
										disabled={isSubmitting}
										className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded border disabled:opacity-50"
									>
										<div className="font-medium">{table.table_number}番台</div>
										<div className="text-sm text-gray-500">空き</div>
									</button>
								))}
							</div>
						) : (
							<div className="text-center py-4 text-gray-500">
								利用可能な台がありません
							</div>
						)}
						<div className="flex gap-2">
							<button
								onClick={onClose}
								className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-50"
							>
								キャンセル
							</button>
						</div>
					</div>
				)}

				{match.status === "playing" && (
					<div className="space-y-4">
						<p className="text-gray-600">試合結果を選択してください</p>
						<div className="space-y-3">
							<div className="text-sm font-medium text-gray-700 mb-3">
								{player1.name} vs {player2.name}
							</div>
							<div className="grid grid-cols-2 gap-4">
								{/* Player1の勝利パターン（左側） */}
								<div className="space-y-2">
									<div className="text-xs font-medium text-gray-600 text-center bg-blue-50 py-1 rounded">
										{player1.name}勝利
									</div>
									{player1Options.map((score) => (
										<button
											key={score.label}
											onClick={() => handleScoreSelect(score)}
											className={`w-full p-3 rounded border text-center font-medium transition-all ${
												selectedScore === score.label
													? "bg-blue-500 text-white border-blue-500"
													: "bg-blue-50 hover:bg-blue-100 border-blue-300"
											}`}
										>
											<div className="text-lg">{score.label}</div>
										</button>
									))}
								</div>

								{/* Player2の勝利パターン（右側） */}
								<div className="space-y-2">
									<div className="text-xs font-medium text-gray-600 text-center bg-green-50 py-1 rounded">
										{player2.name}勝利
									</div>
									{player2Options.map((score) => (
										<button
											key={score.label}
											onClick={() => handleScoreSelect(score)}
											className={`w-full p-3 rounded border text-center font-medium transition-all ${
												selectedScore === score.label
													? "bg-green-500 text-white border-green-500"
													: "bg-green-50 hover:bg-green-100 border-green-300"
											}`}
										>
											<div className="text-lg">{score.label}</div>
										</button>
									))}
								</div>
							</div>
						</div>
						<div className="flex gap-2">
							<button
								onClick={onClose}
								className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-50"
							>
								キャンセル
							</button>
							<button
								onClick={handleCompleteMatch}
								disabled={isSubmitting || !selectedScore}
								className="flex-1 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
							>
								{isSubmitting ? "確定中..." : "確定"}
							</button>
						</div>
					</div>
				)}

				{match.status === "completed" && (
					<div className="space-y-4">
						<div className="bg-gray-50 p-4 rounded-lg">
							<h3 className="font-medium mb-2">現在の試合結果</h3>
							<div className="text-center">
								<div className="text-lg font-semibold">
									{match.winner_id === player1.id ? player1.name : player2.name}{" "}
									の勝利
								</div>
								<div className="text-gray-600 mt-1">
									スコア: {match.sets_won_player1}-{match.sets_won_player2}
								</div>
							</div>
						</div>

						<div className="space-y-3">
							<h3 className="font-medium">試合結果を更新</h3>

							{/* スコア選択UI（試合中と同じ） */}
							<div className="grid grid-cols-2 gap-4">
								{/* Player1の勝利パターン（左側） */}
								<div className="space-y-2">
									<div className="text-xs font-medium text-gray-600 text-center bg-blue-50 py-1 rounded">
										{player1.name}勝利
									</div>
									{player1Options.map((score) => (
										<button
											key={score.label}
											onClick={() => handleScoreSelect(score)}
											className={`w-full p-3 rounded border text-center font-medium transition-all ${
												selectedScore === score.label
													? "bg-blue-500 text-white border-blue-500"
													: "bg-blue-50 hover:bg-blue-100 border-blue-300"
											}`}
										>
											<div className="text-lg">{score.label}</div>
										</button>
									))}
								</div>

								{/* Player2の勝利パターン（右側） */}
								<div className="space-y-2">
									<div className="text-xs font-medium text-gray-600 text-center bg-green-50 py-1 rounded">
										{player2.name}勝利
									</div>
									{player2Options.map((score) => (
										<button
											key={score.label}
											onClick={() => handleScoreSelect(score)}
											className={`w-full p-3 rounded border text-center font-medium transition-all ${
												selectedScore === score.label
													? "bg-green-500 text-white border-green-500"
													: "bg-green-50 hover:bg-green-100 border-green-300"
											}`}
										>
											<div className="text-lg">{score.label}</div>
										</button>
									))}
								</div>
							</div>
						</div>

						<div className="flex gap-2">
							<button
								onClick={onClose}
								className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-50"
							>
								キャンセル
							</button>
							<button
								onClick={handleResetMatch}
								disabled={isSubmitting}
								className="flex-1 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 disabled:opacity-50"
							>
								{isSubmitting ? "取消中..." : "試合取消"}
							</button>
							<button
								onClick={handleCompleteMatch}
								disabled={isSubmitting || !selectedScore}
								className="flex-1 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
							>
								{isSubmitting ? "更新中..." : "結果更新"}
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
