'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@/components/ui'
import { formatMatchFormat, formatDate } from '@/lib/utils'
import MatchResultModal from '@/components/MatchResultModal'
import type { LeagueDetail, Match, Player, Standing } from '@/types'

const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

interface LeaguePageProps {
  params: {
    token: string
  }
}

export default function LeaguePage({ params }: LeaguePageProps) {
  const [league, setLeague] = useState<LeagueDetail | null>(null)
  const [standings, setStandings] = useState<Standing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'matrix' | 'standings' | 'matches'>('matrix')
  const [selectedMatch, setSelectedMatch] = useState<{ match: Match; player1: Player; player2: Player } | null>(null)
  
  useEffect(() => {
    async function fetchLeague() {
      try {
        const response = await fetch(`/api/leagues/${params.token}`)
        
        if (!response.ok) {
          throw new Error('リーグ戦が見つかりません')
        }
        
        const result = await response.json()
        
        if (result.success) {
          setLeague(result.data)
          setStandings(result.data.standings || [])
        } else {
          throw new Error(result.error || 'データの取得に失敗しました')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '不明なエラーが発生しました')
      } finally {
        setLoading(false)
      }
    }
    
    fetchLeague()
  }, [params.token])

  const updateMatch = async (
    matchId: string, 
    status: string, 
    winnerId?: string, 
    setsWonPlayer1?: number, 
    setsWonPlayer2?: number,
    tableId?: string
  ) => {
    try {
      const response = await fetch(`/api/leagues/${params.token}/matches`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchId,
          status,
          winnerId,
          setsWonPlayer1,
          setsWonPlayer2,
          tableId,
        }),
      })

      if (!response.ok) {
        throw new Error('試合の更新に失敗しました')
      }

      // リーグデータを再取得
      const leagueResponse = await fetch(`/api/leagues/${params.token}`)
      if (leagueResponse.ok) {
        const result = await leagueResponse.json()
        if (result.success) {
          setLeague(result.data)
          setStandings(result.data.standings || [])
        }
      }
    } catch (error) {
      console.error('Error updating match:', error)
      throw error
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">読み込み中...</p>
        </div>
      </div>
    )
  }
  
  if (error || !league) {
    return (
      <div className="min-h-screen bg-background-secondary flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">エラー</CardTitle>
            <CardDescription>
              {error || 'リーグ戦の情報を取得できませんでした'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/" className="button button-primary">
              ホームに戻る
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <main className="min-h-screen bg-background-secondary">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-border-light">
        <div className="container py-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <Link href="/" className="text-primary hover:text-primary-dark">
                  ← ホーム
                </Link>
                <span className="text-text-tertiary">|</span>
                <span className="text-text-secondary">
                  {league.is_admin ? '管理者モード' : '閲覧モード'}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                {league.name}
              </h1>
              {league.description && (
                <p className="text-text-secondary">{league.description}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm text-text-tertiary">
                <span>台数: {league.table_count}台</span>
                <span>形式: {formatMatchFormat(league.match_format)}</span>
                <span>参加者: {league.players.length}名</span>
                <span>作成: {formatDate(league.created_at)}</span>
              </div>
            </div>
            
            {league.is_admin && (
              <div className="flex gap-2 ml-4">
                <Button variant="outline" size="sm">
                  設定
                </Button>
                <Button size="sm">
                  URL共有
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* Tab Navigation */}
      <nav className="bg-white border-b border-border-light">
        <div className="container">
          <div className="flex space-x-8">
            {[
              { key: 'matrix', label: 'マトリクス表' },
              { key: 'standings', label: '順位表' },
              { key: 'matches', label: '試合一覧' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>
      
      <div className="container py-8">
        {/* Matrix Tab */}
        {activeTab === 'matrix' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">対戦マトリクス</h2>
            <MatchMatrix 
              players={league.players} 
              matches={league.matches}
              isAdmin={league.is_admin}
              onMatchClick={(match, player1, player2) => 
                setSelectedMatch({ match, player1, player2 })
              }
            />
          </div>
        )}
        
        {/* Standings Tab */}
        {activeTab === 'standings' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">順位表</h2>
            <StandingsTable standings={standings} />
          </div>
        )}
        
        {/* Matches Tab */}
        {activeTab === 'matches' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">試合一覧</h2>
            <MatchesList 
              matches={league.matches} 
              players={league.players}
              isAdmin={league.is_admin}
              onMatchClick={(match, player1, player2) => 
                setSelectedMatch({ match, player1, player2 })
              }
            />
          </div>
        )}
        
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
    </main>
  )
}

// Match Matrix Component
function MatchMatrix({ players, matches, isAdmin, onMatchClick }: {
  players: Player[]
  matches: Match[]
  isAdmin: boolean
  onMatchClick: (match: Match, player1: Player, player2: Player) => void
}) {
  const getMatch = (player1Id: string, player2Id: string) => {
    return matches.find(m => 
      (m.player1_id === player1Id && m.player2_id === player2Id) ||
      (m.player1_id === player2Id && m.player2_id === player1Id)
    )
  }

  const isPlayerInPlayingMatch = (playerId: string) => {
    return matches.some(m => 
      m.status === 'playing' && (m.player1_id === playerId || m.player2_id === playerId)
    )
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-3 text-left font-medium text-text-secondary border-b border-r border-border-light">
              対戦表
            </th>
            {players.map(player => (
              <th key={player.id} className="p-3 text-center font-medium text-text-secondary border-b border-r border-border-light min-w-24">
                {player.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {players.map(player1 => (
            <tr key={player1.id}>
              <td className="p-3 font-medium text-text-primary border-b border-r border-border-light bg-background-secondary">
                {player1.name}
              </td>
              {players.map(player2 => (
                <td key={player2.id} className="p-1 border-b border-r border-border-light text-center">
                  {player1.id === player2.id ? (
                    <div className="w-16 h-16 bg-background-tertiary rounded-lg flex items-center justify-center mx-auto">
                      <span className="text-text-tertiary">-</span>
                    </div>
                  ) : (
                    <MatchCell 
                      match={getMatch(player1.id, player2.id)}
                      player1={player1}
                      player2={player2}
                      isAdmin={isAdmin}
                      isDisabled={isPlayerInPlayingMatch(player1.id) || isPlayerInPlayingMatch(player2.id)}
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
  )
}

// Match Cell Component
function MatchCell({ match, player1, player2, isAdmin, isDisabled, onMatchClick }: {
  match: Match | undefined
  player1: Player
  player2: Player
  isAdmin: boolean
  isDisabled: boolean
  onMatchClick: (match: Match, player1: Player, player2: Player) => void
}) {
  if (!match) return null
  
  const getStatusColor = () => {
    if (match.status === 'pending' && isDisabled) {
      return 'bg-gray-300 text-gray-500'
    }
    
    switch (match.status) {
      case 'pending':
        return 'bg-gray-100 hover:bg-gray-200 text-text-secondary'
      case 'playing':
        return 'bg-orange-100 text-orange-800 border-2 border-orange-300'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-text-secondary'
    }
  }
  
  // Lottie animation URLs from LottieFiles
  const checkmarkAnimationUrl = "https://assets-v2.lottiefiles.com/a/a03173b0-4214-11ee-8796-83095fab89a7/RKafY46l2U.json"
  const xMarkAnimationUrl = "https://assets-v2.lottiefiles.com/a/3fd0913a-117d-11ee-b1b1-1f779f0ec675/QuMx3MRUFJ.json"

  const [checkmarkAnimationData, setCheckmarkAnimationData] = useState(null)
  const [xMarkAnimationData, setXMarkAnimationData] = useState(null)

  useEffect(() => {
    // Load animations
    Promise.all([
      import('@/components/circle-only-animation.json').then(module => module.default),
      import('@/components/cross-no-circle.json').then(module => module.default)
    ]).then(([checkmark, xMark]) => {
      setCheckmarkAnimationData(checkmark)
      setXMarkAnimationData(xMark)
    }).catch(console.error)
  }, [])

  const renderCompletedMatch = () => {
    if (match.status !== 'completed' || !match.winner_id) return null
    
    const isPlayer1Winner = match.winner_id === player1.id
    const winnerSets = isPlayer1Winner ? match.sets_won_player1 : match.sets_won_player2
    const loserSets = isPlayer1Winner ? match.sets_won_player2 : match.sets_won_player1
    const animationData = isPlayer1Winner ? checkmarkAnimationData : xMarkAnimationData
    
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-8 h-8 mb-1">
          {animationData && (
            <Lottie 
              animationData={animationData}
              loop={false}
              autoplay={true}
              style={{ width: '100%', height: '100%' }}
            />
          )}
        </div>
        <div className="text-xs font-medium">
          {winnerSets}-{loserSets}
        </div>
      </div>
    )
  }

  const getStatusText = () => {
    if (match.status === 'completed' && match.winner_id) {
      return renderCompletedMatch()
    }
    
    if (match.status === 'playing') {
      return '試合中'
    }
    
    if (match.status === 'pending' && isDisabled) {
      return '待機中'
    }
    
    return '未実施'
  }
  
  const isClickable = isAdmin && !(match.status === 'pending' && isDisabled)

  return (
    <button
      className={`w-16 h-16 rounded-lg transition-all text-xs font-medium whitespace-pre-line ${getStatusColor()} ${
        isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
      }`}
      disabled={!isClickable}
      onClick={() => {
        if (isClickable) {
          onMatchClick(match, player1, player2)
        }
      }}
    >
      {getStatusText()}
    </button>
  )
}

// Standings Table Component
function StandingsTable({ standings }: { standings: Standing[] }) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-light">
                <th className="text-left p-4 font-medium text-text-secondary">順位</th>
                <th className="text-left p-4 font-medium text-text-secondary">参加者</th>
                <th className="text-center p-4 font-medium text-text-secondary">勝数</th>
                <th className="text-center p-4 font-medium text-text-secondary">負数</th>
                <th className="text-center p-4 font-medium text-text-secondary">試合数</th>
                <th className="text-center p-4 font-medium text-text-secondary">得失セット</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((standing, index) => (
                <tr key={standing.player.id} className="border-b border-border-light last:border-b-0">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        standing.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                        standing.rank === 2 ? 'bg-gray-300 text-gray-800' :
                        standing.rank === 3 ? 'bg-orange-400 text-orange-900' :
                        'bg-background-tertiary text-text-secondary'
                      }`}>
                        {standing.rank}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 font-medium text-text-primary">{standing.player.name}</td>
                  <td className="p-4 text-center font-semibold text-green-600">{standing.wins}</td>
                  <td className="p-4 text-center text-text-secondary">{standing.losses}</td>
                  <td className="p-4 text-center text-text-secondary">{standing.matches_played}</td>
                  <td className="p-4 text-center">
                    <span className={`font-medium ${standing.sets_won - standing.sets_lost >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {standing.sets_won >= 0 && standing.sets_lost >= 0 
                        ? `${standing.sets_won > standing.sets_lost ? '+' : ''}${standing.sets_won - standing.sets_lost}` 
                        : '-'
                      }
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

// Matches List Component
function MatchesList({ matches, players, isAdmin, onMatchClick }: {
  matches: Match[]
  players: Player[]
  isAdmin: boolean
  onMatchClick: (match: Match, player1: Player, player2: Player) => void
}) {
  const getPlayerName = (playerId: string) => {
    return players.find(p => p.id === playerId)?.name || '不明'
  }

  const getPlayer = (playerId: string) => {
    return players.find(p => p.id === playerId)
  }

  const isPlayerInPlayingMatch = (playerId: string) => {
    return matches.some(m => 
      m.status === 'playing' && (m.player1_id === playerId || m.player2_id === playerId)
    )
  }
  
  return (
    <div className="space-y-4">
      {matches.map(match => {
        const player1 = getPlayer(match.player1_id)
        const player2 = getPlayer(match.player2_id)
        const isDisabled = match.status === 'pending' && (
          isPlayerInPlayingMatch(match.player1_id) || isPlayerInPlayingMatch(match.player2_id)
        )
        const isClickable = isAdmin && !isDisabled
        
        return (
          <Card 
            key={match.id} 
            className={isClickable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
            onClick={() => {
              if (isClickable && player1 && player2) {
                onMatchClick(match, player1, player2)
              }
            }}
          >
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${
                  match.status === 'completed' ? 'bg-green-500' :
                  match.status === 'playing' ? 'bg-orange-500' :
                  isDisabled ? 'bg-gray-300' : 'bg-gray-300'
                }`} />
                <div>
                  <div className="font-medium">
                    {getPlayerName(match.player1_id)} vs {getPlayerName(match.player2_id)}
                  </div>
                  {match.status === 'completed' && match.winner_id && (
                    <div className="text-sm text-text-secondary">
                      勝者: {getPlayerName(match.winner_id)} ({match.sets_won_player1}-{match.sets_won_player2})
                    </div>
                  )}
                  {isDisabled && (
                    <div className="text-sm text-text-tertiary">
                      いずれかの選手が試合中のため待機中
                    </div>
                  )}
                </div>
              </div>
              <div className="text-sm text-text-secondary">
                {match.status === 'completed' ? '完了' :
                 match.status === 'playing' ? '試合中' : 
                 isDisabled ? '待機中' : '未実施'}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

