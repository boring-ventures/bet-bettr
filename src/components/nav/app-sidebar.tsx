"use client";

import * as React from "react";
import {
  LayoutDashboard,
  History,
  Users,
  Settings,
  Wallet,
  ChevronDown,
  LucideIcon,
  Volleyball,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav/nav-user";
import { Header } from "../dashboard/Header";

interface AppSidebarProps {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
    role: string;
    organization: {
      name: string;
    };
  };
}

interface NavItem {
  title: string;
  url?: string;
  icon: LucideIcon;
  items?: {
    title: string;
    url: string;
    icon: LucideIcon;
  }[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Bets",
    url: "/dashboard/bets",
    icon: History,
  },
  {
    title: "Money Rolls",
    url: "/dashboard/money-rolls",
    icon: Wallet,
  },
];

// Admin-only menu items
const adminItems: NavItem[] = [
  {
    title: "Users",
    url: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
];

export function AppSidebar({ user, children, ...props }: AppSidebarProps) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = React.useState<string[]>([]);
  const isAdmin = user.role === "admin";

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const menuItems = [...navItems, ...(isAdmin ? adminItems : [])];

  return (
    <>
      <Sidebar className="bg-muted border-r" variant="inset" {...props}>
        <SidebarHeader className="p-3 border-b">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <a href="/dashboard" className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md">
                    <Volleyball />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Bet Tracker</span>
                    <span className="truncate text-xs">
                      {user.organization.name}
                    </span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item, index) => {
              const isActive = item.url
                ? pathname === item.url
                : item.items?.some((subItem) => pathname === subItem.url);
              const isOpen = openMenus.includes(item.title);

              return (
                <React.Fragment key={item.title + index}>
                  <SidebarMenuItem>
                    {item.items ? (
                      <SidebarMenuButton
                        onClick={() => toggleMenu(item.title)}
                        className={cn(
                          "w-full justify-start gap-2",
                          isActive && "font-bold bg-card"
                        )}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 ml-auto transition-transform",
                              isOpen && "transform rotate-180"
                            )}
                          />
                        </div>
                      </SidebarMenuButton>
                    ) : (
                      <SidebarMenuButton
                        asChild
                        className={cn(
                          "w-full justify-start gap-2",
                          isActive && "font-bold bg-card"
                        )}
                      >
                        <a href={item.url} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>

                  {item.items && isOpen && (
                    <div className="pl-6 space-y-1">
                      {item.items.map((subItem, subIndex) => {
                        const isSubActive = pathname === subItem.url;
                        return (
                          <SidebarMenuItem key={subItem.title + subIndex}>
                            <SidebarMenuButton
                              asChild
                              className={cn(
                                "w-full justify-start gap-2",
                                isSubActive && "font-bold bg-card"
                              )}
                            >
                              <a
                                href={subItem.url}
                                className="flex items-center gap-2"
                              >
                                <subItem.icon className="h-4 w-4" />
                                <span>{subItem.title}</span>
                              </a>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="border-t">
          <NavUser user={user} />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex-1 p-6 bg-background">{children}</main>
      </SidebarInset>
    </>
  );
}
