import { Card } from "@/components/ui/card"
import { Construction } from "lucide-react"

export default function ForexPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Forex Rates</h1>
        <p className="mt-2 text-muted-foreground">Real-time foreign exchange rates and currency management</p>
      </div>

      <Card className="p-8 text-center">
        <div className="mx-auto max-w-sm">
          <Construction className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-semibold text-foreground">Page Under Construction</h2>
          <p className="text-muted-foreground">
            The Forex Rates section is currently being developed.
          </p>
        </div>
      </Card>

      <Card className="border border-dashed border-muted p-4">
        <p className="text-center text-sm text-muted-foreground">
          Check back soon for live forex rates and currency conversion features.
        </p>
      </Card>
    </div>
  )
}