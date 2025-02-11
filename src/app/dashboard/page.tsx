import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { BetForm } from "@/components/bet-form"
import { BetHistory } from "@/components/bet-history"
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  // Get the Prisma user data with bets
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      organization: true,
      bets: {
        orderBy: {
          createdAt: "desc",
        },
        where: {
          active: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Serialize the dates in the bets array and convert Decimal to number
  const serializedUser = {
    ...user,
    bets: user.bets.map((bet) => ({
      ...bet,
      odds: Number(bet.odds),
      stake: Number(bet.stake),
      createdAt: bet.createdAt.toISOString(),
      updatedAt: bet.updatedAt.toISOString(),
    })),
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Welcome, {user.name}</p>
      <p className="text-sm text-gray-600">
        Organization: {user.organization.name}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-2">Add New Bet</h2>
          <BetForm user={serializedUser} />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Bet History</h2>
          <BetHistory initialBets={serializedUser.bets} user={serializedUser} />
        </div>
      </div>
    </div>
  );
}

