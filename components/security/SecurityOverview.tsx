"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, ShieldAlert, ShieldCheck, Lock } from "lucide-react"
import { SystemHealthMetric } from "./types"

interface SecurityOverviewProps {
  metrics: SystemHealthMetric[]
}

export function SecurityOverview({ metrics }: SecurityOverviewProps) {
  const getIcon = (metric: string) => {
    switch (metric) {
      case 'API Latency': return Activity;
      case 'Active Threats': return ShieldAlert;
      case 'Failed Logins (1h)': return Lock;
      default: return ShieldCheck;
    }
  }

  const getColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      case 'healthy': return 'text-green-500';
      default: return 'text-muted-foreground';
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = getIcon(metric.metric)
        return (
          <Card key={metric.metric}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.metric}
              </CardTitle>
              <Icon className={`h-4 w-4 ${getColor(metric.status)}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              {metric.change && (
                <p className="text-xs text-muted-foreground">
                  {metric.change} from last hour
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
