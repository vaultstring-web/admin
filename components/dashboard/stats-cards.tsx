import { Card } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, type LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string
  change: string
  isPositive: boolean
  icon: LucideIcon
}

export function StatCard({ title, value, change, isPositive, icon: Icon }: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
          <div className="mt-2 flex items-center gap-1">
            {isPositive ? (
              <ArrowUpRight className="h-4 w-4 text-[#448a33]" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-destructive" />
            )}
            <span className={`text-sm font-medium ${isPositive ? "text-[#448a33]" : "text-destructive"}`}>
              {change}
            </span>
            <span className="text-sm text-muted-foreground">vs last month</span>
          </div>
        </div>
        <div className="rounded-lg bg-gradient-to-br from-[#448a33]/10 to-[#3b5a65]/10 p-3">
          <Icon className="h-6 w-6 text-[#448a33]" />
        </div>
      </div>
    </Card>
  )
}

export function StatsCards({ stats }: { stats: StatCardProps[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  )
}
