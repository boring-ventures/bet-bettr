"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { betSchema, type BetFormData } from "@/lib/schemas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"

export function BetForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BetFormData>({
    resolver: zodResolver(betSchema),
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const createBet = useMutation(
    async (data: BetFormData) => {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error("User not found")

      const { data: bet, error } = await supabase
        .from("bets")
        .insert({ ...data, userId: user.user.id })
        .single()

      if (error) throw error
      return bet
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["bets"])
        toast({ title: "Bet created successfully" })
        reset()
      },
      onError: (error: Error) => {
        toast({ title: "Error creating bet", description: error.message, variant: "destructive" })
      },
    },
  )

  const onSubmit = (data: BetFormData) => {
    setLoading(true)
    createBet.mutate(data)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input type="number" step="0.01" placeholder="Odds" {...register("odds", { valueAsNumber: true })} />
      {errors.odds && <p className="text-red-500">{errors.odds.message}</p>}

      <Input placeholder="Market" {...register("market")} />
      {errors.market && <p className="text-red-500">{errors.market.message}</p>}

      <Input placeholder="Betting House" {...register("bettingHouse")} />
      {errors.bettingHouse && <p className="text-red-500">{errors.bettingHouse.message}</p>}

      <Select onValueChange={(value) => register("type").onChange({ target: { value } })}>
        <SelectTrigger>
          <SelectValue placeholder="Select bet type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Simple">Simple</SelectItem>
          <SelectItem value="Combined">Combined</SelectItem>
        </SelectContent>
      </Select>
      {errors.type && <p className="text-red-500">{errors.type.message}</p>}

      <Input placeholder="Sport" {...register("sport")} />
      {errors.sport && <p className="text-red-500">{errors.sport.message}</p>}

      <Input type="number" step="0.01" placeholder="Stake" {...register("stake", { valueAsNumber: true })} />
      {errors.stake && <p className="text-red-500">{errors.stake.message}</p>}

      <Button type="submit" disabled={loading}>
        Add Bet
      </Button>
    </form>
  )
}

