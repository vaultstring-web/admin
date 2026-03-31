"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, ShieldAlert, Search } from "lucide-react"
import { SecurityEvent } from "./types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { downloadCsv } from "@/lib/csv"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SecurityEventsTableProps {
  events: SecurityEvent[]
  page?: number
  total?: number
  limit?: number
  onPageChange?: (page: number) => void
  search?: string
  onSearchChange?: (value: string) => void
  onUpdateStatus?: (eventId: string, status: string) => void
  onBlock?: (type: 'ip' | 'user', value: string, reason: string) => void
  onSelectTarget?: (target: { ip?: string; user_id?: string }) => void
  onCreateCase?: (event: SecurityEvent) => void
}

type SeverityVariant = 'destructive' | 'secondary' | 'outline'

export function SecurityEventsTable({ 
  events,
  page = 1,
  total = 0,
  limit = 10,
  onPageChange,
  search = '',
  onSearchChange,
  onUpdateStatus,
  onBlock,
  onSelectTarget,
  onCreateCase
}: SecurityEventsTableProps) {
  const getSeverityColor = (severity: string): SeverityVariant => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive'; // fallback
      case 'medium': return 'secondary'; // fallback/warning usually
      case 'low': return 'outline';
      default: return 'outline';
    }
  }

  const getEventType = (event: SecurityEvent) => (event.event_type || event.type || 'unknown') as string
  const getIPAddress = (event: SecurityEvent) => (event.ip_address || '') as string
  const getUserID = (event: SecurityEvent) => (event.user_id || '') as string

  const totalPages = Math.ceil(total / limit)

  const exportCsv = () => {
    const rows = events.map((event) => {
      const eventType = getEventType(event)
      return {
        id: event.id,
        event_type: eventType,
        severity: event.severity,
        status: event.status,
        user_id: getUserID(event),
        user_email: event.user_email || '',
        ip_address: getIPAddress(event),
        created_at: event.created_at,
      }
    })
    downloadCsv(
      rows,
      [
        { key: "id", header: "ID" },
        { key: "event_type", header: "Event type" },
        { key: "severity", header: "Severity" },
        { key: "status", header: "Status" },
        { key: "user_id", header: "User ID" },
        { key: "user_email", header: "User email" },
        { key: "ip_address", header: "IP address" },
        { key: "created_at", header: "Created at" },
      ],
      `security-events-${new Date().toISOString().slice(0, 10)}.csv`
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Security Events</CardTitle>
            <CardDescription>
              Recent security alerts and suspicious activities.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                className="pl-8 w-[250px]"
                value={search}
                onChange={(e) => onSearchChange?.(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" onClick={exportCsv} disabled={events.length === 0}>
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Target (User/IP)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No events found.
                  </TableCell>
                </TableRow>
              ) : (
                events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                        {getEventType(event).replace(/_/g, ' ').toUpperCase()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getSeverityColor(event.severity)}>
                        {event.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <button
                          type="button"
                          className="text-left text-sm hover:underline disabled:no-underline disabled:opacity-60"
                          disabled={!getUserID(event)}
                          onClick={() => onSelectTarget?.({ user_id: getUserID(event) })}
                          title={getUserID(event) ? `Filter by user ${getUserID(event)}` : undefined}
                        >
                          {event.user_email || 'Unknown User'}
                        </button>
                        <button
                          type="button"
                          className="text-left text-xs text-muted-foreground hover:underline disabled:no-underline disabled:opacity-60"
                          disabled={!getIPAddress(event)}
                          onClick={() => onSelectTarget?.({ ip: getIPAddress(event) })}
                          title={getIPAddress(event) ? `Filter by IP ${getIPAddress(event)}` : undefined}
                        >
                          {getIPAddress(event) || '—'}
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {event.status.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(event.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>Quick actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => onUpdateStatus?.(event.id, 'investigating')}>
                            Mark investigating
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUpdateStatus?.(event.id, 'resolved')}>
                            Mark resolved
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUpdateStatus?.(event.id, 'false_positive')}>
                            Mark false positive
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onCreateCase?.(event)}>
                            Create case
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              const ip = getIPAddress(event)
                              if (ip) onBlock?.('ip', ip, `blocked from event ${event.id}`)
                            }}
                            disabled={!getIPAddress(event)}
                          >
                            Block IP
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              const userId = getUserID(event)
                              if (userId) onBlock?.('user', userId, `blocked from event ${event.id}`)
                            }}
                            disabled={!getUserID(event)}
                          >
                            Block user
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {onPageChange && total > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {Math.min(limit, events.length)} of {total} events
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page > 1) onPageChange(page - 1);
                      }}
                      className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive onClick={(e) => e.preventDefault()}>
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page < totalPages) onPageChange(page + 1);
                      }}
                      className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
