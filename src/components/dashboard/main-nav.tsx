'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Bus,
  Package,
  Users,
  Calendar,
  BarChart,
  Settings,
  Building2,
  CreditCard,
} from "lucide-react"

const navigation = [
  {
    name: "Passenger Management",
    href: "/dashboard/passengers",
    icon: Users,
    description: "Manage tickets and passenger information"
  },
  {
    name: "Parcel Management",
    href: "/dashboard/parcels",
    icon: Package,
    description: "Track and manage parcel deliveries"
  },
  {
    name: "Operations",
    href: "/dashboard/operations",
    icon: Bus,
    description: "Manage routes and schedules"
  },
  {
    name: "Branches",
    href: "/dashboard/branches",
    icon: Building2,
    description: "Manage company branches"
  },
  {
    name: "Schedule",
    href: "/dashboard/schedule",
    icon: Calendar,
    description: "View and manage bus schedules"
  },
  {
    name: "Billing",
    href: "/dashboard/billing",
    icon: CreditCard,
    description: "Manage payments and invoices"
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart,
    description: "View system analytics and reports"
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    description: "System configuration"
  },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="grid gap-2">
      {navigation.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
            pathname === item.href ? "bg-accent" : "transparent"
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.name}
        </Link>
      ))}
    </nav>
  )
} 