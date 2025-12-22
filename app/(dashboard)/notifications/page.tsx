import { Card } from "@/components/ui/card"
import { Construction } from "lucide-react"

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Notification Management</h1>
        <p className="mt-2 text-muted-foreground">
          Manage system notifications, email campaigns, and user communications
        </p>
      </div>

      <Card className="p-8 text-center">
        <div className="mx-auto max-w-sm">
          <Construction className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-semibold text-foreground">Page Under Construction</h2>
          <p className="text-muted-foreground">
            The Notification Management section is currently being developed.
          </p>
        </div>
      </Card>

      <Card className="border border-dashed border-muted p-4">
        <p className="text-center text-sm text-muted-foreground">
          Check back soon for email, SMS, and push notification features.
        </p>
      </Card>
    </div>
  )
}