"use client"

import { useQuery } from "@tanstack/react-query"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent } from "@/components/ui/card"

interface Bet {
  id: string
  odds: number
  market: string
  bettingHouse: string
  type: string
  sport: string
  stake: number
  statusResult: string
  userId: string
  createdAt: string
  updatedAt: string
  active: boolean
}

export function BetHistory() {
  const supabase = createClientComponentClient();

  const {
    data: bets,
    isLoading,
    error,
  } = useQuery<Bet[]>({
    queryKey: ["bets"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not found");

      const { data, error } = await supabase
        .from("Bet")
        .select("*")
        .eq("userId", user.user.id)
        .order("createdAt", { ascending: false });

      if (error) throw error;
      return data;
    },
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
                <p>{bet.odds.toFixed(2)}</p>
              </div>
              <div>
                <p className="font-semibold">Stake</p>
                <p>{bet.stake.toFixed(2)}</p>
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

