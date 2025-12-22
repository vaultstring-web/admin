"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Store,
  ArrowLeftRight,
  DollarSign,
  Building2,
  Box,
  Bell,
  Settings,
  ShieldCheck,
  BarChart3,
  HelpCircle,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { NAV_GROUPS } from "@/lib/constants"
import { useTheme } from "next-themes"

const iconMap = {
  LayoutDashboard,
  Users,
  Store,
  ArrowLeftRight,
  DollarSign,
  Building2,
  Box,
  Bell,
  Settings,
  ShieldCheck,
  BarChart3,
  HelpCircle,
}

export function Sidebar() {
  const pathname = usePathname()
  const { theme } = useTheme()

  return (
    <aside className="fixed left-0 top-0 z-30 h-screen w-64 border-r border-border bg-sidebar">
      <div className="flex h-full flex-col">
        {/* Logo - Changes based on theme */}
        <div className="flex h-16 items-center border-b border-sidebar-border px-6">
          <Link 
            href="/" 
            className="flex items-center justify-center w-full"
          >
            {theme === "dark" ? (
              <img 
                src="/icons/vs1.svg" 
                alt="VaultString Logo" 
                className="h-20 w-auto md:h-25 lg:h-25"
              />
            ) : (
              <img 
                src="/icons/vs2.svg" 
                alt="VaultString Logo" 
                className="h-20 w-auto md:h-25 lg:h-25"
              />
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-6">
          {Object.values(NAV_GROUPS).map((group) => (
            <div key={group.title}>
              <div className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/60">
                {group.title}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = iconMap[item.icon as keyof typeof iconMap]
                  const isActive = pathname === item.href

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[0_0_15px_rgba(68,138,51,0.5)]"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                      )}
                    >
                      {/* Green glow border for active item */}
                      {isActive && (
                        <div className="absolute -left-1 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-linear-to-b from-[#448a33] to-[#3b5a65]"></div>
                      )}
                      
                      <Icon className={cn("h-4 w-4 transition-all", isActive && "text-[#448a33]")} />
                      
                      <span className="relative z-10">{item.title}</span>
                      
                      {isActive && (
                        <div className="ml-auto">
                          <ChevronRight className="h-4 w-4 text-[#448a33]" />
                        </div>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4">
          <div className="rounded-lg bg-sidebar-accent/50 p-3">
            <p className="text-xs font-medium text-sidebar-foreground">Development Environment</p>
            <p className="mt-1 text-xs text-sidebar-foreground/60">v1.0.0 - Scaffolding</p>
          </div>
        </div>
      </div>
    </aside>
  )
}