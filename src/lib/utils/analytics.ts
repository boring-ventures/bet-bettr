import { type Bet as PrismaBet } from "@prisma/client"
import { DateRange } from "react-day-picker"

// Extend the Prisma Bet type to include optional moneyRollName
export interface ExtendedBet extends PrismaBet {
  moneyRollName?: string;
}

export interface FilterOptions {
  dateRange: DateRange | undefined
  sport: string
  market: string
  statusResult: string
  moneyRoll: string
}

export function filterBets(bets: ExtendedBet[], filters: FilterOptions): ExtendedBet[] {
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

    const moneyRollMatches =
      filters.moneyRoll === "All Money Rolls" ||
      bet.moneyRollId === filters.moneyRoll

    return dateInRange && sportMatches && marketMatches && statusMatches && moneyRollMatches
  })
}

export function calculateTotalBets(bets: ExtendedBet[]): number {
  return bets.length
}

export function calculateWinRate(bets: ExtendedBet[]): number {
  const completedBets = bets.filter((bet) => bet.statusResult !== "Pending")
  const wins = completedBets.filter((bet) => bet.statusResult === "Win")
  return completedBets.length ? (wins.length / completedBets.length) * 100 : 0
}

export function calculateTotalStake(bets: ExtendedBet[]): number {
  return bets.reduce((total, bet) => total + Number(bet.stake), 0)
}

export function calculateAverageOdds(bets: ExtendedBet[]): number {
  return bets.length
    ? bets.reduce((total, bet) => total + Number(bet.odds), 0) / bets.length
    : 0
}

export function calculateProfitOverTime(bets: ExtendedBet[]): { date: string; profit: number }[] {
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

export function calculateBetDistribution(bets: ExtendedBet[]): { name: string; value: number }[] {
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

export function calculateWinRateByType(bets: ExtendedBet[]): { name: string; winRate: number }[] {
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

export function calculateMarketStats(bets: ExtendedBet[]): { market: string; avgOdds: number }[] {
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