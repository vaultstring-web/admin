import { Card } from "@/components/ui/card"
import { Construction } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="mt-2 text-muted-foreground">Monitor key metrics and recent activity across your platform</p>
      </div>

      <Card className="p-8 text-center">
        <div className="mx-auto max-w-sm">
          <Construction className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-semibold text-foreground">Welcome to Your Admin Dashboard</h2>
          <p className="text-muted-foreground">
            This is a starter template for your FinTech admin dashboard.
          </p>
        </div>
      </Card>

      <Card className="border border-dashed border-muted p-4">
        <p className="text-center text-sm text-muted-foreground">
          All sections are currently in development. Navigate using the sidebar to see upcoming features.
        </p>
      </Card>
    </div>
  )
}