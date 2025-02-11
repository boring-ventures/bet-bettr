import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { BetForm } from "@/components/bet-form"
import { BetHistory } from "@/components/bet-history"

export default async function Dashboard() {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="mb-4">Welcome, {session.user.email}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-2">Add New Bet</h2>
          <BetForm />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Bet History</h2>
          <BetHistory />
        </div>
      </div>
    </div>
  )
}

