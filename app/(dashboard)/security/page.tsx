"use client"

import { useEffect, useState } from "react"
import { SecurityOverview } from "@/components/security/SecurityOverview"
import { SecurityEventsTable } from "@/components/security/SecurityEventsTable"
import { ActiveBlocklist } from "@/components/security/ActiveBlocklist"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RefreshCcw, Shield } from "lucide-react"
import { SecurityService } from "@/services/security"
import { SecurityEvent, BlocklistEntry, SystemHealthMetric, RiskConfig, RiskStatus, RiskUsageMetrics } from "@/components/security/types"

export default function SecurityPage() {
  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [eventsPage, setEventsPage] = useState(1)
  const [eventsTotal, setEventsTotal] = useState(0)
  const eventsLimit = 10

  const [blocklist, setBlocklist] = useState<BlocklistEntry[]>([])
  const [blocklistPage, setBlocklistPage] = useState(1)
  const blocklistLimit = 5

  const [health, setHealth] = useState<SystemHealthMetric[]>([])
  const [loading, setLoading] = useState(false)

  const [riskConfig, setRiskConfig] = useState<RiskConfig | null>(null)
  const [riskStatus, setRiskStatus] = useState<RiskStatus | null>(null)
  const [updatingRisk, setUpdatingRisk] = useState(false)

  const [localRiskConfig, setLocalRiskConfig] = useState<RiskConfig | null>(null)
  const [riskUsageMetrics, setRiskUsageMetrics] = useState<RiskUsageMetrics | null>(null)

  const fetchEvents = async (pageParam: number = eventsPage) => {
    try {
      const offset = (pageParam - 1) * eventsLimit
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
      const [blocklistRes, healthRes, riskConfigRes, riskStatusRes, riskUsageRes] = await Promise.all([
        SecurityService.getBlocklist(),
        SecurityService.getSystemHealth(),
        SecurityService.getRiskConfig(),
        SecurityService.getRiskStatus(),
        SecurityService.getRiskUsageMetrics()
      ])

      if (blocklistRes.data) setBlocklist(blocklistRes.data)
      if (healthRes.data) setHealth(healthRes.data)
      if (riskConfigRes.data) {
        setRiskConfig(riskConfigRes.data)
        setLocalRiskConfig(riskConfigRes.data)
      }
      if (riskStatusRes.data) setRiskStatus(riskStatusRes.data)
      if (riskUsageRes.data) setRiskUsageMetrics(riskUsageRes.data)
    } catch (error) {
      console.error("Failed to fetch static security data", error)
    }
  }

  const fetchAllData = async () => {
    setLoading(true)
    await Promise.all([fetchEvents(), fetchStaticData()])
    setLoading(false)
  }

  const toggleGlobalPause = async () => {
    if (!riskStatus) return
    try {
      setUpdatingRisk(true)
      const res = await SecurityService.updateRiskConfig({
        global_system_pause: !riskStatus.global_system_pause
      })
      if (res.data) {
        setRiskStatus(res.data)
        if (riskConfig) {
          setRiskConfig({
            ...riskConfig,
            global_system_pause: res.data.global_system_pause
          })
        }
      }
    } catch (error) {
      console.error("Failed to update risk config", error)
    } finally {
      setUpdatingRisk(false)
    }
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [eventsRes, blocklistRes, healthRes, riskConfigRes, riskStatusRes, riskUsageRes] = await Promise.all([
          SecurityService.getEvents(eventsLimit, 0),
          SecurityService.getBlocklist(),
          SecurityService.getSystemHealth(),
          SecurityService.getRiskConfig(),
          SecurityService.getRiskStatus(),
          SecurityService.getRiskUsageMetrics()
        ])

        if (eventsRes.data) {
          setEvents(eventsRes.data.events)
          setEventsTotal(eventsRes.data.total)
        }
        if (blocklistRes.data) setBlocklist(blocklistRes.data)
        if (healthRes.data) setHealth(healthRes.data)
        if (riskConfigRes.data) {
          setRiskConfig(riskConfigRes.data)
          setLocalRiskConfig(riskConfigRes.data)
        }
        if (riskStatusRes.data) setRiskStatus(riskStatusRes.data)
        if (riskUsageRes.data) setRiskUsageMetrics(riskUsageRes.data)
      } catch (error) {
        console.error("Failed to fetch initial security data", error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

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
          {riskStatus && (
            <Button size="sm" variant={riskStatus.global_system_pause ? "destructive" : "secondary"} onClick={toggleGlobalPause} disabled={updatingRisk}>
              <Shield className="mr-2 h-4 w-4" />
              {riskStatus.global_system_pause ? "Resume Processing" : "Pause Processing"}
            </Button>
          )}
        </div>
      </div>

      <SecurityOverview metrics={health} />

      {riskUsageMetrics && (
        <Card>
          <CardHeader>
            <CardTitle>Risk Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-muted-foreground">
              Daily volume: <span className="font-mono">{riskUsageMetrics.daily_volume}</span> /{" "}
              <span className="font-mono">{riskUsageMetrics.max_daily_limit}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Usage: {(riskUsageMetrics.daily_usage_ratio * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">
              Hourly velocity limit: {riskUsageMetrics.max_velocity_per_hour}, Daily velocity limit: {riskUsageMetrics.max_velocity_per_day}
            </div>
            <div className="text-xs text-muted-foreground">
              Users in cool-off: {riskUsageMetrics.cool_off_users}
            </div>
          </CardContent>
        </Card>
      )}

      {localRiskConfig && (
        <Card>
          <CardHeader>
            <CardTitle>Risk Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="maxDailyLimit">Max Daily Limit</Label>
                <Input
                  id="maxDailyLimit"
                  type="number"
                  value={localRiskConfig.max_daily_limit}
                  onChange={(e) =>
                    setLocalRiskConfig({
                      ...localRiskConfig,
                      max_daily_limit: Number(e.target.value || 0)
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="highValueThreshold">High Value Threshold</Label>
                <Input
                  id="highValueThreshold"
                  type="number"
                  value={localRiskConfig.high_value_threshold}
                  onChange={(e) =>
                    setLocalRiskConfig({
                      ...localRiskConfig,
                      high_value_threshold: Number(e.target.value || 0)
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxVelocityPerHour">Max Velocity Per Hour</Label>
                <Input
                  id="maxVelocityPerHour"
                  type="number"
                  value={localRiskConfig.max_velocity_per_hour}
                  onChange={(e) =>
                    setLocalRiskConfig({
                      ...localRiskConfig,
                      max_velocity_per_hour: Number(e.target.value || 0)
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxVelocityPerDay">Max Velocity Per Day</Label>
                <Input
                  id="maxVelocityPerDay"
                  type="number"
                  value={localRiskConfig.max_velocity_per_day}
                  onChange={(e) =>
                    setLocalRiskConfig({
                      ...localRiskConfig,
                      max_velocity_per_day: Number(e.target.value || 0)
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="suspiciousLocationAlert">Suspicious Location Alert</Label>
              <Input
                id="suspiciousLocationAlert"
                value={localRiskConfig.suspicious_location_alert}
                onChange={(e) =>
                  setLocalRiskConfig({
                    ...localRiskConfig,
                    suspicious_location_alert: e.target.value
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="restrictedCountries">Restricted Countries (comma separated)</Label>
              <Input
                id="restrictedCountries"
                value={localRiskConfig.restricted_countries.join(",")}
                onChange={(e) =>
                  setLocalRiskConfig({
                    ...localRiskConfig,
                    restricted_countries: e.target.value
                      .split(",")
                      .map((c) => c.trim())
                      .filter((c) => c.length > 0)
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="enableDisputeResolution">Enable Dispute Resolution</Label>
              </div>
              <Switch
                id="enableDisputeResolution"
                checked={localRiskConfig.enable_dispute_resolution}
                onCheckedChange={(checked) =>
                  setLocalRiskConfig({
                    ...localRiskConfig,
                    enable_dispute_resolution: checked
                  })
                }
              />
            </div>

            <div className="flex justify-end">
              <Button
                size="sm"
                disabled={updatingRisk}
                onClick={async () => {
                  if (!localRiskConfig) return
                  try {
                    setUpdatingRisk(true)
                    const res = await SecurityService.updateRiskConfig({
                      max_daily_limit: localRiskConfig.max_daily_limit,
                      high_value_threshold: localRiskConfig.high_value_threshold,
                      max_velocity_per_hour: localRiskConfig.max_velocity_per_hour,
                      max_velocity_per_day: localRiskConfig.max_velocity_per_day,
                      suspicious_location_alert: localRiskConfig.suspicious_location_alert,
                      restricted_countries: localRiskConfig.restricted_countries,
                      enable_dispute_resolution: localRiskConfig.enable_dispute_resolution
                    })
                    if (res.data) {
                      await fetchStaticData()
                    }
                  } catch (error) {
                    console.error("Failed to update risk configuration", error)
                  } finally {
                    setUpdatingRisk(false)
                  }
                }}
              >
                Save Risk Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Events Table - Takes up 5/7 columns on large screens */}
        <div className="col-span-4 lg:col-span-5">
          <SecurityEventsTable 
            events={events} 
            page={eventsPage}
            total={eventsTotal}
            limit={eventsLimit}
            onPageChange={(page) => {
              setEventsPage(page)
              fetchEvents(page)
            }}
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
