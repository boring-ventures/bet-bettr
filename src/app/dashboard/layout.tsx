import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/nav/app-sidebar";
import { PrismaClient } from "@prisma/client";
import { SidebarProvider } from "@/components/ui/sidebar";
const prisma = new PrismaClient();

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <SidebarProvider>
        <AppSidebar user={user}>{children}</AppSidebar>
      </SidebarProvider>
    </div>
  );
}
