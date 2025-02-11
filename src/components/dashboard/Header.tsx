"use client";

import React from "react";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname() || "";
  const paths = pathname.split("/").filter(Boolean);

  // Map of routes to their display names in Spanish.
  const routeMap: Record<string, string> = {
    dashboard: "Panel Principal",
    users: "Usuarios",
    companies: "Empresas",
    tickets: "Tickets",
    parcels: "Encomiendas",
    routes: "Rutas",
    buses: "Buses",
    finances: "Finanzas",
  };

  const getBreadcrumbs = () => {
    return paths.map((path, index) => {
      const href = `/${paths.slice(0, index + 1).join("/")}`;
      const isLast = index === paths.length - 1;
      const title =
        // Check if the segment matches our Spanish mappings, otherwise default.
        routeMap[path.toLowerCase()] ||
        path.charAt(0).toUpperCase() + path.slice(1);

      if (isLast) {
        return (
          <BreadcrumbItem key={path}>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        );
      }

      return (
        <React.Fragment key={path}>
          <BreadcrumbItem>
            <BreadcrumbLink href={href}>{title}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
        </React.Fragment>
      );
    });
  };

  return (
    <header className="border-b">
      <div className="flex h-16 items-center gap-2 px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>{getBreadcrumbs()}</BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
