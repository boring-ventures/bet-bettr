import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { MoneyRolesTable } from "@/components/money-roles/money-roles-table";

const prisma = new PrismaClient();

export default async function MoneyRolesPage() {
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

  const serializedMoneyRoles = user.moneyRoles.map((role) => ({
    id: role.id,
    name: role.name,
    userId: role.userId,
    createdAt: role.createdAt.toISOString(),
    updatedAt: role.updatedAt.toISOString(),
    active: role.active,
  }));

  return (
    <div className="space-y-4">
      <MoneyRolesTable moneyRoles={serializedMoneyRoles} user={serializedUser} />
    </div>
  );
} 