import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { v4 as uuidv4 } from "uuid"
import type { MatchFormat, SetScore } from "@/types"

// Utility for combining class names
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate a unique ID
export function generateId(): string {
  return uuidv4()
}

// Generate a secure random token for URLs
export function generateToken(): string {
  // Generate a URL-safe random token
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
  let result = ""
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Calculate winner based on match format and games won
export function calculateWinner(
  matchFormat: MatchFormat,
  setsWonPlayer1: number,
  setsWonPlayer2: number
): string | null {
  const requiredSets = getRequiredSetsToWin(matchFormat)

  if (setsWonPlayer1 >= requiredSets) {
    return "player1"
  }
  if (setsWonPlayer2 >= requiredSets) {
    return "player2"
  }
  return null
}

// Get required games to win based on match format
export function getRequiredSetsToWin(matchFormat: MatchFormat): number {
  switch (matchFormat) {
    case "1_game":
      return 1
    case "3_game":
      return 2
    case "5_game":
      return 3
    default:
      return 2
  }
}

// Get maximum possible games for a match format
export function getMaxSets(matchFormat: MatchFormat): number {
  switch (matchFormat) {
    case "1_game":
      return 1
    case "3_game":
      return 3
    case "5_game":
      return 5
    default:
      return 3
  }
}

// Validate game scores
export function validateSetScores(scores: SetScore[]): boolean {
  return scores.every((score) => {
    // Basic ping pong rules: one player must reach at least 11, winner must be 2+ points ahead
    const maxScore = Math.max(score.p1_score, score.p2_score)
    const minScore = Math.min(score.p1_score, score.p2_score)

    // Must reach at least 11 points
    if (maxScore < 11) return false

    // Winner must be at least 2 points ahead
    if (maxScore - minScore < 2) return false

    // If score is 11-10 or higher, the difference can only be 2
    if (minScore >= 10 && maxScore - minScore > 2) return false

    return true
  })
}

// Calculate games won from game scores
export function calculateSetsFromScores(scores: SetScore[]): {
  player1Sets: number
  player2Sets: number
} {
  let player1Sets = 0
  let player2Sets = 0

  scores.forEach((score) => {
    if (score.p1_score > score.p2_score) {
      player1Sets++
    } else if (score.p2_score > score.p1_score) {
      player2Sets++
    }
  })

  return { player1Sets, player2Sets }
}

// Format match format for display
export function formatMatchFormat(format: MatchFormat): string {
  switch (format) {
    case "1_game":
      return "1ゲームマッチ"
    case "3_game":
      return "3ゲームマッチ"
    case "5_game":
      return "5ゲームマッチ"
    default:
      return "3ゲームマッチ"
  }
}

// Format date for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}
