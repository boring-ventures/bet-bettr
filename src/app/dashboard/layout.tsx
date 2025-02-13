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
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  // Use getUser instead of getSession for better security
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
    include: {
      organization: true,
    },
  });

  if (!dbUser) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarProvider>
        <AppSidebar user={dbUser}>{children}</AppSidebar>
      </SidebarProvider>
    </div>
  );
}
