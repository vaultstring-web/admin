'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { MonitoringLayout } from '@/components/monitoring/MonitoringLayout';
import { DetailDrawer } from '@/components/monitoring/DetailDrawer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCases, getCaseEvents, updateCase, type Case, type CasesFilters, type CaseEvent } from '@/lib/api';

export default function CasesPage() {
  const [items, setItems] = useState<Case[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 25;

  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');

  const filters: CasesFilters = useMemo(() => {
    return {
      q: q.trim() || undefined,
      status: (status.trim() as CasesFilters['status']) || undefined,
      priority: (priority.trim() as CasesFilters['priority']) || undefined,
    };
  }, [q, status, priority]);

  const [selected, setSelected] = useState<Case | null>(null);
  const [events, setEvents] = useState<CaseEvent[]>([]);
  const [eventsTotal, setEventsTotal] = useState(0);

  const fetchList = useCallback(async (pageParam: number = page) => {
    const offset = (pageParam - 1) * limit;
    const res = await getCases(limit, offset, filters);
    if (res.data) {
      setItems(res.data.items || []);
      setTotal(res.data.total || 0);
    } else {
      setItems([]);
      setTotal(0);
    }
  }, [filters, limit, page]);

  const fetchEvents = useCallback(async (caseId: string) => {
    const res = await getCaseEvents(caseId, 50, 0);
    if (res.data) {
      setEvents(res.data.items || []);
      setEventsTotal(res.data.total || 0);
    } else {
      setEvents([]);
      setEventsTotal(0);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      void fetchList(page);
    }, 0);
    return () => clearTimeout(t);
  }, [fetchList, page]);

  useEffect(() => {
    if (!selected) return;
    const t = setTimeout(() => {
      void fetchEvents(selected.id);
    }, 0);
    return () => clearTimeout(t);
  }, [fetchEvents, selected]);

  return (
    <>
      <MonitoringLayout
        title="Cases"
        subtitle="Group suspicious activity into assignable investigations with a full timeline."
        filters={
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="caseSearch">Search</Label>
                <Input
                  id="caseSearch"
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setPage(1);
                  }}
                  placeholder="title / description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="caseStatus">Status</Label>
                <Input
                  id="caseStatus"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                  placeholder="open / investigating / resolved"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="casePriority">Priority</Label>
                <Input
                  id="casePriority"
                  value={priority}
                  onChange={(e) => {
                    setPriority(e.target.value);
                    setPage(1);
                  }}
                  placeholder="low / medium / high / critical"
                />
              </div>
              <Button variant="outline" onClick={() => fetchList(1)}>
                Refresh
              </Button>
            </CardContent>
          </Card>
        }
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Open investigations</CardTitle>
            <div className="text-xs text-muted-foreground font-mono">
              {items.length} / {total}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider">Priority</th>
                    <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider">Status</th>
                    <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider">Title</th>
                    <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider">Entity</th>
                    <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-xs text-muted-foreground">
                        No cases found
                      </td>
                    </tr>
                  ) : (
                    items.map((c) => (
                      <tr
                        key={c.id}
                        className="border-t hover:bg-muted/20 cursor-pointer"
                        onClick={() => setSelected(c)}
                      >
                        <td className="px-3 py-2">
                          <Badge variant="outline">{c.priority}</Badge>
                        </td>
                        <td className="px-3 py-2">
                          <Badge variant="secondary">{c.status}</Badge>
                        </td>
                        <td className="px-3 py-2 font-medium">{c.title}</td>
                        <td className="px-3 py-2 font-mono text-xs">
                          {c.entity_type}:{c.entity_id}
                        </td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">
                          {new Date(c.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between p-3 text-xs text-muted-foreground">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Prev
              </Button>
              <span className="font-mono">
                {page} / {Math.max(1, Math.ceil(total / limit))}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page * limit >= total}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </MonitoringLayout>

      <DetailDrawer
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        title={selected?.title || 'Case'}
        description={selected ? `${selected.entity_type}:${selected.entity_id}` : undefined}
        widthClassName="sm:max-w-3xl"
      >
        {selected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{selected.priority}</Badge>
              <Badge variant="secondary">{selected.status}</Badge>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={async () => {
                  const res = await updateCase(selected.id, { status: 'investigating' });
                  if (res.data) {
                    setSelected(res.data);
                    await fetchList(page);
                    await fetchEvents(selected.id);
                  }
                }}
              >
                Mark investigating
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={async () => {
                  const res = await updateCase(selected.id, { status: 'resolved' });
                  if (res.data) {
                    setSelected(res.data);
                    await fetchList(page);
                    await fetchEvents(selected.id);
                  }
                }}
              >
                Resolve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  const res = await updateCase(selected.id, { status: 'false_positive' });
                  if (res.data) {
                    setSelected(res.data);
                    await fetchList(page);
                    await fetchEvents(selected.id);
                  }
                }}
              >
                False positive
              </Button>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs">Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {events.length === 0 ? (
                  <div className="text-xs text-muted-foreground">No events yet.</div>
                ) : (
                  events.map((e) => (
                    <div key={e.id} className="border rounded-md p-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono">{e.event_type}</span>
                        <span className="text-muted-foreground">{new Date(e.created_at).toLocaleString()}</span>
                      </div>
                      {e.message ? <div className="text-sm mt-1">{e.message}</div> : null}
                    </div>
                  ))
                )}
                <div className="text-[10px] text-muted-foreground">
                  Showing {events.length} of {eventsTotal}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </DetailDrawer>
    </>
  );
}

