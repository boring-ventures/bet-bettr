"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const moneyRoleSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type MoneyRoleFormData = z.infer<typeof moneyRoleSchema>;

interface MoneyRoleFormProps {
  user: {
    id: string;
    email: string;
    name: string;
    organizationId: string;
  };
  moneyRole?: MoneyRoleFormData & { id: string };
  onClose: () => void;
}

export function MoneyRoleForm({
  user,
  moneyRole,
  onClose,
}: MoneyRoleFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MoneyRoleFormData>({
    resolver: zodResolver(moneyRoleSchema),
    defaultValues: moneyRole || {
      name: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMoneyRole = useMutation({
    mutationFn: async (data: MoneyRoleFormData) => {
      const newRole = {
        id: moneyRole?.id || uuidv4(),
        ...data,
        userId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        active: true,
      };

      const response = await fetch("/api/money-roles", {
        method: moneyRole ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newRole),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to ${moneyRole ? "update" : "create"} money role`
        );
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moneyRoles"] });
      toast({
        title: `Money role ${moneyRole ? "updated" : "created"} successfully`,
      });
      reset();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: `Error ${moneyRole ? "updating" : "creating"} money role`,
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: MoneyRoleFormData) => {
    try {
      setLoading(true);
      await createMoneyRole.mutateAsync(data);
    } catch (error) {
      console.error("Error submitting money role:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input placeholder="Role Name" {...register("name")} />
      {errors.name && <p className="text-red-500">{errors.name.message}</p>}

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : moneyRole ? "Update Role" : "Add Role"}
        </Button>
      </div>
    </form>
  );
}
