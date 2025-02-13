"use client";

import { useState } from "react";
import { DataTable } from "@/components/table/data-table";
import { DetailsDialog } from "@/components/table/details-dialog";
import { BetForm } from "./bet-form";
import type { Column } from "@/components/table/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BetStatusModal } from "./bet-status-modal";

interface Bet extends Record<string, unknown> {
  id: string;
  odds: number;
  market: string;
  bettingHouse: string;
  type: string;
  sport: string;
  stake: number;
  statusResult: "Pending" | "Win" | "Lose" | "Push";
  createdAt: string;
  userId: string;
  moneyRollId?: string;
}

interface MoneyRoll {
  id: string;
  name: string;
  userId: string;
}

interface BetsTableProps {
  bets: Bet[];
  user: {
    id: string;
    email: string;
    name: string;
    organizationId: string;
  };
}

export function BetsTable({ bets, user }: BetsTableProps) {
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Add query for money rolls to display names
  const { data: moneyRolls, isLoading } = useQuery({
    queryKey: ["moneyRolls", user.id],
    queryFn: async () => {
      const response = await fetch(`/api/money-rolls?userId=${user.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch money rolls");
      }
      const data = await response.json();
      console.log("Fetched money rolls:", data); // Debug log
      return data;
    },
    enabled: !!user.id, // Only run query if we have a user ID
    initialData: [], // Provide empty array as initial data
  });

  const handleStatusClick = (bet: Bet) => {
    if (bet.statusResult === "Pending") {
      setSelectedBet(bet);
      setIsStatusModalOpen(true);
    }
  };

  const handleStatusUpdate = async (status: "Win" | "Lose" | "Push") => {
    if (!selectedBet) return;

    const response = await fetch(`/api/bets`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: selectedBet.id,
        statusResult: status,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update bet status");
    }

    // Invalidate both analytics and bets queries
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["analytics"] }),
      queryClient.invalidateQueries({ queryKey: ["bets"] })
    ]);
  };

  const columns: Column<Bet>[] = [
    {
      id: "date",
      header: "Date",
      accessorKey: "createdAt",
      cell: ({ row }) => new Date(row.createdAt).toLocaleDateString(),
      sortable: true,
    },
    {
      id: "market",
      header: "Market",
      accessorKey: "market",
      sortable: true,
    },
    {
      id: "sport",
      header: "Sport",
      accessorKey: "sport",
      sortable: true,
    },
    {
      id: "type",
      header: "Type",
      accessorKey: "type",
      sortable: true,
    },
    {
      id: "odds",
      header: "Odds",
      accessorKey: "odds",
      cell: ({ row }) => row.odds.toFixed(2),
      sortable: true,
    },
    {
      id: "stake",
      header: "Stake",
      accessorKey: "stake",
      cell: ({ row }) => row.stake.toFixed(2),
      sortable: true,
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "statusResult",
      cell: ({ row }) => (
        <span
          className={`
            px-2 py-1 rounded-md font-medium text-sm
            cursor-pointer transition-colors
            hover:opacity-80 
            ${
              row.statusResult === "Win"
                ? "bg-green-100 text-green-700"
                : row.statusResult === "Lose"
                ? "bg-red-100 text-red-700"
                : row.statusResult === "Push"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-blue-100 text-blue-700"
            }
            ${row.statusResult === "Pending" ? "hover:bg-blue-200" : ""}
          `}
          onClick={() => handleStatusClick(row)}
          title={row.statusResult === "Pending" ? "Click to update status" : undefined}
        >
          {row.statusResult}
        </span>
      ),
      sortable: true,
    },
    {
      id: "house",
      header: "House",
      accessorKey: "bettingHouse",
      sortable: true,
    },
    {
      id: "moneyRoll",
      header: "Money Roll",
      accessorKey: "moneyRollId",
      cell: ({ row }) => {
        if (row?.original) return "—";
        const bet = row as unknown as Bet;
        if (isLoading) return "Loading...";
        if (!moneyRolls || !bet.moneyRollId) return "—";

        const roll = moneyRolls.find(
          (r: MoneyRoll) => r.id === bet.moneyRollId
        );

        return roll?.name || "—";
      },
      sortable: true,
    },
  ];

  return (
    <>
      <DataTable
        title="Bets"
        description="Manage your bets"
        data={bets}
        columns={columns}
        searchable
        searchField="market"
        defaultSort={{ field: "createdAt", direction: "desc" }}
        onAdd={() => setIsAddDialogOpen(true)}
        onEdit={(bet) => {
          setSelectedBet(bet as Bet);
          setIsEditDialogOpen(true);
        }}
      />

      <DetailsDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        data={selectedBet}
        title="Edit Bet"
        renderDetails={(bet) => (
          <BetForm
            user={user}
            bet={bet as Bet}
            onClose={() => setIsEditDialogOpen(false)}
          />
        )}
      />

      <DetailsDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        data={{}}
        title="Add New Bet"
        renderDetails={() => (
          <BetForm user={user} onClose={() => setIsAddDialogOpen(false)} />
        )}
      />

      <BetStatusModal
        open={isStatusModalOpen}
        onOpenChange={setIsStatusModalOpen}
        bet={selectedBet}
        onStatusUpdate={handleStatusUpdate}
      />
    </>
  );
}
