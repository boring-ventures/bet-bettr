"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { v4 as uuidv4 } from "uuid"
import { betSchema, type BetFormData } from "@/lib/schemas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Dialog } from "@/components/ui/dialog"
import { Controller } from "react-hook-form"

interface BetFormProps {
  user: {
    id: string;
    email: string;
    name: string;
    organizationId: string;
  };
  bet?: BetFormData & { id: string }; // For editing existing bets
  onClose: () => void;
}

export function BetForm({ user, bet, onClose }: BetFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BetFormData>({
    resolver: zodResolver(betSchema),
    defaultValues: bet || {
      odds: 0,
      market: "",
      bettingHouse: "",
      type: "",
      sport: "",
      stake: 0,
    },
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createBet = useMutation({
    mutationFn: async (data: BetFormData) => {
      const newBet = {
        id: bet?.id || uuidv4(),
        ...data,
        userId: user.id,
        statusResult: bet?.statusResult || "Pending",
        createdAt: bet?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        active: true,
        moneyRollId: data.moneyRollId === "none" ? null : data.moneyRollId,
      };

      const response = await fetch("/api/bets", {
        method: bet ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBet),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${bet ? "update" : "create"} bet`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bets"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast({ title: `Bet ${bet ? "updated" : "created"} successfully` });
      reset();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: `Error ${bet ? "updating" : "creating"} bet`,
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add query for money rolls
  const { data: moneyRolls } = useQuery({
    queryKey: ["moneyRolls", user.id],
    queryFn: async () => {
      const response = await fetch(`/api/money-rolls?userId=${user.id}`);
      if (!response.ok) throw new Error("Failed to fetch money rolls");
      return response.json();
    },
  });

  const onSubmit = async (data: BetFormData) => {
    try {
      setLoading(true);
      await createBet.mutateAsync(data);
    } catch (error) {
      console.error("Error submitting bet:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        type="number"
        step="0.01"
        placeholder="Odds"
        {...register("odds", { valueAsNumber: true })}
      />
      {errors.odds && <p className="text-red-500">{errors.odds.message}</p>}

      <Input placeholder="Market" {...register("market")} />
      {errors.market && <p className="text-red-500">{errors.market.message}</p>}

      <Input placeholder="Betting House" {...register("bettingHouse")} />
      {errors.bettingHouse && (
        <p className="text-red-500">{errors.bettingHouse.message}</p>
      )}

      <Controller
        name="type"
        control={control}
        render={({ field }) => (
          <Select onValueChange={field.onChange} value={field.value}>
            <SelectTrigger>
              <SelectValue placeholder="Select bet type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Simple">Simple</SelectItem>
              <SelectItem value="Combined">Combined</SelectItem>
            </SelectContent>
          </Select>
        )}
      />
      {errors.type && <p className="text-red-500">{errors.type.message}</p>}

      <Input placeholder="Sport" {...register("sport")} />
      {errors.sport && <p className="text-red-500">{errors.sport.message}</p>}

      <Input
        type="number"
        step="0.01"
        placeholder="Stake"
        {...register("stake", { valueAsNumber: true })}
      />
      {errors.stake && <p className="text-red-500">{errors.stake.message}</p>}

      <Controller
        name="moneyRollId"
        control={control}
        render={({ field }) => (
          <Select onValueChange={field.onChange} value={field.value || undefined}>
            <SelectTrigger>
              <SelectValue placeholder="Select money roll" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No money roll</SelectItem>
              {moneyRolls?.map((roll: MoneyRoll) => (
                <SelectItem key={roll.id} value={roll.id}>
                  {roll.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {errors.moneyRollId && <p className="text-red-500">{errors.moneyRollId.message}</p>}

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Bet"}
        </Button>
      </div>
    </form>
  );
} 