"use client"

import { useEffect, useState } from "react"
import { SecurityOverview } from "@/components/security/SecurityOverview"
import { SecurityEventsTable } from "@/components/security/SecurityEventsTable"
import { ActiveBlocklist } from "@/components/security/ActiveBlocklist"
import { Button } from "@/components/ui/button"
import { RefreshCcw, Shield } from "lucide-react"
import { SecurityService } from "@/services/security"
import { SecurityEvent, BlocklistEntry, SystemHealthMetric } from "@/components/security/types"
import { toast } from "@/components/ui/use-toast"

export default function SecurityPage() {
  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [eventsPage, setEventsPage] = useState(1)
  const [eventsTotal, setEventsTotal] = useState(0)
  const eventsLimit = 10

  const [blocklist, setBlocklist] = useState<BlocklistEntry[]>([])
  const [blocklistPage, setBlocklistPage] = useState(1)
  const blocklistLimit = 5

  const [health, setHealth] = useState<SystemHealthMetric[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEvents = async () => {
    try {
      const offset = (eventsPage - 1) * eventsLimit
      const res = await SecurityService.getEvents(eventsLimit, offset)
      if (res.data) {
        setEvents(res.data.events)
        setEventsTotal(res.data.total)
      }
    } catch (error) {
      console.error("Failed to fetch events", error)
    }
  }

  const fetchStaticData = async () => {
    try {
      const [blocklistRes, healthRes] = await Promise.all([
        SecurityService.getBlocklist(),
        SecurityService.getSystemHealth()
      ])

      if (blocklistRes.data) setBlocklist(blocklistRes.data)
      if (healthRes.data) setHealth(healthRes.data)
    } catch (error) {
      console.error("Failed to fetch static security data", error)
    }
  }

  const fetchAllData = async () => {
    setLoading(true)
    await Promise.all([fetchEvents(), fetchStaticData()])
    setLoading(false)
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [eventsPage])

  // Client-side pagination for blocklist
  const paginatedBlocklist = blocklist.slice(
    (blocklistPage - 1) * blocklistLimit,
    blocklistPage * blocklistLimit
  )

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Security Center</h2>
          <p className="text-muted-foreground">
            Monitor threats, system health, and manage security policies.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={fetchAllData} disabled={loading}>
            <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm">
            <Shield className="mr-2 h-4 w-4" />
            Security Settings
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <SecurityOverview metrics={health} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Events Table - Takes up 5/7 columns on large screens */}
        <div className="col-span-4 lg:col-span-5">
          <SecurityEventsTable 
            events={events} 
            page={eventsPage}
            total={eventsTotal}
            limit={eventsLimit}
            onPageChange={setEventsPage}
          />
        </div>

        {/* Sidebar/Blocklist - Takes up 2/7 columns */}
        <div className="col-span-4 lg:col-span-2">
          <ActiveBlocklist 
            entries={paginatedBlocklist} 
            page={blocklistPage}
            total={blocklist.length}
            limit={blocklistLimit}
            onPageChange={setBlocklistPage}
          />
        </div>
      </div>
    </div>
  )
}
