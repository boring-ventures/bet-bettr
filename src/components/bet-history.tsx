"use client"

import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function BetHistory() {
  const {
    data: bets,
    isLoading,
    error,
  } = useQuery(["bets"], async () => {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) throw new Error("User not found")

    const { data, error } = await supabase
      .from("bets")
      .select("*")
      .eq("userId", user.user.id)
      .order("createdAt", { ascending: false })

    if (error) throw error
    return data
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading bets</div>

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Sport</TableHead>
          <TableHead>Market</TableHead>
          <TableHead>Odds</TableHead>
          <TableHead>Stake</TableHead>
          <TableHead>Result</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bets?.map((bet) => (
          <TableRow key={bet.id}>
            <TableCell>{new Date(bet.createdAt).toLocaleDateString()}</TableCell>
            <TableCell>{bet.sport}</TableCell>
            <TableCell>{bet.market}</TableCell>
            <TableCell>{bet.odds}</TableCell>
            <TableCell>{bet.stake}</TableCell>
            <TableCell>{bet.statusResult}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

