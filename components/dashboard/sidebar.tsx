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
  CircleDot,
  FileCheck
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
  FileCheck,
}

export function Sidebar() {
  const pathname = usePathname()
  const { theme } = useTheme()

  return (
    <aside className="fixed left-0 top-0 z-30 h-screen w-64 border-r border-border/40 bg-background/95 backdrop-blur-sm">
      <div className="flex h-full flex-col">
        {/* Logo Section - Clean & Centered */}
        <div className="flex h-20 items-center px-6">
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <img 
              src={theme === "dark" ? "/icons/vs1.svg" : "/icons/vs2.svg"} 
              alt="Logo" 
              className="h-20 w-auto md:h-25 lg:h-25"
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-8 overflow-y-auto px-4 py-4 scrollbar-none">
          {Object.values(NAV_GROUPS).map((group) => (
            <div key={group.title} className="space-y-2">
              <h3 className="px-4 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = iconMap[item.icon as keyof typeof iconMap] || CircleDot
                  const isActive = pathname === item.href

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-primary/5 text-primary ring-1 ring-inset ring-primary/20"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                    >
                      {/* Active Indicator Strip */}
                      {isActive && (
                        <div className="absolute left-0 h-5 w-1 rounded-r-full bg-primary" />
                      )}
                      
                      <Icon className={cn(
                        "h-4.5 w-4.5 shrink-0 transition-colors",
                        isActive ? "text-primary" : "text-muted-foreground/70 group-hover:text-foreground"
                      )} />
                      
                      <span className="flex-1 tracking-tight">{item.title}</span>
                      
                      {isActive && (
                        <ChevronRight className="h-3 w-3 animate-in fade-in slide-in-from-left-2" />
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer - Floating Card Style */}
        <div className="mt-auto p-4">
          <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-muted/30 p-4 transition-colors hover:bg-muted/50">
            <div className="relative z-10 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Box className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <p className="text-[11px] font-bold text-foreground">v1.0.0 Stable</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Dev Environment</p>
              </div>
            </div>
            {/* Subtle background glow */}
            <div className="absolute -right-4 -top-4 h-12 w-12 rounded-full bg-primary/5 blur-2xl" />
          </div>
        </div>
      </div>
    </aside>
  )
}