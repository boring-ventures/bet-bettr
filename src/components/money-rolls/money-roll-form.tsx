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

const moneyRollSchema = z.object({
  name: z.string().min(1, "Name is required"),
  id: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  active: z.boolean().optional(),
  userId: z.string().optional(),
});

type MoneyRollFormData = z.infer<typeof moneyRollSchema>;

interface MoneyRollFormProps {
  user: {
    id: string;
    email: string;
    name: string;
    organizationId: string;
  };
  moneyRoll?: MoneyRollFormData & { id: string };
  onClose: () => void;
}

export function MoneyRollForm({ user, moneyRoll, onClose }: MoneyRollFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MoneyRollFormData>({
    resolver: zodResolver(moneyRollSchema),
    defaultValues: moneyRoll || {
      name: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMoneyRoll = useMutation({
    mutationFn: async (data: MoneyRollFormData) => {
      const newRoll = {
        id: moneyRoll?.id || uuidv4(),
        ...data,
        userId: user.id,
        createdAt: moneyRoll?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        active: true,
      };

      const response = await fetch("/api/money-rolls", {
        method: moneyRoll ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newRoll),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${moneyRoll ? "update" : "create"} money roll`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moneyRolls", user.id] });
      toast({ title: `Money roll ${moneyRoll ? "updated" : "created"} successfully` });
      reset();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: `Error ${moneyRoll ? "updating" : "creating"} money roll`,
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: MoneyRollFormData) => {
    try {
      setLoading(true);
      await createMoneyRoll.mutateAsync(data);
    } catch (error) {
      console.error("Error submitting money roll:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        placeholder="Role Name"
        {...register("name")}
      />
      {errors.name && <p className="text-red-500">{errors.name.message}</p>}

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : moneyRoll ? "Update Roll" : "Add Roll"}
        </Button>
      </div>
    </form>
  );
} 