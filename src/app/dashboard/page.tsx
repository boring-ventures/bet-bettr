import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from "next/navigation";
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Welcome, {user.name}</p>
      <p className="text-sm text-gray-600">
        Organization: {user.organization.name}
      </p>

      {/* Add dashboard stats/charts here */}
    </div>
  );
}

