import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Construction } from "lucide-react"

export default async function UserDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/users">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customer Details</h1>
          <p className="mt-2 text-muted-foreground">View and manage customer information</p>
        </div>
      </div>

      <Card className="p-8 text-center">
        <div className="mx-auto max-w-sm">
          <Construction className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-semibold text-foreground">Page Under Construction</h2>
          <p className="text-muted-foreground">
            The Customer Details section is currently being developed.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            User ID: {params.id}
          </p>
        </div>
      </Card>

      <Card className="border border-dashed border-muted p-4">
        <p className="text-center text-sm text-muted-foreground">
          Check back soon for detailed user profile and management features.
        </p>
      </Card>
    </div>
  )
}