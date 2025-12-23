"use client";

import React, { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectGroup,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { SimplifiedMerchant } from "./constants";

// Define props interface
interface MerchantListProps {
  merchants?: SimplifiedMerchant[];
  onSelectMerchant?: (id: string) => void;
}

// Default generate function (used if no merchants are provided)
function makeMock(n = 24): SimplifiedMerchant[] {
  const categories = ["Retail", "Services", "Food", "Travel", "SaaS"];
  const statuses: SimplifiedMerchant["verificationStatus"][] = [
    "pending",
    "approved",
    "rejected",
  ];
  const accounts: SimplifiedMerchant["accountStatus"][] = ["active", "suspended"];

  return Array.from({ length: n }).map((_, i) => ({
    id: `M-${1000 + i}`,
    businessName: `Merchant ${i + 1}`,
    registrationDate: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
    verificationStatus: statuses[i % statuses.length],
    accountStatus: accounts[i % accounts.length],
    category: categories[i % categories.length],
    contact: `contact+${i}@example.com`,
    email: `contact+${i}@example.com`,
    phone: `+1 (555) ${1000 + i.toString().padStart(4, '0')}`,
    riskScore: Math.floor(Math.random() * 100)
  }));
}

export default function MerchantList({ 
  merchants, 
  onSelectMerchant 
}: MerchantListProps = {}) {
  const [query, setQuery] = useState("");
  const [verificationFilter, setVerificationFilter] = useState<string>("all");
  const [accountFilter, setAccountFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const perPage = 10;

  // Use provided merchants or generate mock data
  const data = useMemo(() => merchants || makeMock(56), [merchants]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.filter((m) => {
      if (
        verificationFilter !== "all" &&
        m.verificationStatus !== verificationFilter
      )
        return false;
      if (accountFilter !== "all" && m.accountStatus !== accountFilter)
        return false;
      if (categoryFilter !== "all" && m.category !== categoryFilter)
        return false;
      if (!q) return true;
      return (
        m.businessName.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        m.contact.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q)
      );
    });
  }, [data, query, verificationFilter, accountFilter, categoryFilter]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const visible = filtered.slice((page - 1) * perPage, page * perPage);

  // Handle view action
  const handleViewMerchant = (id: string) => {
    if (onSelectMerchant) {
      // Use the provided callback if available
      onSelectMerchant(id);
    } else {
      // Default behavior: navigate to merchant detail page
      window.location.href = `/dashboard/merchants/${id}`;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Merchant Management
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage merchant accounts, verifications, and settlements
        </p>
      </div>

      <Card className="p-4">
        <div className="flex gap-3 flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex gap-2 w-full md:w-1/2">
            <Input
              aria-label="Search merchants"
              placeholder="Search by name, ID, email or phone"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
            <Button
              variant="outline"
              onClick={() => {
                setQuery("");
                setVerificationFilter("all");
                setAccountFilter("all");
                setCategoryFilter("all");
                setPage(1);
              }}
            >
              Clear
            </Button>
          </div>

          <div className="flex gap-2 items-center">
            <Select
              value={verificationFilter}
              onValueChange={(v) => {
                setVerificationFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger
                size="sm"
                aria-label="Filter by verification status"
              >
                <SelectValue>
                  {verificationFilter === "all"
                    ? "Verification: All"
                    : `Verification: ${verificationFilter}`}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              value={accountFilter}
              onValueChange={(v) => {
                setAccountFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger size="sm" aria-label="Filter by account status">
                <SelectValue>
                  {accountFilter === "all"
                    ? "Account: All"
                    : `Account: ${accountFilter}`}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              value={categoryFilter}
              onValueChange={(v) => {
                setCategoryFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger size="sm" aria-label="Filter by category">
                <SelectValue>
                  {categoryFilter === "all"
                    ? "Category: All"
                    : `Category: ${categoryFilter}`}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                  <SelectItem value="Services">Services</SelectItem>
                  <SelectItem value="Food">Food</SelectItem>
                  <SelectItem value="Travel">Travel</SelectItem>
                  <SelectItem value="SaaS">SaaS</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Merchant ID</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.businessName}</TableCell>
                  <TableCell className="font-mono text-sm">{m.id}</TableCell>
                  <TableCell>{m.registrationDate}</TableCell>
                  <TableCell>
                    <span
                      role="status"
                      aria-label={`Verification status: ${m.verificationStatus}`}
                      className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{
                        backgroundColor:
                          m.verificationStatus === "approved"
                            ? "var(--color-success-bg)"
                            : m.verificationStatus === "rejected"
                            ? "var(--color-error-bg)"
                            : "var(--color-warning-bg)",
                        color:
                          m.verificationStatus === "approved"
                            ? "var(--color-success-foreground)"
                            : m.verificationStatus === "rejected"
                            ? "var(--color-error-foreground)"
                            : "var(--color-warning-foreground)",
                      }}
                    >
                      {m.verificationStatus}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      role="status"
                      aria-label={`Account status: ${m.accountStatus}`}
                      className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{
                        backgroundColor:
                          m.accountStatus === "active"
                            ? "var(--color-success-bg-weak)"
                            : "var(--color-error-bg)",
                        color:
                          m.accountStatus === "active"
                            ? "var(--color-success-foreground)"
                            : "var(--color-error-foreground)",
                      }}
                    >
                      {m.accountStatus}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewMerchant(m.id)}
                      aria-label={`View details for ${m.businessName}`}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableCaption>
              {total} merchants — page {page} of {pages}
            </TableCaption>
          </Table>

          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {(page - 1) * perPage + 1}–
              {Math.min(page * perPage, total)} of {total}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}