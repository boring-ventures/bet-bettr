import { type Bet } from "@prisma/client"
import { DateRange } from "react-day-picker"

export interface FilterOptions {
  dateRange: DateRange | undefined
  sport: string
  market: string
  statusResult: string
}

export function filterBets(bets: Bet[], filters: FilterOptions): Bet[] {
  return bets.filter((bet) => {
    const dateInRange =
      !filters.dateRange?.from ||
      !filters.dateRange?.to ||
      (new Date(bet.createdAt) >= filters.dateRange.from &&
        new Date(bet.createdAt) <= filters.dateRange.to)

    const sportMatches =
      filters.sport === "All Sports" || bet.sport === filters.sport

    const marketMatches =
      filters.market === "All Markets" || bet.market === filters.market

    const statusMatches =
      filters.statusResult === "All Results" ||
      bet.statusResult.toLowerCase() === filters.statusResult.toLowerCase()

    return dateInRange && sportMatches && marketMatches && statusMatches
  })
}

export function calculateTotalBets(bets: Bet[]): number {
  return bets.length
}

export function calculateWinRate(bets: Bet[]): number {
  const completedBets = bets.filter((bet) => bet.statusResult !== "Pending")
  const wins = completedBets.filter((bet) => bet.statusResult === "Win")
  return completedBets.length ? (wins.length / completedBets.length) * 100 : 0
}

export function calculateTotalStake(bets: Bet[]): number {
  return bets.reduce((total, bet) => total + Number(bet.stake), 0)
}

export function calculateAverageOdds(bets: Bet[]): number {
  return bets.length
    ? bets.reduce((total, bet) => total + Number(bet.odds), 0) / bets.length
    : 0
}

export function calculateProfitOverTime(bets: Bet[]): any[] {
  const profitByDate = new Map<string, number>()
  
  bets.forEach((bet) => {
    const date = new Date(bet.createdAt).toISOString().split('T')[0]
    const profit = bet.statusResult === "Win" 
      ? Number(bet.stake) * (Number(bet.odds) - 1)
      : bet.statusResult === "Lose" 
      ? -Number(bet.stake)
      : 0

    profitByDate.set(
      date,
      (profitByDate.get(date) || 0) + profit
    )
  })

  return Array.from(profitByDate.entries()).map(([date, profit]) => ({
    date,
    profit,
  }))
}

export function calculateBetDistribution(bets: Bet[]): any[] {
  const distribution = new Map<string, number>()
  
  bets.forEach((bet) => {
    distribution.set(
      bet.sport,
      (distribution.get(bet.sport) || 0) + 1
    )
  })

  return Array.from(distribution.entries()).map(([name, value]) => ({
    name,
    value,
  }))
}

export function calculateWinRateByType(bets: Bet[]): any[] {
  const winRateByType = new Map<string, { total: number; wins: number }>();
  
  bets.forEach((bet) => {
    const current = winRateByType.get(bet.sport) || { total: 0, wins: 0 };
    if (bet.statusResult !== "Pending") {
      current.total++;
      if (bet.statusResult === "Win") current.wins++;
    }
    winRateByType.set(bet.sport, current);
  });

  return Array.from(winRateByType.entries()).map(([name, stats]) => ({
    name,
    winRate: stats.total ? (stats.wins / stats.total) * 100 : 0,
  }));
}

export function calculateMarketStats(bets: Bet[]): any[] {
  const marketStats = new Map<string, { total: number; oddsSum: number }>();
  
  bets.forEach((bet) => {
    const current = marketStats.get(bet.market) || { total: 0, oddsSum: 0 };
    current.total++;
    current.oddsSum += Number(bet.odds);
    marketStats.set(bet.market, current);
  });

  return Array.from(marketStats.entries()).map(([market, stats]) => ({
    market,
    avgOdds: stats.oddsSum / stats.total,
  }));
} 