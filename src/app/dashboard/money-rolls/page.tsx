import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { MoneyRollsTable } from "@/components/money-rolls/money-rolls-table";

const prisma = new PrismaClient();

export default async function MoneyRollsPage() {
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
      moneyRoles: {
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

  const serializedUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    organizationId: user.organizationId,
  };

  const serializedMoneyRolls = user.moneyRoles.map((roll) => ({
    id: roll.id,
    name: roll.name,
    userId: roll.userId,
    createdAt: roll.createdAt.toISOString(),
    updatedAt: roll.updatedAt.toISOString(),
    active: roll.active,
  }));

  return (
    <div className="space-y-4">
      <MoneyRollsTable moneyRolls={serializedMoneyRolls} user={serializedUser} />
    </div>
  );
} 