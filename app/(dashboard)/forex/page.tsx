'use client'

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRightLeft, RefreshCw } from "lucide-react"
import { API_BASE } from "@/lib/constants"

export default function ForexPage() {
  const [rates, setRates] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [amount, setAmount] = useState<string>("1000")
  const [from, setFrom] = useState<string>("MWK")
  const [to, setTo] = useState<string>("CNY")
  const [conversion, setConversion] = useState<{ converted_amount: string; rate: string } | null>(null)
  const [converting, setConverting] = useState(false)

  useEffect(() => {
    const fetchRates = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("vs_token") : null
        const res = await fetch(`${API_BASE}/forex/rates`, {
          headers: token ? { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          } : { 'Content-Type': 'application/json' },
          credentials: 'include',
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || `Fetch failed (${res.status})`)
        }
        const data = await res.json()
        const apiRates = Array.isArray(data.rates) ? data.rates : []
        setRates(apiRates)
      } catch (err: any) {
        setError(err?.message || "Failed to load rates")
        setRates([])
      } finally {
        setLoading(false)
      }
    }
    fetchRates()
  }, [])

  const handleRefresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("vs_token") : null
      const res = await fetch(`${API_BASE}/forex/rates`, {
        headers: token ? { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        } : { 'Content-Type': 'application/json' },
        credentials: 'include',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Fetch failed (${res.status})`)
      }
      const data = await res.json()
      const apiRates = Array.isArray(data.rates) ? data.rates : []
      setRates(apiRates)
    } catch (err: any) {
      setError(err?.message || "Failed to refresh rates")
      setRates([])
    } finally {
      setLoading(false)
    }
  }

  const handleConvert = async () => {
    setConverting(true)
    setError(null)
    setConversion(null)
    try {
      const amt = parseFloat(amount)
      const res = await fetch(`${API_BASE}/forex/calculate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ amount: amt, from, to }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Conversion failed (${res.status})`)
      }
      const data = await res.json()
      setConversion({
        converted_amount: typeof data.converted_amount === "string" ? data.converted_amount : String(data.converted_amount),
        rate: typeof data.rate === "string" ? data.rate : String(data.rate),
      })
    } catch (err: any) {
      setError(err?.message || "Conversion failed")
    } finally {
      setConverting(false)
    }
  }

  const formattedRates = useMemo(() => {
    return rates.map((r) => {
      const base = r.base_currency || r.BaseCurrency
      const target = r.target_currency || r.TargetCurrency
      const rate = r.rate || r.Rate
      const buy = r.buy_rate || r.BuyRate
      const sell = r.sell_rate || r.SellRate
      const source = r.source || r.Source
      const ts = r.valid_from || r.ValidFrom
      return {
        pair: `${String(base)}→${String(target)}`,
        rate: typeof rate === "string" ? rate : String(rate),
        buyRate: typeof buy === "string" ? buy : String(buy),
        sellRate: typeof sell === "string" ? sell : String(sell),
        source: String(source || ""),
        time: ts ? new Date(ts).toLocaleString() : "",
      }
    })
  }, [rates])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Forex Rates</h1>
          <p className="mt-2 text-muted-foreground">Live foreign exchange rates and conversion</p>
        </div>
        <Button onClick={handleRefresh} disabled={loading} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pair</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Buy</TableHead>
              <TableHead>Sell</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {formattedRates.map((r, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-mono">{r.pair}</TableCell>
                <TableCell className="font-mono">{r.rate}</TableCell>
                <TableCell className="font-mono">{r.buyRate}</TableCell>
                <TableCell className="font-mono">{r.sellRate}</TableCell>
                <TableCell>{r.source}</TableCell>
                <TableCell>{r.time}</TableCell>
              </TableRow>
            ))}
            {formattedRates.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  {loading ? "Loading..." : error ? error : "No rates available"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableCaption>Rates are indicative and include spread</TableCaption>
        </Table>
      </Card>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="md:col-span-2">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
            />
          </div>
          <div>
            <Select value={from} onValueChange={setFrom}>
              <SelectTrigger>
                <SelectValue placeholder="From" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MWK">MWK</SelectItem>
                <SelectItem value="CNY">CNY</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={to} onValueChange={setTo}>
              <SelectTrigger>
                <SelectValue placeholder="To" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MWK">MWK</SelectItem>
                <SelectItem value="CNY">CNY</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex">
            <Button onClick={handleConvert} disabled={converting} className="w-full gap-2">
              <ArrowRightLeft className="h-4 w-4" />
              Convert
            </Button>
          </div>
        </div>
        {conversion && (
          <div className="mt-3 text-sm">
            <span className="text-muted-foreground">Converted Amount:</span>{" "}
            <span className="font-mono">{conversion.converted_amount}</span>{" "}
            <span className="text-muted-foreground">Rate:</span>{" "}
            <span className="font-mono">{conversion.rate}</span>
          </div>
        )}
        {!conversion && error && (
          <div className="mt-3 text-sm text-destructive">{error}</div>
        )}
      </Card>
    </div>
  )
}
