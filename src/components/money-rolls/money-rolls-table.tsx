"use client";

import { useState } from "react";
import { DataTable } from "@/components/table/data-table";
import { DetailsDialog } from "@/components/table/details-dialog";
import { MoneyRoleForm } from "./money-roll-form";
import type { Column } from "@/components/table/types";

interface MoneyRole extends Record<string, unknown> {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  active: boolean;
}

interface MoneyRolesTableProps {
  moneyRoles: MoneyRole[];
  user: {
    id: string;
    email: string;
    name: string;
    organizationId: string;
  };
}

export function MoneyRolesTable({ moneyRoles, user }: MoneyRolesTableProps) {
  const [selectedRole, setSelectedRole] = useState<MoneyRole | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const columns: Column<MoneyRole>[] = [
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
        data={moneyRoles}
        columns={columns}
        searchable
        searchField="name"
        defaultSort={{ field: "createdAt", direction: "desc" }}
        onAdd={() => setIsAddDialogOpen(true)}
        onEdit={(role) => {
          setSelectedRole(role as MoneyRole);
          setIsEditDialogOpen(true);
        }}
      />

      <DetailsDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        data={selectedRole}
        title="Edit Money Roll"
        renderDetails={(role) => (
          <MoneyRoleForm
            user={user}
            moneyRole={role}
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
          <MoneyRoleForm user={user} onClose={() => setIsAddDialogOpen(false)} />
        )}
      />
    </>
  );
} 