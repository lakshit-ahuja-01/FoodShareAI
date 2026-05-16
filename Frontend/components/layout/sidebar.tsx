"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  UtensilsCrossed,
  PlusCircle,
  Building2,
  Trophy,
  Calendar,
  Bell,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  BarChart2,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: "Dashboard",      href: "/dashboard",    icon: LayoutDashboard },
  { name: "Food Listings",  href: "/listings",     icon: UtensilsCrossed },
  { name: "Add Food",       href: "/add-food",     icon: PlusCircle },
  { name: "NGOs Nearby",    href: "/ngos",         icon: Building2 },
  { name: "Leaderboard",    href: "/leaderboard",  icon: Trophy },
  { name: "Analytics",      href: "/analytics",    icon: BarChart2 },
  { name: "Schedule",       href: "/schedule",     icon: Calendar },
  { name: "Notifications",  href: "/notifications",icon: Bell },
  { name: "Settings",       href: "/settings",     icon: Settings },
  { name: "Help & Support", href: "/help",         icon: HelpCircle },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 z-40 flex h-[calc(100vh-4rem)] flex-col border-r border-border bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <nav className="flex-1 space-y-1 p-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-sidebar-border p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="w-full justify-center text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5 mr-2" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  )
}
