"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { BetForm } from "./bet-form"

interface AddBetButtonProps {
  user: {
    id: string
    email: string
    name: string
    organizationId: string
  }
}

export function AddBetButton({ user }: AddBetButtonProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add New Bet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Bet</DialogTitle>
        </DialogHeader>
        <BetForm user={user} onClose={() => {}} />
      </DialogContent>
    </Dialog>
  )
} 