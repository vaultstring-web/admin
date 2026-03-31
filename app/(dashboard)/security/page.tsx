"use client"

import { useEffect, useMemo, useState } from "react"
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
import { MonitoringLayout } from "@/components/monitoring/MonitoringLayout"
import { createCase } from "@/lib/api"
import { linkOrCreateCaseAndAppendNote } from "@/lib/caseLinking"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

export default function SecurityPage() {
  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [eventsPage, setEventsPage] = useState(1)
  const [eventsTotal, setEventsTotal] = useState(0)
  const eventsLimit = 10
  const [eventsSearch, setEventsSearch] = useState("")
  const [eventsUserId, setEventsUserId] = useState("")
  const [eventsIP, setEventsIP] = useState("")

  const eventsFilters = useMemo(() => {
    return {
      q: eventsSearch || undefined,
      user_id: eventsUserId || undefined,
      ip: eventsIP || undefined,
    }
  }, [eventsSearch, eventsUserId, eventsIP])

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

  const [caseOpen, setCaseOpen] = useState(false)
  const [caseTitle, setCaseTitle] = useState("")
  const [casePriority, setCasePriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium')
  const [caseNote, setCaseNote] = useState("")
  const [caseEntityType, setCaseEntityType] = useState<'user' | 'ip'>('user')
  const [caseEntityId, setCaseEntityId] = useState("")
  const [creatingCase, setCreatingCase] = useState(false)

  const fetchEvents = async (pageParam: number = eventsPage) => {
    try {
      const offset = (pageParam - 1) * eventsLimit
      const res = await SecurityService.getEvents(eventsLimit, offset, eventsFilters)
      if (res.data) {
        setEvents(res.data.events)
        setEventsTotal(res.data.total)
      }
    } catch {
      setEvents([])
      setEventsTotal(0)
    }
  }

  const updateEventStatus = async (id: string, status: string) => {
    try {
      await SecurityService.updateEventStatus(id, status)
      const ev = events.find((e) => e.id === id)
      const entityType = ev?.user_id ? 'user' : 'ip'
      const entityId = ev?.user_id || ev?.ip_address || ''
      if (entityId) {
        await linkOrCreateCaseAndAppendNote({
          entityType,
          entityId,
          title: `Security event status update: ${id}`,
          note: `Security event ${id} marked as "${status}".`,
          priority: 'high',
        })
      }
      await fetchEvents(1)
      setEventsPage(1)
    } catch {
      // keep UI quiet in local/dev if backend unavailable
    }
  }

  const blockFromEvent = async (type: 'ip' | 'user', value: string, reason: string) => {
    try {
      await SecurityService.addToBlocklist({
        type,
        value,
        reason,
      })
      await linkOrCreateCaseAndAppendNote({
        entityType: type,
        entityId: value,
        title: `Security blocklist action: ${type}`,
        note: `Added ${type} "${value}" to blocklist.${reason ? `\n\nReason: ${reason}` : ''}`,
        priority: 'critical',
      })
      const res = await SecurityService.getBlocklist()
      if (res.data) setBlocklist(res.data)
    } catch {
      // keep UI quiet in local/dev if backend unavailable
    }
  }

  const openCaseFromEvent = (event: SecurityEvent) => {
    const userID = (event.user_id || '').trim()
    const ip = (event.ip_address || '').trim()
    const eventType = (event.event_type || event.type || 'security_event') as string

    if (userID) {
      setCaseEntityType('user')
      setCaseEntityId(userID)
    } else if (ip) {
      setCaseEntityType('ip')
      setCaseEntityId(ip)
    } else {
      // fallback: still let operator create a case, but require manual entity id
      setCaseEntityType('user')
      setCaseEntityId('')
    }

    setCaseTitle(`Security case: ${eventType.replace(/_/g, ' ')}`)
    setCasePriority(event.severity === 'critical' ? 'critical' : event.severity === 'high' ? 'high' : 'medium')
    setCaseNote(`Created from security event ${event.id}`)
    setCaseOpen(true)
  }

  const createCaseConfirm = async () => {
    if (!caseTitle.trim()) return
    if (!caseEntityId.trim()) return
    try {
      setCreatingCase(true)
      await createCase({
        title: caseTitle.trim(),
        description: `Created from Security Center`,
        priority: casePriority,
        entity_type: caseEntityType,
        entity_id: caseEntityId.trim(),
        note: caseNote.trim() || undefined,
      })
      setCaseOpen(false)
      // refresh cases is separate screen; here we refresh events list so operator sees status changes if any
    } catch {
      // keep UI quiet in local/dev if backend unavailable
    } finally {
      setCreatingCase(false)
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
    } catch {
      // keep UI quiet in local/dev if backend unavailable
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
    } catch {
      // keep UI quiet in local/dev if backend unavailable
    } finally {
      setUpdatingRisk(false)
    }
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [eventsRes, blocklistRes, healthRes, riskConfigRes, riskStatusRes, riskUsageRes] = await Promise.all([
          SecurityService.getEvents(eventsLimit, 0, eventsFilters),
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
      } catch {
        setEvents([])
        setEventsTotal(0)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [eventsFilters])

  // Debounced search/filter refresh
  useEffect(() => {
    const t = setTimeout(() => {
      setEventsPage(1)
      fetchEvents(1)
    }, 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventsFilters])

  // Client-side pagination for blocklist
  const paginatedBlocklist = blocklist.slice(
    (blocklistPage - 1) * blocklistLimit,
    blocklistPage * blocklistLimit
  )

  return (
    <MonitoringLayout
      title="Security Center"
      subtitle="Monitor threats, system health, and manage security policies."
      filters={
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" onClick={fetchAllData} disabled={loading} className="w-full justify-start">
                <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {riskStatus && (
                <Button
                  size="sm"
                  variant={riskStatus.global_system_pause ? "destructive" : "secondary"}
                  onClick={toggleGlobalPause}
                  disabled={updatingRisk}
                  className="w-full justify-start"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  {riskStatus.global_system_pause ? "Resume Processing" : "Pause Processing"}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Event filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Presets</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setEventsSearch("brute_force")
                      setEventsUserId("")
                      setEventsIP("")
                      setEventsPage(1)
                    }}
                  >
                    Brute force
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setEventsSearch("velocity")
                      setEventsUserId("")
                      setEventsIP("")
                      setEventsPage(1)
                    }}
                  >
                    Velocity hits
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setEventsSearch("risk_block")
                      setEventsUserId("")
                      setEventsIP("")
                      setEventsPage(1)
                    }}
                  >
                    Risk blocks
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setEventsSearch("blockchain_mismatch")
                      setEventsUserId("")
                      setEventsIP("")
                      setEventsPage(1)
                    }}
                  >
                    Chain mismatch
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEventsSearch("")
                      setEventsUserId("")
                      setEventsIP("")
                      setEventsPage(1)
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventsSearch">Search</Label>
                <Input id="eventsSearch" value={eventsSearch} onChange={(e) => { setEventsSearch(e.target.value); setEventsPage(1) }} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventsUser">User ID</Label>
                <Input id="eventsUser" value={eventsUserId} onChange={(e) => { setEventsUserId(e.target.value); setEventsPage(1) }} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventsIP">IP</Label>
                <Input id="eventsIP" value={eventsIP} onChange={(e) => { setEventsIP(e.target.value); setEventsPage(1) }} />
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <SecurityOverview metrics={health} />

      {riskUsageMetrics ? (
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
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Risk Usage</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            No risk metrics yet. Activity will appear here after transactions and risk events are processed.
          </CardContent>
        </Card>
      )}

      {localRiskConfig ? (
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
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Risk Configuration</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Risk configuration is unavailable right now. Verify backend risk endpoints are reachable.
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
        search={eventsSearch}
        onSearchChange={setEventsSearch}
        onUpdateStatus={updateEventStatus}
        onBlock={blockFromEvent}
        onCreateCase={openCaseFromEvent}
        onSelectTarget={(t) => {
          if (t.user_id) setEventsUserId(t.user_id)
          if (t.ip) setEventsIP(t.ip)
          setEventsPage(1)
        }}
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

      <Dialog open={caseOpen} onOpenChange={setCaseOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Create case</DialogTitle>
            <DialogDescription>
              Create an investigation case linked to this security event target (user or IP).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="secCaseTitle">Title</Label>
              <Input id="secCaseTitle" value={caseTitle} onChange={(e) => setCaseTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secCasePriority">Priority</Label>
              <Input
                id="secCasePriority"
                value={casePriority}
                onChange={(e) => setCasePriority(e.target.value as typeof casePriority)}
                placeholder="low / medium / high / critical"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secCaseEntity">Target ({caseEntityType})</Label>
              <Input
                id="secCaseEntity"
                value={caseEntityId}
                onChange={(e) => setCaseEntityId(e.target.value)}
                placeholder={caseEntityType === 'ip' ? 'e.g. 203.0.113.10' : 'user UUID'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secCaseNote">Initial note (optional)</Label>
              <Textarea id="secCaseNote" value={caseNote} onChange={(e) => setCaseNote(e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCaseOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={createCaseConfirm}
              disabled={creatingCase || !caseTitle.trim() || !caseEntityId.trim()}
            >
              Create case
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MonitoringLayout>
  )
}
