import { Card } from "@/components/ui/card"
import { Construction } from "lucide-react"

export default function LoginPage() {
  return (
    <Card className="w-full max-w-md p-8 text-center">
      <div className="mb-8">
        <Construction className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h1 className="text-2xl font-bold text-foreground">FinTech Admin</h1>
        <p className="mt-2 text-sm text-muted-foreground">Authentication system under development</p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-dashed border-muted p-8">
          <p className="text-sm text-muted-foreground">
            The login system is currently being developed.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-lg bg-muted p-4">
        <p className="text-xs text-muted-foreground">
          Authentication features will be implemented in the next development phase.
        </p>
      </div>
    </Card>
  )
}