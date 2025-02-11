"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { betSchema, type BetFormData } from "@/lib/schemas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { v4 as uuidv4 } from "uuid";

interface BetFormProps {
  user: {
    id: string;
    email: string;
    name: string;
    organizationId: string;
    // ... other user fields
  };
}

export function BetForm({ user }: BetFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BetFormData>({
    resolver: zodResolver(betSchema),
    defaultValues: {
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
  const supabase = createClientComponentClient();

  const createBet = useMutation({
    mutationFn: async (data: BetFormData) => {
      const newBet = {
        id: uuidv4(),
        ...data,
        userId: user.id,
        statusResult: "Pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        active: true,
      };

      const response = await fetch("/api/bets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newBet),
      });

      if (!response.ok) {
        throw new Error("Failed to create bet");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bets", user.id] });
      toast({ title: "Bet created successfully" });
      reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating bet",
        description: error.message,
        variant: "destructive",
      });
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

      <Button type="submit" disabled={loading || createBet.isPending}>
        {loading || createBet.isPending ? "Adding..." : "Add Bet"}
      </Button>
    </form>
  );
}

