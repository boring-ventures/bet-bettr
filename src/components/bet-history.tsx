"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"

interface Bet {
  id: string
  odds: number | string
  market: string
  bettingHouse: string
  type: string
  sport: string
  stake: number | string
  statusResult: string
  userId: string
  createdAt: string
  updatedAt: string
  active: boolean
}

interface BetHistoryProps {
  initialBets: Bet[]
  user: {
    id: string
    // ... other user fields
  }
}

export function BetHistory({ initialBets, user }: BetHistoryProps) {
  const {
    data: bets,
    isLoading,
    error,
  } = useQuery<Bet[]>({
    queryKey: ["bets", user.id],
    queryFn: async () => {
      const response = await fetch(`/api/bets?userId=${user.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch bets");
      }
      return response.json();
    },
    initialData: initialBets,
  });

  if (isLoading) {
    return <div>Loading bets...</div>;
  }

  if (error) {
    return <div>Error loading bets: {(error as Error).message}</div>;
  }

  if (!bets?.length) {
    return <div>No bets found</div>;
  }

  const formatNumber = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  return (
    <div className="space-y-4">
      {bets.map((bet) => (
        <Card key={bet.id}>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="font-semibold">Market</p>
                <p>{bet.market}</p>
              </div>
              <div>
                <p className="font-semibold">Odds</p>
                <p>{formatNumber(bet.odds)}</p>
              </div>
              <div>
                <p className="font-semibold">Stake</p>
                <p>{formatNumber(bet.stake)}</p>
              </div>
              <div>
                <p className="font-semibold">Status</p>
                <p>{bet.statusResult}</p>
              </div>
              <div>
                <p className="font-semibold">Sport</p>
                <p>{bet.sport}</p>
              </div>
              <div>
                <p className="font-semibold">Betting House</p>
                <p>{bet.bettingHouse}</p>
              </div>
              <div>
                <p className="font-semibold">Date</p>
                <p>{new Date(bet.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="font-semibold">Type</p>
                <p>{bet.type}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

