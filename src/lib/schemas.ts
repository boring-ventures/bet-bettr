import { z } from "zod"

export const betSchema = z.object({
  odds: z.number().min(1.01, "Odds must be greater than 1"),
  market: z.string().min(1, "Market is required"),
  bettingHouse: z.string().min(1, "Betting house is required"),
  type: z.enum(["Simple", "Combined"]),
  sport: z.string().min(1, "Sport is required"),
  stake: z.number().min(0.01, "Stake must be greater than 0"),
  statusResult: z.enum(["Pending", "Win", "Lose"]).default("Pending"),
  moneyRoleId: z.string().uuid().optional(),
})

export type BetFormData = z.infer<typeof betSchema>

