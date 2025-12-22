import { Card } from "@/components/ui/card"
import { Construction } from "lucide-react"

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics & Reports</h1>
        <p className="mt-2 text-muted-foreground">Comprehensive business analytics and reporting</p>
      </div>

      <Card className="p-8 text-center">
        <div className="mx-auto max-w-sm">
          <Construction className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-semibold text-foreground">Page Under Construction</h2>
          <p className="text-muted-foreground">
            The Analytics & Reports section is currently being developed.
          </p>
        </div>
      </Card>

      <Card className="border border-dashed border-muted p-4">
        <p className="text-center text-sm text-muted-foreground">
          Check back soon for analytics dashboards and reporting features.
        </p>
      </Card>
    </div>
  )
}