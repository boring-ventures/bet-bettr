"use client";

import { useState } from "react";
import { DataTable } from "@/components/table/data-table";
import { DetailsDialog } from "@/components/table/details-dialog";
import { BetForm } from "./bet-form";
import type { Column } from "@/components/table/types";

interface Bet extends Record<string, unknown> {
  id: string;
  odds: number;
  market: string;
  bettingHouse: string;
  type: string;
  sport: string;
  stake: number;
  statusResult: "Pending" | "Win" | "Lose";
  createdAt: string;
  userId: string;
  moneyRollId?: string;
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
      sortable: true,
    },
    {
      id: "house",
      header: "House",
      accessorKey: "bettingHouse",
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
            bet={bet}
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
    </>
  );
}
