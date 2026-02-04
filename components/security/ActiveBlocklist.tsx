"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, ShieldBan } from "lucide-react"
import { BlocklistEntry } from "./types"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface ActiveBlocklistProps {
  entries: BlocklistEntry[]
  page?: number
  total?: number
  limit?: number
  onPageChange?: (page: number) => void
}

export function ActiveBlocklist({ 
  entries,
  page = 1,
  total = 0,
  limit = 5,
  onPageChange
}: ActiveBlocklistProps) {
  const totalPages = Math.ceil(total / limit)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Active Blocklist</CardTitle>
            <CardDescription>
              Currently blocked IPs, emails, and devices.
            </CardDescription>
          </div>
          <Button size="sm" variant="destructive">
            <ShieldBan className="mr-2 h-4 w-4" />
            Add Block Entry
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {entries.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-4">
              No active blocks.
            </div>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                    <ShieldBan className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{entry.value}</p>
                      <Badge variant="secondary" className="uppercase text-[10px]">
                        {entry.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Reason: {entry.reason}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}

          {onPageChange && total > 0 && (
            <div className="flex items-center justify-center pt-2">
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
