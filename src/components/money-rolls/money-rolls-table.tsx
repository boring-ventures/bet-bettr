"use client";

import { useState } from "react";
import { DataTable } from "@/components/table/data-table";
import { DetailsDialog } from "@/components/table/details-dialog";
import { MoneyRollForm } from "./money-roll-form";
import type { Column } from "@/components/table/types";

interface MoneyRoll extends Record<string, unknown> {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  active: boolean;
}

interface MoneyRollsTableProps {
  moneyRolls: MoneyRoll[];
  user: {
    id: string;
    email: string;
    name: string;
    organizationId: string;
  };
}

export function MoneyRollsTable({ moneyRolls, user }: MoneyRollsTableProps) {
  const [selectedRoll, setSelectedRoll] = useState<MoneyRoll | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const columns: Column<MoneyRoll>[] = [
    {
      id: "name",
      header: "Name",
      accessorKey: "name",
      sortable: true,
    },
    {
      id: "date",
      header: "Created",
      accessorKey: "createdAt",
      cell: ({ row }) => new Date(row.createdAt).toLocaleDateString(),
      sortable: true,
    },
  ];

  return (
    <>
      <DataTable
        title="Money Rolls"
        description="Manage your money rolls"
        data={moneyRolls}
        columns={columns}
        searchable
        searchField="name"
        defaultSort={{ field: "createdAt", direction: "desc" }}
        onAdd={() => setIsAddDialogOpen(true)}
        onEdit={(roll) => {
          setSelectedRoll(roll as MoneyRoll);
          setIsEditDialogOpen(true);
        }}
      />

      <DetailsDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        data={selectedRoll}
        title="Edit Money Roll"
        renderDetails={(roll) => (
          <MoneyRollForm
            user={user}
            moneyRoll={roll}
            onClose={() => setIsEditDialogOpen(false)}
          />
        )}
      />

      <DetailsDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        data={{}}
        title="Add New Money Roll"
        renderDetails={() => (
          <MoneyRollForm user={user} onClose={() => setIsAddDialogOpen(false)} />
        )}
      />
    </>
  );
} 