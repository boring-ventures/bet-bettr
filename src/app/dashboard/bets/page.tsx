import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { BetsTable } from "@/components/bets/bets-table";

const prisma = new PrismaClient();

export default async function BetsPage() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

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

  // Create a serializable version of the user without Decimal types
  const serializedUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    organizationId: user.organizationId,
  };

  // Serialize the bets separately, converting Decimal to number
  const serializedBets = user.bets.map((bet) => ({
    id: bet.id,
    odds: Number(bet.odds),
    market: bet.market,
    bettingHouse: bet.bettingHouse,
    type: bet.type,
    sport: bet.sport,
    stake: Number(bet.stake),
    statusResult: bet.statusResult as "Pending" | "Win" | "Lose",
    userId: bet.userId,
    moneyRollId: bet.moneyRollId || undefined,
    createdAt: bet.createdAt.toISOString(),
    updatedAt: bet.updatedAt.toISOString(),
    active: bet.active,
  }));

  return (
    <div className="space-y-4">
      <BetsTable bets={serializedBets} user={serializedUser} />
    </div>
  );
}
