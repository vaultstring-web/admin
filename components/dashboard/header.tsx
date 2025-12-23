"use client"

import { Bell, Moon, Sun, User, LogOut, Settings2, Shield } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function DashboardHeader() {
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border/40 bg-background/80 px-6 backdrop-blur-md">
      {/* Brand/Breadcrumb Section */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Shield className="h-4 w-4 text-primary" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-sm font-bold tracking-tight text-foreground">VaultString Dashboard</h1>
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">System Overlook</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Actions Group */}
        <div className="flex items-center gap-1 pr-2 border-r border-border/50">
          {/* Theme Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 rounded-xl hover:bg-primary/5 transition-colors"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4.5 w-4.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4.5[w-4.5tate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl hover:bg-primary/5">
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute right-2.5 top-2.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
          </Button>
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 ring-offset-background transition-all hover:ring-2 hover:ring-primary/20 hover:ring-offset-2">
              <Avatar className="h-9 w-9 border border-border/50">
                <AvatarFallback className="bg-linear-to-br from-brand-green to-brand-blue text-[10px] font-bold text-white uppercase tracking-tighter">
                  AD
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 shadow-xl shadow-foreground/5 border-border/50">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-bold leading-none tracking-tight">Admin User</p>
                <p className="text-xs leading-none text-muted-foreground">admin@vaultstring.com</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="opacity-50" />
            <div className="p-1">
              <DropdownMenuItem className="rounded-lg py-2 cursor-pointer gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium">Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg py-2 cursor-pointer gap-2">
                <Settings2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium">System Preferences</span>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator className="opacity-50" />
            <div className="p-1">
              <DropdownMenuItem className="rounded-lg py-2 cursor-pointer gap-2 text-destructive focus:bg-destructive/5 focus:text-destructive">
                <LogOut className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Log out</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}